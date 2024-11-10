const CACHE_NAME = "vnve-cache";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  const url = event.request.url;

  if (url.startsWith("https://s/")) {
    event.respondWith(handleFetch(event));
  }

  // 匹配当前域名下的html, js, css, image, audio资源
  const shouldCache =
    url.startsWith(self.location.origin) &&
    /\.(html|js|css|png|jpg|jpeg|gif|webp|mp3|wav|aac|m4a)$/.test(url);

  if (shouldCache) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });

            // 如果index.html请求出现更新，发送refresh事件
            if (networkResponse.url.endsWith("index.html")) {
              self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                  client.postMessage({ action: "refresh" });
                });
              });
            }
          }

          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      }),
    );
  }
});

function getAssetSource(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vnve2");
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["assetSource"], "readonly");
      const objectStore = transaction.objectStore("assetSource");
      const request = objectStore.get(id);
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
    };

    request.onerror = function (event) {
      reject(event);
    };
  });
}

async function handleFetch(event) {
  const url = event.request.url;
  const idMatch = url.match(/https:\/\/s\/(\d+)\.\w+/);
  const id = idMatch ? idMatch[1] : null;
  let assetSource;

  if (id) {
    assetSource = await getAssetSource(+id);
  }

  if (assetSource) {
    return new Response(assetSource.blob, {
      headers: { "Content-Type": assetSource.mime },
    });
  }

  // 如果没有找到资源，返回一个404响应
  return new Response("Not Found", { status: 404 });
}

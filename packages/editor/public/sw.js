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

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            throw new Error("response is not ok");
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return (
              cachedResponse || new Response("网络异常请重试", { status: 503 })
            );
          });
        }),
    );
  }

  const shouldCache =
    url.startsWith(self.location.origin) &&
    /\.(js|css|png|jpg|jpeg|gif|webp|mp3|wav|aac|m4a)$/.test(url);

  if (shouldCache) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
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
    // 获取Range请求头
    const range = event.request.headers.get("Range");

    if (!range) {
      // 如果不是Range请求，返回完整响应
      return new Response(assetSource.blob, {
        headers: {
          "Content-Type": assetSource.mime,
          "Content-Length": assetSource.blob.size,
          "Accept-Ranges": "bytes",
        },
      });
    }

    // 解析Range头
    const matches = range.match(/bytes=(\d+)-(\d+)?/);
    const start = parseInt(matches[1], 10);
    const end = matches[2]
      ? parseInt(matches[2], 10)
      : assetSource.blob.size - 1;

    // 从Blob中截取指定范围的数据
    const slicedBlob = assetSource.blob.slice(start, end + 1);

    // 返回206部分内容响应
    return new Response(slicedBlob, {
      status: 206,
      headers: {
        "Content-Type": assetSource.mime,
        "Content-Length": slicedBlob.size,
        "Content-Range": `bytes ${start}-${end}/${assetSource.blob.size}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  return new Response("Not Found", { status: 404 });
}

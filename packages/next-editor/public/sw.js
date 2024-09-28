// 从名为vnve2的indexdb数据库中获取数据, 取出assetSource中id为1的数据
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

self.addEventListener("fetch", function (event) {
  const url = event.request.url;

  if (url.startsWith("https://s/")) {
    event.respondWith(handleFetch(event));
  }
});

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

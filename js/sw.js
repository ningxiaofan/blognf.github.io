// const cacheDomain = [
//   "fonts.googleapis.com",
//   "npm.webcache.cn",
//   "unpkg.com",
//   "fastly.jsdelivr.net",
//   "cdn.jsdelivr.net",
// ];

// // 安装时预加载必要内容
// self.addEventListener("install", (event) => {
//   console.log(`Service Worker ${VERSION} installing.`);
//   event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(preCache)));
// });

// async function cacheRequest(request, options) {
//   try {
//     const responseToCache = await fetch(request);
//     const cache = await caches.open(VERSION);
//     if (!/^https?:$/i.test(new URL(request.url).protocol))
//       return responseToCache;
//     cache.put(request, responseToCache.clone());
//     return responseToCache;
//   } catch (e) {
//     const responseToCache = await fetch(request, options);
//     const cache = await caches.open(VERSION);
//     if (!/^https?:$/i.test(new URL(request.url).protocol))
//       return responseToCache;
//     cache.put(request, responseToCache.clone());
//     return responseToCache;
//   }
// }

// async function respondRequest(request, options) {
//   const response = await caches.match(request);
//   if (response) {
//     return response;
//   }
//   return cacheRequest(request, options);
// }

// self.addEventListener("fetch", (event) => {
//   const url = new URL(event.request.url);
//   // 检查请求的域名是否在 CacheDomain 中
//   if (cacheDomain.includes(url.hostname)) {
//     event.respondWith(respondRequest(event.request));
//   } else {
//     // 检查请求是否为 POST 或带有查询参数的 GET 这样可避免错误缓存
//     if (
//       event.request.method === "POST" ||
//       (event.request.method === "GET" && url.search)
//     ) {
//       try {
//         event.respondWith(fetch(event.request));
//       } catch (e) {
//         event.respondWith(fetch(event.request, { mode: "no-cors" }));
//       }
//     } else {
//       event.respondWith(respondRequest(event.request, { mode: "no-cors" }));
//     }
//   }
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (VERSION !== cacheName) {
//             console.log(`Service Worker: deleting old cache ${cacheName}`);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
//   console.log(`Service Worker ${VERSION} activated.`);
// });

// self.addEventListener("message", (event) => {
//   console.log("Service Worker: message received");
//   if (event.data === "skipWaiting") {
//     self.skipWaiting();
//   }
// });




//更改后的
const cacheDomain = [
  "fonts.googleapis.com",
  "npm.webcache.cn",
  "unpkg.com",
  "fastly.jsdelivr.net",
  "cdn.jsdelivr.net",
];

// 安装时预加载必要内容
self.addEventListener("install", (event) => {
  console.log(`Service Worker ${VERSION} installing.`);
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(preCache)));
});

async function cacheRequest(request, options) {
  try {
    const responseToCache = await fetch(request);
    const cache = await caches.open(VERSION);
    if (!/^https?:$/i.test(new URL(request.url).protocol))
      return responseToCache;
    cache.put(request, responseToCache.clone());
    return responseToCache;
  } catch (e) {
    const responseToCache = await fetch(request, options);
    const cache = await caches.open(VERSION);
    if (!/^https?:$/i.test(new URL(request.url).protocol))
      return responseToCache;
    cache.put(request, responseToCache.clone());
    return responseToCache;
  }
}

async function respondRequest(request, options) {
  const response = await caches.match(request);
  if (response) {
    return response;
  }
  return cacheRequest(request, options);
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 对于缓存域名的请求，使用缓存策略
  if (cacheDomain.includes(url.hostname)) {
    event.respondWith(respondRequest(event.request));
  } else {
    // 对于非缓存域名的跨域请求，直接转发而不干预
    // 让服务器返回正确的 CORS 头部
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Fetch failed:', error);
        return new Response(JSON.stringify({
          error: 'Network request failed',
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (VERSION !== cacheName) {
            console.log(`Service Worker: deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log(`Service Worker ${VERSION} activated.`);
});

self.addEventListener("message", (event) => {
  console.log("Service Worker: message received");
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

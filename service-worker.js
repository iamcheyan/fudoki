// 通过版本化缓存名确保每次发布都能清理旧缓存
const SW_VERSION = 'v2025-10-04';
const CACHE_NAME = `fudoki-cache-${SW_VERSION}`;

// 判定是否为页面导航或核心资源（必须优先走网络以获取最新逻辑）
function isNavigationRequest(request) {
  const accept = request.headers && request.headers.get('accept');
  return request.mode === 'navigate' || (accept && accept.includes('text/html'));
}

function isCoreAsset(urlStr) {
  try {
    const url = new URL(urlStr);
    const p = url.pathname;
    return p === '/' || p.endsWith('/index.html') ||
           p.endsWith('/static/main-js.js') ||
           p.endsWith('/static/styles.css');
  } catch (_) {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  // 页面与核心脚本样式：优先网络，失败回退缓存
  if (isNavigationRequest(event.request) || isCoreAsset(event.request.url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(new Request(event.request, { cache: 'reload' }));
        if (response && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await cache.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // 其它静态资源：stale-while-revalidate（先用缓存，同时后台更新）
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    const networkPromise = fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type !== 'opaque') {
        cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => null);

    if (cached) {
      // 后台更新，不阻塞当前响应
      event.waitUntil(networkPromise);
      return cached;
    }

    const network = await networkPromise;
    if (network) return network;
    // 没有网络且没有缓存，返回失败响应
    return cached || Response.error();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'CACHE_ASSETS') {
    return;
  }

  const assets = Array.isArray(data.assets) ? data.assets : [];
  const requestId = data.requestId;

  event.waitUntil(cacheAssetsSequentially(assets, requestId, event.source));
});

async function cacheAssetsSequentially(assets, requestId, source) {
  const total = assets.length;
  const client = source ? await getClient(source.id) : null;
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  for (const rawAsset of assets) {
    const assetUrl = new URL(rawAsset, self.registration.scope).toString();
    try {
      // 打印当前正在缓存的文件
      console.log('[PWA] Caching asset:', assetUrl);
      
      // 检查文件大小，对大文件使用特殊处理
      const fileSize = await getFileSize(assetUrl);
      console.log('[PWA] File size:', fileSize, 'bytes');
      
      const request = new Request(assetUrl, { 
        cache: 'reload', 
        mode: 'same-origin', 
        credentials: 'same-origin'
      });
      
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // 对于大文件（>50MB），使用流式处理
      if (fileSize > 50 * 1024 * 1024) {
        console.log('[PWA] Large file detected, using stream processing');
        await cacheLargeFile(request, response.clone());
      } else {
        await cache.put(request, response.clone());
      }
      
      completed += 1;
      console.log('[PWA] Cached:', assetUrl);
      await notifyClient(client, {
        type: 'CACHE_PROGRESS',
        status: 'cached',
        asset: assetUrl,
        completed,
        total,
        requestId
      });
    } catch (error) {
      console.error('[PWA] Cache error:', assetUrl, error && error.message ? error.message : error);
      await notifyClient(client, {
        type: 'CACHE_PROGRESS',
        status: 'error',
        asset: assetUrl,
        completed,
        total,
        requestId,
        message: error.message || 'failed'
      });
    }
  }

  await notifyClient(client, {
    type: 'CACHE_COMPLETE',
    completed,
    total,
    requestId
  });
}

async function getClient(id) {
  if (!id) return null;
  try {
    return await self.clients.get(id);
  } catch (error) {
    return null;
  }
}

async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch (error) {
    console.warn('[PWA] Could not get file size:', url, error);
    return 0;
  }
}

async function cacheLargeFile(request, response) {
  const cache = await caches.open(CACHE_NAME);
  
  // 对于大文件，尝试分块处理
  try {
    // 先尝试直接缓存
    await cache.put(request, response);
    console.log('[PWA] Large file cached successfully');
  } catch (error) {
    console.warn('[PWA] Direct cache failed for large file, trying alternative approach');
    
    // 如果直接缓存失败，尝试流式处理
    const reader = response.body.getReader();
    const chunks = [];
    let totalSize = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        totalSize += value.length;
        
        // 每处理 10MB 打印一次进度
        if (totalSize % (10 * 1024 * 1024) === 0) {
          console.log('[PWA] Processed', Math.round(totalSize / 1024 / 1024), 'MB');
        }
      }
      
      // 重新构建响应
      const body = new ReadableStream({
        start(controller) {
          chunks.forEach(chunk => controller.enqueue(chunk));
          controller.close();
        }
      });
      
      const newResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      await cache.put(request, newResponse);
      console.log('[PWA] Large file cached with stream processing');
    } catch (streamError) {
      console.error('[PWA] Stream processing failed:', streamError);
      throw streamError;
    }
  }
}

async function notifyClient(client, message) {
  if (!client) {
    const all = await self.clients.matchAll({ includeUncontrolled: true });
    all.forEach((c) => c.postMessage(message));
    return;
  }
  client.postMessage(message);
}

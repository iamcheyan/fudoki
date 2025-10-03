const CACHE_NAME = 'fudoki-cache-v1';

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

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) {
      return cached;
    }
    try {
      const response = await fetch(event.request);
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
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
      const request = new Request(assetUrl, { cache: 'reload', mode: 'same-origin', credentials: 'same-origin' });
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      await cache.put(request, response.clone());
      completed += 1;
      await notifyClient(client, {
        type: 'CACHE_PROGRESS',
        status: 'cached',
        asset: assetUrl,
        completed,
        total,
        requestId
      });
    } catch (error) {
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

async function notifyClient(client, message) {
  if (!client) {
    const all = await self.clients.matchAll({ includeUncontrolled: true });
    all.forEach((c) => c.postMessage(message));
    return;
  }
  client.postMessage(message);
}

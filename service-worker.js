/*
  Service Worker for Fudoki4Web
  - Robust cache management with versioned prefix
  - Navigation requests use network-first with offline fallback
  - Static assets use cache-first with background refresh
  - Message protocol compatible with UI: CACHE_ASSETS, CACHE_PROGRESS, CACHE_COMPLETE, PWA_RESET
*/
'use strict';

const CACHE_PREFIX = 'fudoki-cache';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

// Resolve fallback HTML relative to SW scope
const FALLBACK_HTML_URL = new URL('index.html', self.registration.scope).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Only remove caches for our prefix that are not the current name
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol.startsWith('chrome-extension')) return;

  // Navigation requests: prefer network, fallback to cached HTML
  if (isNavigationRequest(event)) {
    event.respondWith(networkFirst(req, FALLBACK_HTML_URL));
    return;
  }

  // Only handle same-origin asset requests
  if (!isSameOrigin(req)) return;

  event.respondWith(cacheFirst(req));
});

// Message protocol for controlled caching and reset
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'PWA_RESET') {
    event.waitUntil(handleCacheReset(data, event.source));
    return;
  }

  if (data.type !== 'CACHE_ASSETS') return;

  const assets = Array.isArray(data.assets) ? data.assets : [];
  const requestId = data.requestId;
  event.waitUntil(cacheAssetsSequentially(assets, requestId, event.source));
});

// ===== Strategies =====
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (shouldCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback to any cached response if available
    const fallback = await cache.match(request, { ignoreSearch: true });
    if (fallback) return fallback;
    throw error;
  }
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (shouldCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback to cached HTML or the request itself
    const htmlReq = new Request(fallbackUrl, { credentials: 'same-origin' });
    const cachedHtml = await cache.match(htmlReq, { ignoreSearch: true });
    if (cachedHtml) return cachedHtml;
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

function isNavigationRequest(event) {
  const request = event.request;
  const accept = request.headers.get('accept') || '';
  return request.mode === 'navigate' || accept.includes('text/html');
}

function isSameOrigin(request) {
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
  } catch {
    return false;
  }
}

function shouldCacheResponse(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

// ===== Controlled caching via messages =====
async function handleCacheReset(data, source) {
  const requestId = data.requestId;
  const prefix = typeof data.cachePrefix === 'string' && data.cachePrefix.length ? data.cachePrefix : null;
  const client = source ? await getClient(source.id) : null;

  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => (prefix ? key.startsWith(prefix) : true))
        .map((key) => caches.delete(key))
    );

    await notifyClient(client, { type: 'PWA_RESET_DONE', requestId });
  } catch (error) {
    await notifyClient(client, {
      type: 'PWA_RESET_FAILED',
      requestId,
      message: error?.message || 'reset failed'
    });
  }
}

async function cacheAssetsSequentially(assets, requestId, source) {
  const total = assets.length;
  const client = source ? await getClient(source.id) : null;
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;

  for (const rawAsset of assets) {
    // Normalize against SW scope, ensures same-origin path resolution
    const assetUrl = new URL(rawAsset, self.registration.scope).toString();
    try {
      // Informational logging for debugging large assets
      console.log('[PWA] Caching asset:', assetUrl);

      const fileSize = await getFileSize(assetUrl);
      console.log('[PWA] File size:', fileSize, 'bytes');

      const request = new Request(assetUrl, { cache: 'reload', mode: 'same-origin', credentials: 'same-origin' });
      const response = await fetch(request);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
        message: error?.message || 'failed'
      });
    }
  }

  await notifyClient(client, { type: 'CACHE_COMPLETE', completed, total, requestId });
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
  try {
    await cache.put(request, response);
    console.log('[PWA] Large file cached successfully');
  } catch (error) {
    console.warn('[PWA] Direct cache failed for large file, trying alternative approach');

    const reader = response.body?.getReader ? response.body.getReader() : null;
    if (!reader) {
      // Fallback: if body is not readable stream, attempt a normal put again
      await cache.put(request, response);
      return;
    }

    const chunks = [];
    let totalSize = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalSize += value.length;
        if (totalSize % (10 * 1024 * 1024) === 0) {
          console.log('[PWA] Processed', Math.round(totalSize / 1024 / 1024), 'MB');
        }
      }

      const body = new ReadableStream({
        start(controller) {
          chunks.forEach((chunk) => controller.enqueue(chunk));
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
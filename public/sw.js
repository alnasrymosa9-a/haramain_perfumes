/* ===== Service Worker — الحرمين للعود والعطور ===== */

const CACHE = 'haramain-v3';
const STATIC = ['/', '/index.html', '/manifest.json'];

/* ── Install ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener('fetch', e => {
  const { request } = e;

  // تجاهل طلبات غير GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // ❌ لا تُخزّن Supabase أبداً — البيانات يجب أن تكون حية دائماً
  if (url.hostname.includes('supabase.co')) return;

  // ❌ لا تُخزّن Google Fonts — تتحكم في التحديث بنفسها
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) return;

  // ❌ لا تُخزّن Chrome Extension requests
  if (url.protocol === 'chrome-extension:') return;

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // خزّن فقط الاستجابات الناجحة من نفس الأصل
        if (
          response.ok &&
          response.type === 'basic' &&
          !url.pathname.includes('/api/')
        ) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => {
        // للتنقل بين الصفحات فقط — أعد index.html
        if (request.mode === 'navigate') {
          return caches.match('/index.html') ?? new Response('Offline', { status: 503 });
        }
        return new Response('', { status: 408 });
      });
    })
  );
});

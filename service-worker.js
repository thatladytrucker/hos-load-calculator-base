/*
  © 2025 ArtsnCrabs / Toya Cramsey
  HOS Load Calculator (PWA Version)
  All rights reserved.

  This software and all included logic are protected by copyright.
  Unauthorized reproduction, modification, or distribution is prohibited.
*/
const CACHE='hoslc-v1';
const ASSETS=[
  './',
  'index.html',
  'app.js',                // <--- Add app.js so your math works offline!
  'manifest.webmanifest',
  'icons/icon-180.png',    // <--- Changed 'app-' to 'icon-' to match manifest
  'icons/icon-192.png',
  'icons/icon-512.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
    const copy = res.clone();
    caches.open(CACHE).then(c=>c.put(e.request, copy));
    return res;
  }).catch(()=>caches.match('./'))));
});

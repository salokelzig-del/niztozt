// Service worker mínimo para que Rega sea instalable como app (PWA).
// No cachea nada especial: solo habilita la instalación y deja pasar la red.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Dejar que el navegador maneje las peticiones normalmente.
});

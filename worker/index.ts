declare let self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const title = data.title || 'SAMEX Notificação';
      const options: NotificationOptions = {
        body: data.message || data.body || 'Você tem uma nova notificação',
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.link || '/portal'
        },
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Falha ao parsear JSON, tenta mostrar como texto
      const title = 'SAMEX Notificação';
      const options = {
        body: event.data.text(),
        icon: '/icon-192x192.png',
      };
      event.waitUntil(self.registration.showNotification(title, options));
    }
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/portal';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Verifica se já existe uma aba aberta com essa URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova janela/aba
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

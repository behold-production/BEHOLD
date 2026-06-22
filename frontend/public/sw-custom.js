// Custom Service Worker script to handle push notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Determine click destination URL, falling back to origin root
  const urlToOpen = new URL(
    (event.notification.data && event.notification.data.onClickUrl) || '/',
    self.location.origin
  ).toString();

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // 1. If a tab is already open at the exact destination URL, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. Otherwise, if there is any open tab of our app, navigate it and focus
      if (windowClients.length > 0) {
        const client = windowClients[0];
        if ('navigate' in client && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // 3. Otherwise, open a new tab/window at the destination URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

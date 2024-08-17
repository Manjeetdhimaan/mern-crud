self.addEventListener('push', event => {
    console.log('push event', event)
    const options = {
      body: event.data.text(),
      icon: '/assets/favicon.png'
    }
    event.waitUntil(self.registration.showNotification('Helpdesk'))
  })
  
  self.addEventListener('notificationclick', function (event) {
    console.log('notificationclick event', event)
    const url = location.origin + '/tickets/' + event.notification.data.url
    event.notification.close() // Close the notification
  
    event.waitUntil(
      // eslint-disable-next-line no-undef
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window/tab with the target URL
        // eslint-disable-next-line no-undef
        if (clients.openWindow) {
          // eslint-disable-next-line no-undef
          return clients.openWindow(url)
        }
      })
    )
  })
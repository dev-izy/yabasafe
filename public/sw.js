// YabaSafe Alert service worker: shows push notifications and opens the app when tapped.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "YabaSafe Alert", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "YabaSafe Alert";
  const options = {
    body: data.body || "",
    icon: "/icons/192",
    badge: "/icons/192",
    data: { url: data.url || "/app" },
  };
  if (data.tag) {
    options.tag = data.tag;
    options.renotify = true;
  }
  if (data.urgent) {
    options.requireInteraction = true;
    options.vibrate = [300, 150, 300, 150, 600];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        try {
          if ("navigate" in client) await client.navigate(url);
          return await client.focus();
        } catch {
          // fall through and open a new window
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
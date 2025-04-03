self.addEventListener("install", (event) => {
    console.log("Service Worker Installed.");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker Activated.");
    return self.clients.claim();
});

// ✅ Handle Push Event
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.text() : "💧 Time to drink water!";
    event.waitUntil(
        self.registration.showNotification("💧 Water Reminder", {
            body: data,
            icon: "images/done.png",
            vibrate: [200, 100, 200],
            tag: "water-reminder",
        })
    );
});

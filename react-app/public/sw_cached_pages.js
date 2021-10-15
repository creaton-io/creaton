
// This enables events for the installation of our PWA

// Call Install Event
self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
});

// Call Activate Event 
self.addEventListener('activate', e => {
    console.log('Service Worker: Activated');
});




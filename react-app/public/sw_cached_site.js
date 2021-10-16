
// This enables events for the installation of our PWA

const cacheName = 'v2';

// Call Install Event
self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');

    // Tells the browser to wait until our promise is finished
    e.waitUntil(
        caches
        .open(cacheName)
        .then(cache => {
            console.log("Service Worker: Caching Files");
            cache.addAll(cacheAssets);
        })
        .then(() => self.skipWaiting())
    );
});

// Call Activate Event 
self.addEventListener('activate', e => {
    console.log('Service Worker: Activated');

    // Remove unwanted caches 
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('Service Worker: clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    );
});


// Call Fetch Event 
self.addEventListener('fetch', e => {
    console.log('Service Worker: Fetching');

    // Check if live site is available
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // make copy/clone of response 
                const resClone = res.clone();

                // Open cache 
                caches 
                    .open(cacheName)
                    .then(cache => {

                        // Add response to cache 
                        cache.put(e.request, resClone);
                    });

                return res;
            }).catch(err => caches.match(e.request).then(res => res))
    )
})






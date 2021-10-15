// Our service worker file 

// Registering service worker 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw_cached_pages.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
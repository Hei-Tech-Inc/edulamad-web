// Keep a top-level message listener so browsers that enforce
// early worker event registration don't warn.
self.addEventListener('message', () => {});

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

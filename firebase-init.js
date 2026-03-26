/* firebase-init.js
   Loads Firebase SDKs (app + auth) and initializes using window.firebaseConfig
   Requires a `firebase-config.js` file that sets `window.firebaseConfig`.
*/
(function(){
  function loadScript(src){
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  // Load compat SDKs for simplicity (no build step).
  Promise.resolve()
    .then(() => loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js'))
    .then(() => loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'))
    .then(() => {
      if (!window.firebaseConfig) {
        console.warn('firebase-config.js not found or window.firebaseConfig not set. Create firebase-config.js from firebase-config.example.js');
        return;
      }
      firebase.initializeApp(window.firebaseConfig);
      window.firebaseAuth = firebase.auth();
    })
    .catch(e => console.error('Failed to load Firebase SDKs', e));
})();

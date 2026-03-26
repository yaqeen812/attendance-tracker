/* Modular Firebase initializer for your app.
   This file loads the modular SDK and exposes a small compatibility
   wrapper on window.firebaseAuth so existing code continues to work.
*/
(async function(){
  if (!window.firebaseConfig) {
    console.warn('window.firebaseConfig not found. Create firebase-config.js with your config.');
    return;
  }

  // load the modular SDKs as ES modules
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js');

    const app = initializeApp(window.firebaseConfig);
    const auth = authMod.getAuth(app);

    // create a tiny compat wrapper with the methods main.js expects
    window.firebaseAuth = {
      createUserWithEmailAndPassword: (email, pass) => authMod.createUserWithEmailAndPassword(auth, email, pass),
      signInWithEmailAndPassword: (email, pass) => authMod.signInWithEmailAndPassword(auth, email, pass),
      // Google sign-in helper
      signInWithGoogle: () => {
        const provider = new authMod.GoogleAuthProvider();
        return authMod.signInWithPopup(auth, provider);
      },
      signOut: () => authMod.signOut(auth),
      onAuthStateChanged: (cb) => authMod.onAuthStateChanged(auth, cb)
    };

    console.log('Firebase (modular) initialized');
    // notify listeners that firebase is ready
    window.dispatchEvent(new Event('firebase-ready'));
  } catch (err) {
    console.error('Failed to initialize modular Firebase:', err);
    window.dispatchEvent(new CustomEvent('firebase-error', { detail: err }));
  }
})();

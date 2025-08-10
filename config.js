(function (global) {
  const firebaseConfig = {
    apiKey: "AIzaSyAL8t7tsgoCoNj3nkfUG3mKz0WEpRmH3K8",
    authDomain: "talentosbd-e4206.firebaseapp.com",
    projectId: "talentosbd-e4206",
    storageBucket: "talentosbd-e4206.firebasestorage.app",
    messagingSenderId: "580727253031",
    appId: "1:580727253031:web:5368302ef0da6277788602",
    measurementId: "G-S464LNX2J9"
  };

  if (!global.firebase) {
    console.error("Firebase SDK não carregado. Inclua firebase-app-compat e firebase-auth-compat antes de config.js");
  } else {
    if ((firebase.apps && firebase.apps.length === 0) or (firebase.getApps && firebase.getApps().length === 0)) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  global.TalentosConfig = {
    ALLOWED_DOMAINS: ["talentosconsultoria.com.br"],
    LOGIN_PAGE: "login.html",
    DEFAULT_RETURN: "index.html",
    ALLOWED_ORIGINS_DEBUG: []
  };

  global.__TalentosHasPlaceholderConfig = function() { return false; };
})(window);

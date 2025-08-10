(function (global) {
  // Firebase config REAL - Talentos (talentosbd-e4206)
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
    try {
      // Inicializa apenas se não houver app inicializado
      if ((firebase.apps && firebase.apps.length === 0) || (firebase.getApps && firebase.getApps().length === 0)) {
        firebase.initializeApp(firebaseConfig);
      }
    } catch (e) {
      console.error("Falha ao inicializar Firebase App:", e);
    }
  }

  global.TalentosConfig = {
    ALLOWED_DOMAINS: ["talentosconsultoria.com.br"],
    LOGIN_PAGE: "login.html",
    DEFAULT_RETURN: "index.html",
    ALLOWED_ORIGINS_DEBUG: []
  };

  // Sem placeholders
  global.__TalentosHasPlaceholderConfig = function() { return false; };
})(window);

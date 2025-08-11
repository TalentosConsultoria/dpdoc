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

  if (!global.firebase) { console.error("[config] Firebase SDK não carregado."); }
  else {
    try {
      const noAppCompat = (firebase.apps && firebase.apps.length === 0);
      const noAppMod = (firebase.getApps && firebase.getApps().length === 0);
      if (noAppCompat || noAppMod) { firebase.initializeApp(firebaseConfig); console.log("[config] Firebase App inicializado (DEFAULT)."); }
      else { console.log("[config] Firebase App já estava inicializado."); }
    } catch (e) { console.error("[config] Falha ao inicializar Firebase App:", e); }
  }

  global.TalentosConfig = {
    firebaseConfig: firebaseConfig,
    ALLOWED_DOMAINS: ["talentosconsultoria.com.br"],
    LOGIN_PAGE: "login.html",
    DEFAULT_RETURN: "index.html",
    ALLOWED_ORIGINS_DEBUG: [],
    AAD_TENANT: 'talentosconsultoria.com.br'
  };
  TalentosConfig.allowedDomains = TalentosConfig.ALLOWED_DOMAINS;
  TalentosConfig.redirectAfterLogin = TalentosConfig.DEFAULT_RETURN;
  TalentosConfig.loginPage = TalentosConfig.LOGIN_PAGE;
})(window);

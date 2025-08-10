/**
 * Config Firebase única com checagens de sanidade.
 * Preencha com os valores REAIS do seu projeto. Placeholders geram aviso visual.
 */
(function (global) {
  // ==== COLE SUA CONFIG AQUI ====
  const firebaseConfig = {
    apiKey: "TODO_API_KEY",
    authDomain: "TODO_AUTH_DOMAIN",
    projectId: "TODO_PROJECT_ID",
    appId: "TODO_APP_ID"
  };
  // ==============================

  function hasPlaceholder(cfg) {
    return Object.values(cfg).some(v => typeof v === "string" && v.startsWith("TODO_"));
  }

  if (!global.firebase) {
    console.error("Firebase SDK não carregado. Inclua firebase-app-compat e firebase-auth-compat antes de config.js");
  } else {
    if ((firebase.apps && firebase.apps.length === 0) || (firebase.getApps && firebase.getApps().length === 0)) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  global.TalentosConfig = {
    ALLOWED_DOMAINS: ["talentosconsultoria.com.br"],
    LOGIN_PAGE: "login.html",
    DEFAULT_RETURN: "index.html",
    ALLOWED_ORIGINS_DEBUG: []
  };

  // Expor função para checar placeholder (usado pelo login para exibir aviso)
  global.__TalentosHasPlaceholderConfig = function() { return hasPlaceholder(firebaseConfig); };
})(window);

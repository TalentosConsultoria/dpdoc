/**
 * Fonte única de configuração Firebase (compat 10.12.4)
 * Preencha com os valores reais do seu projeto (TODOs abaixo).
 * Depois, **NÃO** replique a config em nenhum outro arquivo. Sempre importe este.
 */
(function (global) {
  // TODO: cole aqui a SUA config real do Firebase
  // Pegue do console do Firebase: Configurações do projeto → Seus apps → Configuração
  const firebaseConfig = {
    apiKey: "TODO_API_KEY",
    authDomain: "TODO_AUTH_DOMAIN", // ex: talentos-auth.web.app
    projectId: "TODO_PROJECT_ID",
    appId: "TODO_APP_ID"
    // Se tiver: storageBucket, messagingSenderId etc. pode adicionar sem problemas
  };

  if (!global.firebase) {
    console.error("Firebase SDK não carregado. Inclua firebase-app-compat e firebase-auth-compat antes de config.js");
  } else {
    // Inicializa apenas se ainda não houver app
    if (firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    } else if (firebase.getApps && firebase.getApps().length === 0) {
      // para SDK modular, por precaução (não usado aqui, mas evita edge-cases)
      firebase.initializeApp(firebaseConfig);
    }
  }

  // Namespace global com parâmetros do projeto
  global.TalentosConfig = {
    // Domínios aceitos no e-mail do usuário
    ALLOWED_DOMAINS: ["talentosconsultoria.com.br"],
    // Página de login canônica
    LOGIN_PAGE: "login.html",
    // Página fallback caso o return não seja seguro
    DEFAULT_RETURN: "index.html",
    // Opcional: origens permitidas para depuração (index-debug)
    ALLOWED_ORIGINS_DEBUG: [
      // "https://dpdoc.talentosconsultoria.com.br",
      // "http://localhost:8080"
    ]
  };
})(window);

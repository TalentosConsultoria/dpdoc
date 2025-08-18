// msal-config.js
// Configuração MSAL para Talentos Consultoria (single-tenant)
// Observação importante: atualize os URIs de redirecionamento na App Registration para incluir
//   https://dpdoc.talentosconsultoria.com.br/login.html
//   https://dpdoc.talentosconsultoria.com.br/index.html

(function () {
  // IDs fornecidos pelo usuário
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";

  // Redirecionamentos
  const redirect = "https://dpdoc.talentosconsultoria.com.br/login.html";

  window.MSAL_CONFIG = {
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: redirect,
      postLogoutRedirectUri: redirect,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: true
    },
    system: {
      allowRedirectInIframe: true
    }
  };

  window.MSAL_INSTANCE = new msal.PublicClientApplication(window.MSAL_CONFIG);
  window.TOKEN_REQUEST = { scopes: ["User.Read"] };
  window.ALLOWED_EMAIL_DOMAIN = "talentosconsultoria.com.br";
  window.ALLOWED_TENANT_ID = TENANT_ID;
})();
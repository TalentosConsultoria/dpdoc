// msal-config.js (opcional – para centralizar a config)
(function () {
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const ORIGIN    = window.location.origin;
  const REDIRECT  = ORIGIN + "/login.html";   // redirect e post-logout no login.html

  window.MSAL_CONFIG = {
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: REDIRECT,
      postLogoutRedirectUri: REDIRECT,
      navigateToLoginRequestUrl: false
    },
    cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false },
    system: { loggerOptions: { loggerCallback: function(){} } }
  };

  window.MSAL_LOGIN_REQUEST = {
    scopes: ["User.Read"],
    extraQueryParameters: { domain_hint: "talentosconsultoria.com.br" }
  };
})();

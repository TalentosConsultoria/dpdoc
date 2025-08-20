// config.js - Configuração MSAL para Microsoft Entra ID
(function () {
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const BASE_URL = window.location.origin;
  const REDIRECT_URI = BASE_URL + "/login.html";

  window.MSAL_CONFIG = {
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: REDIRECT_URI,
      postLogoutRedirectUri: REDIRECT_URI,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    },
    system: {
      loggerOptions: { loggerCallback: function () {} }
    }
  };

  window.MSAL_LOGIN_REQUEST = {
    scopes: ["User.Read", "openid", "profile"],
    extraQueryParameters: {
      domain_hint: "talentosconsultoria.com.br",
      prompt: "select_account"
    }
  };

  window.MSAL_SETTINGS = {
    ENFORCE_DOMAIN: true,
    ALLOWED_DOMAIN: "talentosconsultoria.com.br",
    DEBUG_MODE: false
  };

  // Criação da instância
  window.msalInstance = new msal.PublicClientApplication(window.MSAL_CONFIG);

  // Processa retorno do login
  window.msalInstance.handleRedirectPromise().then(async (response) => {
    if (response && response.account) {
      const account = response.account;
      window.msalInstance.setActiveAccount(account);
      localStorage.setItem("authToken", response.accessToken);
      localStorage.setItem("userAccount", JSON.stringify(account));

      const redirect = localStorage.getItem("redirectAfterLogin") || "/index.html";
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirect;
    }
  }).catch(error => {
    console.error("Erro ao processar login:", error);
  });
})();
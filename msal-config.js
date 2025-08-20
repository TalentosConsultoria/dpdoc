
// MSAL configuração dinâmica por ambiente
(function(){
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";   // <-- ajuste se necessário
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";    // <-- ajuste se necessário

  let redirect = "http://localhost:5500/login.html"; // dev padrão
  const host = window.location.hostname;

  if (host.includes("intranet.talentosconsultoria.com.br")) {
    redirect = "https://intranet.talentosconsultoria.com.br/index.html";
  } else if (host.includes("dpdoc.talentosconsultoria.com.br")) {
    redirect = "https://dpdoc.talentosconsultoria.com.br/login.html";
  }

  window.MSAL_CONFIG = {
    auth: {
      clientId: CLIENT_ID,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: redirect,
      postLogoutRedirectUri: redirect,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    }
  };
  window.LOGIN_REQUEST = { scopes: ["User.Read"] };
})();

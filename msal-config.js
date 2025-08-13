// msal-config.js
// Configuração do MSAL para Microsoft Entra ID (Azure AD)
(function(){
  // IDs do aplicativo e do tenant a partir do App Registration "AuthTalentosRH"
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";

  // Observação: o redirectUri PRECISA existir nos "URIs de redirecionamento" do app no Azure.
  // Deixe como index.html por padrão. Ajuste se hospedar em raiz (/).
  const redirect = "https://dpdoc.talentosconsultoria.com.br/index.html";  // Verifique o domínio e a página

  window.MSAL_CONFIG = {
    auth: {
      clientId: aceb5b29-df99-4d90-8533-233407b08a2c,
      authority: "https://login.microsoftonline.com/" + TENANT_ID,
      redirectUri: redirect,
      postLogoutRedirectUri: redirect,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false
    },
    system: {
      loggerOptions: { loggerCallback: function(){} }
    }
  };

  window.MSAL_LOGIN_REQUEST = {
    scopes: ["User.Read"],
    // domain_hint acelera login para o seu domínio corporativo
    // mude se usar outro domínio principal
    extraQueryParameters: { domain_hint: "talentosconsultoria.com.br" }
  };
})();

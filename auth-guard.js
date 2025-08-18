// auth-guard.js
// Protege páginas exigindo login Microsoft (@talentosconsultoria.com.br)

(function(){
  if (!window.msal || !window.msal.PublicClientApplication) {
    console.error("MSAL não carregado. Verifique a tag do CDN msal-browser.");
    return;
  }
  if (!window.MSAL_CONFIG) {
    console.error("MSAL_CONFIG não encontrado. Inclua msal-config.js antes de auth-guard.js");
    return;
  }

  const allowedDomain = "talentosconsultoria.com.br";

  const msalInstance = new msal.PublicClientApplication(window.MSAL_CONFIG);

  // Seleciona a primeira conta válida no domínio permitido
  function getAccount() {
    const accounts = msalInstance.getAllAccounts() || [];
    for (const acc of accounts) {
      if (acc.username && acc.username.toLowerCase().endsWith("@" + allowedDomain)) {
        return acc;
      }
    }
    return null;
  }

  function ensureDomainOrSignOut(account) {
    if (!account) return;
    if (!account.username.toLowerCase().endsWith("@"+allowedDomain)) {
      console.warn("Conta fora do domínio permitido:", account.username);
      msalInstance.logoutRedirect();
    }
  }

  // Trata retorno do redirect (login / logout)
  msalInstance.handleRedirectPromise()
    .then((response) => {
      if (response && response.account) {
        msalInstance.setActiveAccount(response.account);
        ensureDomainOrSignOut(response.account);
      } else {
        const acc = getAccount();
        if (acc) msalInstance.setActiveAccount(acc);
      }
    })
    .catch((err) => {
      console.error("Erro no handleRedirectPromise:", err);
    })
    .finally(() => {
      // Depois de tratar o redirect, se não tiver usuário, faz login
      const acc = getAccount();
      if (!acc) {
        msalInstance.loginRedirect(window.MSAL_LOGIN_REQUEST);
        return;
      }
      msalInstance.setActiveAccount(acc);
      ensureDomainOrSignOut(acc);
      // Disponibiliza funções globais úteis
      window.signOut = function() {
        msalInstance.logoutRedirect();
      };
      window.getAccessToken = async function(scopes) {
        const req = {
          account: msalInstance.getActiveAccount(),
          scopes: scopes && scopes.length ? scopes : ["User.Read"]
        };
        try {
          const result = await msalInstance.acquireTokenSilent(req);
          return result.accessToken;
        } catch (e) {
          if (e instanceof msal.InteractionRequiredAuthError) {
            const res = await msalInstance.acquireTokenRedirect(req);
            return res && res.accessToken;
          } else {
            console.error("Erro ao obter token:", e);
            throw e;
          }
        }
      };
      document.documentElement.classList.add("msal-ready");
    });
})();

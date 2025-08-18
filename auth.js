/* auth.js (r2) - MSAL (Entra ID) guard para intranet Talentos
 * Hardcode do redirectUri para evitar variações de host/caminho.
 * Restringe por tenant e e-mail @talentosconsultoria.com.br
 */
(function() {
  const TENANT_ID = "cba0be9f-94ad-4a26-b291-fa90af7491ee";
  const CLIENT_ID = "aceb5b29-df99-4d90-8533-233407b08a2c";
  const REDIRECT_URI = "https://dpdoc.talentosconsultoria.com.br/login.html";

  const msalConfig = {
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
      loggerOptions: {
        loggerCallback: function(){},
        piiLoggingEnabled: false
      }
    }
  };

  const msalInstance = new msal.PublicClientApplication(msalConfig);
  const loginRequest = { scopes: ["User.Read"], prompt: "select_account" };

  function isAllowedAccount(acc) {
    if (!acc) return false;
    const claims = acc.idTokenClaims || {};
    const tenantOk = (claims.tid === TENANT_ID);
    const domainOk = /@talentosconsultoria\.com\.br$/i.test(acc.username || "");
    return tenantOk && domainOk;
  }

  async function handleRedirect() {
    try { await msalInstance.handleRedirectPromise(); }
    catch(e) { console.error("MSAL redirect error:", e); }
  }

  async function selectOrLogin() {
    await handleRedirect();
    const accounts = msalInstance.getAllAccounts();
    let account = accounts.find(isAllowedAccount);
    if (account) {
      msalInstance.setActiveAccount(account);
      const pending = sessionStorage.getItem("postLoginPath");
      if (pending && /\/login\.html$/i.test(location.pathname)) {
        const url = atob(pending);
        sessionStorage.removeItem("postLoginPath");
        location.replace(url || "/index.html");
      }
      return account;
    }
    return null;
  }

  async function requireAuthGuard() {
    const allowed = await selectOrLogin();
    if (allowed) return true;
    if (!/\/login\.html$/i.test(location.pathname)) {
      const state = btoa(location.pathname + location.search + location.hash);
      sessionStorage.setItem("postLoginPath", state);
      await msalInstance.loginRedirect(loginRequest);
    }
    return false;
  }

  async function beginLogin() {
    const acc = await selectOrLogin();
    if (!acc) {
      try { await msalInstance.loginRedirect(loginRequest); }
      catch (e) { console.error("Erro no loginRedirect:", e); }
    }
  }

  function logout() {
    try { msalInstance.logoutRedirect(); }
    catch (e) { console.error(e); }
  }

  async function getToken(scopes) {
    const account = msalInstance.getActiveAccount();
    if (!account) throw new Error("Sem conta ativa");
    const req = { account, scopes: scopes || ["User.Read"] };
    try {
      const r = await msalInstance.acquireTokenSilent(req);
      return r.accessToken;
    } catch (e) {
      if (e instanceof msal.InteractionRequiredAuthError) {
        await msalInstance.acquireTokenRedirect(req);
        return null;
      }
      throw e;
    }
  }

  window.TalentosAuth = {
    requireAuthGuard,
    beginLogin,
    logout,
    getToken,
    msalInstance
  };
})();

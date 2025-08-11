// assets/js/auth.js
// Utilitários de proteção de rota e acesso ao token
window.TalentosAuthGuard = (function(){
  function activeAccountOrRedirect() {
    const inst = window.__msalInstance;
    if (!inst) {
      console.error("MSAL não inicializado.");
      location.replace("login.html");
      return null;
    }
    const acc = inst.getActiveAccount() || (inst.getAllAccounts()[0] || null);
    if (!acc) {
      location.replace("login.html");
      return null;
    }
    return acc;
  }

  async function getIdToken() {
    const inst = window.__msalInstance;
    const account = activeAccountOrRedirect();
    if (!account) return null;

    try {
      const result = await inst.acquireTokenSilent({
        account,
        scopes: window.TalentosConfig.MSAL_SCOPES || []
      });
      return result.idToken;
    } catch (e) {
      console.warn("acquireTokenSilent falhou, tentando via redirect", e);
      await inst.acquireTokenRedirect({
        account,
        scopes: window.TalentosConfig.MSAL_SCOPES || []
      });
      return null;
    }
  }

  return { activeAccountOrRedirect, getIdToken };
})();


// config.js - fluxo MSAL estável (sem loops)
(function () {
  if (!window.msal || !window.MSAL_CONFIG) {
    console.error("MSAL ou MSAL_CONFIG ausente: verifique a ordem dos scripts.");
    return;
  }

  // Instância única (evita 'state_not_found' por instâncias múltiplas)
  const msalInstance = new msal.PublicClientApplication(window.MSAL_CONFIG);
  window.msalInstance = msalInstance;

  // Trata o retorno do redirect assim que a página carrega
  async function handleRedirect() {
    try {
      const result = await msalInstance.handleRedirectPromise();
      if (result && result.account) {
        // Login recém concluído
        msalInstance.setActiveAccount(result.account);
        localStorage.setItem("userAccount", JSON.stringify(result.account));

        const to = localStorage.getItem("redirectAfterLogin") || "/index.html";
        localStorage.removeItem("redirectAfterLogin");
        window.location.replace(to);
        return;
      }
      // Sem resultado no hash: pode já haver sessão
      const accounts = msalInstance.getAllAccounts();
      if (accounts && accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        localStorage.setItem("userAccount", JSON.stringify(accounts[0]));
      }
    } catch (e) {
      // Evita loop: não dispara novo login aqui
      console.error("MSAL redirect error:", e);
    }
  }
  handleRedirect();

  // ---- Helpers globais ----
  window.loginWithMicrosoft = function () {
    // Apenas inicia login; retorno é tratado pelo handleRedirect()
    msalInstance.loginRedirect({ scopes: ["User.Read"] });
  };

  window.logout = function () {
    try {
      localStorage.removeItem("userAccount");
      localStorage.removeItem("demoUser");
      msalInstance.logoutRedirect();
    } catch (e) {
      console.error("logout error", e);
    }
  };
})();

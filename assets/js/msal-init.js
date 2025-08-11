// assets/js/msal-init.js
// Inicialização do MSAL (redirect flow) com validações de tenant e domínio.
(function(){
  const cfg = window.TalentosConfig;
  if (!cfg) throw new Error("TalentosConfig ausente");

  const msalConfig = {
    auth: {
      clientId: cfg.AAD_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${cfg.AAD_TENANT_ID}`,
      // redirectUri deve apontar para a página de login no mesmo diretório
      redirectUri: 'https://dpdoc.talentosconsultoria.com.br/login.html'
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: true // útil para navegadores com bloqueios de 3rd-party cookies
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          // console.log("[MSAL]", message);
        },
        logLevel: msal.LogLevel.Error
      }
    }
  };

  const msalInstance = new msal.PublicClientApplication(msalConfig);
  window.__msalInstance = msalInstance;

  async function handleRedirect() {
    try {
      const response = await msalInstance.handleRedirectPromise();
      if (response && response.account) {
        msalInstance.setActiveAccount(response.account);
      }
      const account = getAccount();
      if (!account) {
        // Sem sessão → iniciar login por redirect
        await msalInstance.loginRedirect({
          scopes: window.TalentosConfig.MSAL_SCOPES || []
        });
        return;
      }

      // Validar tenant pelo claim tid e domínio por preferred_username
      const idTokenClaims = account.idTokenClaims || {};
      const tidOk = idTokenClaims.tid === cfg.AAD_TENANT_ID;
      const audOk = idTokenClaims.aud === cfg.AAD_CLIENT_ID;
      if (!audOk) {
        console.warn("Token emitido para outro clientId.", idTokenClaims.aud);
        await forceLogout();
        return;
      }

      const upn = idTokenClaims.preferred_username || "";
      const domainOk = upn.toLowerCase().endswith(`@${cfg.ALLOWED_EMAIL_DOMAIN}`);

      if (!tidOk || !domainOk || !audOk) {
        console.warn("Conta fora do tenant ou domínio não permitido.", {tidOk, domainOk, upn});
        await forceLogout();
        return;
      }

      // Sessão válida → seguir para a página principal
      const target = new URL(cfg.POST_LOGIN_PAGE, location.href).toString();
      if (location.href !== target) {
        location.replace(target);
      }

    } catch (err) {
      console.error("Erro no handleRedirectPromise:", err);
      // Em caso de erro estranho, tentar limpeza segura.
      await forceLogout();
    }
  }

  function getAccount() {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      // Se houver mais de um, tente manter o activeAccount
      const active = msalInstance.getActiveAccount();
      return active || accounts[0];
    }
    return null;
  }

  async function forceLogout() {
    try {
      // Limpeza total de sessão: MSAL + storage
      sessionStorage.clear();
      localStorage.removeItem("firebase:host"); // limpeza cosmética
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: 'https://dpdoc.talentosconsultoria.com.br/login.html'
      });
    } catch (e) {
      console.error("Erro no logoutRedirect:", e);
      // Último recurso
      location.assign("login.html");
    }
  }

  // Expor utilitários globalmente
  window.TalentosAuth = { beginLogin: async ()=>{ try { await msalInstance.loginRedirect({ scopes: window.TalentosConfig.MSAL_SCOPES || [] }); } catch(e){ console.error('Erro loginRedirect', e);} },
    msalInstance,
    getAccount,
    forceLogout
  };

  // Iniciar apenas o tratamento do retorno de redirect.
// Login automático somente se query param ?auto=1
  (async function init(){
    const qp = new URLSearchParams(location.search);
    await handleRedirect(); // processa retorno e seta conta ativa se vier de redirect
    const account = getAccount();
    if (!account && qp.get("auto") === "1") {
      await msalInstance.loginRedirect({ scopes: window.TalentosConfig.MSAL_SCOPES || [] });
    }
  })();
})();

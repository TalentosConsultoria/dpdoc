// auth-guard.js
// Enforce login on protected pages and provide helpers for login.html

(function () {
  function hideUntilReady() {
    try { document.body.style.visibility = "hidden"; } catch(e) {}
  }
  function showNow() {
    try { document.body.style.visibility = "visible"; } catch(e) {}
  }

  // If MSAL not loaded yet, do nothing
  if (!window.msal || !window.MSAL_INSTANCE) {
    document.addEventListener("DOMContentLoaded", function() {
      if (!window.msal || !window.MSAL_INSTANCE) return;
      initGuard();
    });
  } else {
    initGuard();
  }

  function isLoginPage() {
    return /\blogin\.html$/i.test(location.pathname);
  }

  function validateAccount(account) {
    if (!account) return false;
    const domainOK = (account.username || "").toLowerCase().endsWith("@" + (window.ALLOWED_EMAIL_DOMAIN || "").toLowerCase());
    const tid = account.idTokenClaims && account.idTokenClaims.tid;
    const tenantOK = !window.ALLOWED_TENANT_ID || tid === window.ALLOWED_TENANT_ID;
    return domainOK && tenantOK;
  }

  async function ensureToken(account) {
    try {
      const result = await window.MSAL_INSTANCE.acquireTokenSilent({
        ...window.TOKEN_REQUEST,
        account
      });
      return result.accessToken;
    } catch (e) {
      // Only trigger interactive on login.html to avoid loops
      if (isLoginPage()) {
        await window.MSAL_INSTANCE.loginRedirect(window.TOKEN_REQUEST);
        return null; // redirecting
      } else {
        location.replace("login.html");
        return null;
      }
    }
  }

  function initGuard() {
    const msalInstance = window.MSAL_INSTANCE;

    if (isLoginPage()) {
      // LOGIN FLOW
      document.addEventListener("DOMContentLoaded", async function () {
        hideUntilReady();

        // Complete redirect, if coming back from AAD
        try { await msalInstance.handleRedirectPromise(); } catch(e) { console.error(e); }

        let account = msalInstance.getActiveAccount();
        if (!account) {
          const all = msalInstance.getAllAccounts();
          if (all.length) msalInstance.setActiveAccount(all[0]);
          account = msalInstance.getActiveAccount();
        }

        if (account && validateAccount(account)) {
          showNow();
          location.replace("index.html");
          return;
        }

        // Start interactive login
        try {
          await msalInstance.loginRedirect(window.TOKEN_REQUEST);
        } catch (e) {
          console.error("loginRedirect error", e);
          showNow();
          const box = document.getElementById("loginError");
          if (box) box.textContent = "Falha no login. Tente novamente.";
        }
      });

      window.startLogin = async function () {
        try { await msalInstance.loginRedirect(window.TOKEN_REQUEST); } catch (e) { console.error(e); }
      };

    } else {
      // PROTECTED PAGES (e.g., index.html)
      document.addEventListener("DOMContentLoaded", async function () {
        hideUntilReady();

        try { await msalInstance.handleRedirectPromise(); } catch(e) { console.error(e); }

        let account = msalInstance.getActiveAccount();
        if (!account) {
          const all = msalInstance.getAllAccounts();
          if (all.length) msalInstance.setActiveAccount(all[0]);
          account = msalInstance.getActiveAccount();
        }

        if (!account || !validateAccount(account)) {
          showNow();
          location.replace("login.html");
          return;
        }

        // Optionally acquire a token to confirm cache is valid
        await ensureToken(account);

        // Expose helpers
        window.getAuthAccount = () => msalInstance.getActiveAccount();
        window.getAccessToken = () => ensureToken(msalInstance.getActiveAccount());
        window.logout = async () => {
          try { await msalInstance.logoutRedirect(); } catch (e) { console.error(e); }
        };

        showNow();
      });
    }
  }
})();
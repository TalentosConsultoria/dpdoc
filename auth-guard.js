(function(){
  // Auto-init Firebase app if compat present and not initialized
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps || firebase.apps.length === 0) {
        var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
        if (cfg && cfg.apiKey) { firebase.initializeApp(cfg); console.log("[guard] App inicializado (fallback)."); }
      }
    }
  } catch(e){ console.error("[guard] auto-init", e); }
})();

(function (global) {
  "use strict";

  function isLoginPath(pathname) {
    return /(^|\/)login(\.html)?$/i.test(pathname || "");
  }
  function sameOrigin(url) {
    try { var u = new URL(url, location.href); return u.origin === location.origin; }
    catch { return false; }
  }
  function containsNestedReturn(candidate) {
    try {
      if (!candidate) return false;
      if (/[?&]return=/i.test(candidate)) return true;
      var u = new URL(candidate, location.href);
      return /[?&]return=/i.test(u.search);
    } catch {
      return true; // treat invalid as unsafe
    }
  }
  function safeReturnUrl(candidate) {
    var fallback = (global.TalentosConfig && (TalentosConfig.DEFAULT_RETURN || "index.html")) || "index.html";
    if (!candidate) return fallback;
    try {
      var u = new URL(candidate, location.href);
      if (!sameOrigin(u.href)) return fallback;
      if (isLoginPath(u.pathname)) return fallback;
      if (containsNestedReturn(u.href)) return fallback;
      return u.pathname + u.search + u.hash;
    } catch {
      return fallback;
    }
  }

  // loop throttle (avoid multiple redirects in a short window)
  function canRedirectNow() {
    try {
      var key = "talentos_guard_last_redirect";
      var last = parseInt(sessionStorage.getItem(key) || "0", 10);
      var now = Date.now();
      if (now - last < 2500) return false;
      sessionStorage.setItem(key, String(now));
      return true;
    } catch { return true; }
  }

  function emailDomainAllowed(email) {
    try {
      var domains = (global.TalentosConfig && (TalentosConfig.ALLOWED_DOMAINS || TalentosConfig.allowedDomains)) || [];
      var at = (email || "").split("@");
      var domain = at.length > 1 ? at[1].toLowerCase() : "";
      return domains.length === 0 ? true : domains.some(function (d) { return domain === String(d).toLowerCase(); });
    } catch (e) {
      console.warn("[guard] emailDomainAllowed", e);
      return false;
    }
  }

  function waitAuthReady() {
    return new Promise(function (resolve) {
      try {
        var auth = firebase.auth();
        var unsub = auth.onAuthStateChanged(function (user) {
          try { unsub && unsub(); } catch(e){}
          resolve(user || null);
        });
      } catch (e) {
        console.error("[guard] waitAuthReady", e);
        resolve(null);
      }
    });
  }

  async function protect(opts) {
    // Bypass via query or setting (emergência)
    var bypass = /[?&]noauth=1/i.test(location.search) || (function(){try{return localStorage.getItem("talentos_noauth_site")==="1"}catch(e){return false}})();
    if (bypass) { console.warn("[guard] BYPASS habilitado (noauth=1). Página não redirecionará."); return; }

    var cfg = Object.assign({
      loginPage: (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html"
    }, opts || {});

    var params = new URLSearchParams(location.search);
    var requested = params.get("return");
    var current = location.pathname + location.search + location.hash;
    var isLogin = isLoginPath(location.pathname);

    // Non-login pages: prefer current if no requested; Login page should never call protect
    var ret = safeReturnUrl(requested || (isLogin ? null : current));

    var user = await waitAuthReady();
    var auth = firebase.auth();

    if (!user) {
      if (!canRedirectNow()) return; // throttle
      var goto = cfg.loginPage + (ret ? ("?return=" + encodeURIComponent(ret)) : "");
      location.replace(goto);
      return;
    }
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch(e) { console.warn(e); }
      if (!canRedirectNow()) return;
      location.replace(cfg.loginPage + "?error=forbidden");
      return;
    }

    // Sessão ok: expõe utilitários
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
    global.TalentosAuthGuard.safeReturnUrl = safeReturnUrl;
  }

  global.TalentosAuthGuard = Object.assign(global.TalentosAuthGuard || {}, { protect: protect, safeReturnUrl: safeReturnUrl });

})(window);

// Global logout helper (mantido)
;(function(global){
  try{
    global.logoutTalentos = async function(){
      if (!global.firebase || !firebase.auth) return;
      try { await firebase.auth().signOut(); } catch(e){ console.warn(e); }
      var page = (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html";
      // evita autologin logo após sair
      try { localStorage.setItem("talentos_noauto","1"); } catch {}
      location.replace(page + "?noauto=1");
    };
  }catch(e){ console.error(e); }
})(window);

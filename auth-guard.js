// auth-guard.js (v5) — anti-loop + envia noauto=1 em forbidden
(function(){
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps || firebase.apps.length === 0) {
        var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
        if (cfg && cfg.apiKey) { firebase.initializeApp(cfg); }
      }
    }
  } catch(e){ console.error("[guard] auto-init", e); }
})();

(function (global) {
  "use strict";

  function isLoginPath(pathname) { return /(^|\/)login(\.html)?$/i.test(pathname || ""); }
  function sameOrigin(url) { try { var u = new URL(url, location.href); return u.origin === location.origin; } catch { return false; } }
  function containsNestedReturn(candidate) {
    try { if (!candidate) return false; var u = new URL(candidate, location.href); return /[?&]return=/i.test(u.search); }
    catch { return true; }
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
    } catch { return fallback; }
  }
  function emailDomainAllowed(email) {
    try {
      var domains = (global.TalentosConfig && (TalentosConfig.ALLOWED_DOMAINS || TalentosConfig.allowedDomains)) || [];
      var at = (email || "").split("@");
      var domain = at.length > 1 ? at[1].toLowerCase() : "";
      return domains.length === 0 ? true : domains.some(function (d) { return domain === String(d).toLowerCase(); });
    } catch (e) { return false; }
  }
  function waitAuthReady(timeoutMs){
    timeoutMs = timeoutMs || 5000;
    return new Promise(function (resolve) {
      var resolved = false;
      var to = setTimeout(function(){ if(!resolved){ resolved = true; resolve(null); } }, timeoutMs);
      try {
        var auth = firebase.auth();
        var unsub = auth.onAuthStateChanged(function (user) {
          if (resolved) return;
          resolved = true;
          try { clearTimeout(to); } catch(_){}
          try { unsub && unsub(); } catch(_){}
          resolve(user || null);
        });
      } catch (e) {
        try { clearTimeout(to); } catch(_){}
        resolve(null);
      }
    });
  }
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

  async function protect(opts) {
    // Bypass total via URL/flag
    var bypass = /[?&]noauth=1/i.test(location.search) || (function(){ try{ return localStorage.getItem("talentos_noauth_site")==="1"; } catch(e){ return false; } })();
    if (bypass) { return; }

    // Nunca proteja o login.html
    if (isLoginPath(location.pathname)) { return; }

    var cfg = Object.assign({
      loginPage: (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html"
    }, opts || {});

    var params = new URLSearchParams(location.search);
    var requested = params.get("return");
    var currentSafe = location.pathname + location.hash;
    var ret = safeReturnUrl(requested || currentSafe);

    var user = await waitAuthReady(5000);
    var auth = firebase.auth();

    if (!user) {
      if (!canRedirectNow()) return;
      var goto = cfg.loginPage + (ret ? ("?return=" + encodeURIComponent(ret)) : "");
      location.replace(goto);
      return;
    }
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch(e) {}
      if (!canRedirectNow()) return;
      location.replace(cfg.loginPage + "?error=forbidden&noauto=1");
      return;
    }

    // Sessão ok
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
    global.TalentosAuthGuard.safeReturnUrl = safeReturnUrl;
  }

  global.TalentosAuthGuard = Object.assign(global.TalentosAuthGuard || {}, { protect: protect, safeReturnUrl: safeReturnUrl });
})(window);

// Logout helper
;(function(global){
  try{
    global.logoutTalentos = async function(){
      if (!global.firebase || !firebase.auth) return;
      try { await firebase.auth().signOut(); } catch(e){}
      try { localStorage.setItem("talentos_noauto","1"); } catch {}
      var page = (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html";
      location.replace(page + "?noauto=1");
    };
  }catch(e){}
})(window);

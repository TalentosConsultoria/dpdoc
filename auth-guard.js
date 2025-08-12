// auth-guard.js (v4) — estável, anti-loop, com debug opcional (?debug=1)
(function(){
  // Auto-init Firebase app se ainda não houver
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      if (!firebase.apps || firebase.apps.length === 0) {
        var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
        if (cfg && cfg.apiKey) { firebase.initializeApp(cfg); console.log("[guard] init compat"); }
      }
    }
  } catch(e){ console.error("[guard] auto-init", e); }
})();

(function (global) {
  "use strict";

  var DEBUG = /[?&]debug=1/i.test(location.search);
  function log(){ if (DEBUG) try{ console.log.apply(console, arguments); }catch{} }
  function isLoginPath(pathname) { return /(^|\/)login(\.html)?$/i.test(pathname || ""); }
  function sameOrigin(url) { try { var u = new URL(url, location.href); return u.origin === location.origin; } catch { return false; } }
  function containsNestedReturn(candidate) {
    try { if (!candidate) return false; var u = new URL(candidate, location.href); return /[?&]return=/i.test(u.search); }
    catch { return true; } // inválida => inseguira
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
    } catch (e) { log("[guard] emailDomainAllowed err", e); return false; }
  }
  function waitAuthReady(timeoutMs){
    timeoutMs = timeoutMs || 4000;
    return new Promise(function (resolve) {
      var done = false;
      var to = setTimeout(function(){ if(!done){ done = true; resolve(null); } }, timeoutMs);
      try {
        var auth = firebase.auth();
        var unsub = auth.onAuthStateChanged(function (user) {
          if (done) return;
          done = true;
          try { clearTimeout(to); } catch(e){}
          try { unsub && unsub(); } catch(e){}
          resolve(user || null);
        });
      } catch (e) {
        log("[guard] waitAuthReady error", e);
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
    // BYPASS total via URL ou flag (debug/emergência)
    var bypass = /[?&]noauth=1/i.test(location.search) || (function(){ try{ return localStorage.getItem("talentos_noauth_site")==="1"; } catch(e){ return false; } })();
    if (bypass) { log("[guard] BYPASS noauth=1"); return; }

    // Nunca proteja o login.html
    if (isLoginPath(location.pathname)) { log("[guard] not protecting login page"); return; }

    var cfg = Object.assign({
      loginPage: (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html"
    }, opts || {});

    var params = new URLSearchParams(location.search);
    var requested = params.get("return"); // origem que pediu autenticação
    // Por segurança, se não houver requested, use a página atual SEM o próprio querystring
    var currentSafe = location.pathname + location.hash;
    var ret = safeReturnUrl(requested || currentSafe);
    log("[guard] ret ->", ret);

    var user = await waitAuthReady(5000);
    var auth = firebase.auth();

    if (!user) {
      if (!canRedirectNow()) { log("[guard] throttle redirect"); return; }
      var goto = cfg.loginPage + (ret ? ("?return=" + encodeURIComponent(ret)) : "");
      log("[guard] -> login", goto);
      location.replace(goto);
      return;
    }
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch(e) { log("[guard] signOut err", e); }
      if (!canRedirectNow()) { log("[guard] throttle forbidden"); return; }
      var g2 = cfg.loginPage + "?error=forbidden";
      log("[guard] -> forbidden", g2);
      location.replace(g2);
      return;
    }

    // Sessão ok: expõe utilitários
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
    global.TalentosAuthGuard.safeReturnUrl = safeReturnUrl;
    log("[guard] ok", user.email);
  }

  global.TalentosAuthGuard = Object.assign(global.TalentosAuthGuard || {}, { protect: protect, safeReturnUrl: safeReturnUrl });
})(window);

// Logout helper alinhado com login noauto
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

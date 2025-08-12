\
// auth-guard.js (v6) — anti-loop definitivo com 'access-denied.html'
(function(){
  // Auto-init Firebase app se compat presente
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

  var DEBUG = /[?&]debug=1/i.test(location.search) || /#debug\b/.test(location.hash);
  function dlog(){ if (DEBUG) try{ console.log.apply(console, arguments); }catch{} }

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

  // throttle para evitar redirecionar em sequência
  function canRedirectNow() {
    try {
      var k = "talentos_guard_last_redirect";
      var last = parseInt(sessionStorage.getItem(k) || "0", 10);
      var now = Date.now();
      if (now - last < 2500) return false;
      sessionStorage.setItem(k, String(now));
      return true;
    } catch { return true; }
  }

  function emailDomainAllowed(email) {
    try {
      var domains = (global.TalentosConfig && (TalentosConfig.ALLOWED_DOMAINS || TalentosConfig.allowedDomains)) || [];
      var at = (email || "").split("@");
      var domain = at.length > 1 ? at[1].toLowerCase() : "";
      if (domains.length === 0) return true;
      return domains.some(function (d) { return domain === String(d).toLowerCase(); });
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

  async function protect(opts) {
    // BYPASS (debug/emergência)
    var bypass = /[?&]noauth=1/i.test(location.search) || (function(){ try{ return localStorage.getItem("talentos_noauth_site")==="1"; } catch(e){ return false; } })();
    if (bypass) { dlog("[guard] BYPASS noauth"); return; }

    // Nunca proteja login.html
    if (isLoginPath(location.pathname)) { dlog("[guard] not protecting login"); return; }

    var cfg = Object.assign({
      loginPage: (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html",
      deniedPage: "access-denied.html"
    }, opts || {});

    var params = new URLSearchParams(location.search);
    var requested = params.get("return");
    var ret = safeReturnUrl(requested || (location.pathname + location.hash));

    var user = await waitAuthReady(6000);
    var auth = firebase.auth();

    if (!user) {
      if (!canRedirectNow()) return;
      var goto = cfg.loginPage + (ret ? ("?return=" + encodeURIComponent(ret)) : "");
      dlog("[guard] -> login", goto);
      location.replace(goto);
      return;
    }

    // Se o domínio não for permitido, não redireciona para login (evita loop). Vai para denied fixo.
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch(e) {}
      try { localStorage.setItem("talentos_noauto","1"); } catch(e){}
      if (!canRedirectNow()) return;
      var deniedUrl = cfg.deniedPage + "?reason=forbidden";
      dlog("[guard] -> denied", deniedUrl);
      location.replace(deniedUrl);
      return;
    }

    // Sessão ok
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
    global.TalentosAuthGuard.safeReturnUrl = safeReturnUrl;
    dlog("[guard] ok", user.email);
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

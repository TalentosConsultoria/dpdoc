(function(){
  // Garantir init do Firebase (compat) se ainda não houver app
  try {
    var hasCompat = (typeof firebase !== 'undefined') && firebase.apps && firebase.apps.length > 0;
    if (!hasCompat && typeof firebase !== 'undefined' && firebase.initializeApp) {
      var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
      if (cfg) { firebase.initializeApp(cfg); console.log("[guard] App inicializado (fallback)."); }
    }
  } catch(e){ console.error("[guard] auto-init", e); }
})();

(function (global) {
  "use strict";

  function sameOrigin(url) {
    try {
      var u = new URL(url, location.href);
      return u.origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function isLoginPath(pathname) {
    return /(^|\/)login(\.html)?$/i.test(pathname || "");
  }

  function safeReturnUrl(candidate) {
    var fallback = (global.TalentosConfig && (TalentosConfig.DEFAULT_RETURN || "index.html")) || "index.html";
    if (!candidate) return fallback;
    try {
      var u = new URL(candidate, location.href);
      if (!sameOrigin(u.href)) return fallback;
      if (isLoginPath(u.pathname)) return fallback;
      return u.pathname + u.search + u.hash;
    } catch (e) {
      return fallback;
    }
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
    var cfg = Object.assign({
      loginPage: (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html"
    }, opts || {});

    var params = new URLSearchParams(location.search);
    var requested = params.get("return");
    var current = location.pathname + location.search + location.hash;
    var ret = safeReturnUrl(requested || current);

    var user = await waitAuthReady();
    var auth = firebase.auth();

    if (!user) {
      location.replace(cfg.loginPage + "?return=" + encodeURIComponent(ret));
      return;
    }
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch(e) { console.warn(e); }
      location.replace(cfg.loginPage + "?error=forbidden&return=" + encodeURIComponent(ret));
      return;
    }

    // Disponibiliza usuário atual
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
  }

  global.TalentosAuthGuard = Object.assign(global.TalentosAuthGuard || {}, {
    protect: protect,
    safeReturnUrl: safeReturnUrl,
    emailDomainAllowed: emailDomainAllowed
  });

})(window);

// Helper global de logout
;(function(global){
  try{
    global.logoutTalentos = async function(){
      if (!global.firebase || !firebase.auth) return;
      try { await firebase.auth().signOut(); } catch(e){ console.warn(e); }
      var page = (global.TalentosConfig && TalentosConfig.LOGIN_PAGE) || "login.html";
      location.replace(page);
    };
  }catch(e){ console.error(e); }
})(window);

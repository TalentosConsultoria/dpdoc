// --- AUTO-INIT de segurança: garante App DEFAULT antes de usar auth ---
(function () {
  try {
    var hasCompat = (typeof firebase !== 'undefined') && firebase.apps && firebase.apps.length > 0;
    var hasMod = (typeof firebase !== 'undefined') && firebase.getApps && firebase.getApps().length > 0;
    if (!hasCompat && !hasMod) {
      var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
      if (cfg) {
        firebase.initializeApp(cfg);
        console.log("[guard] Firebase App inicializado pelo guard (fallback).");
      } else {
        console.warn("[guard] Sem config para inicializar Firebase (TalentosConfig não encontrado).");
      }
    } else {
      console.log("[guard] Firebase App já estava inicializado.");
    }
  } catch (e) {
    console.error("[guard] Falha no auto-init do Firebase:", e);
  }
})();

(function (global) {
  function sameOrigin(url) {
    try {
      const target = new URL(url, window.location.href);
      return target.origin === window.location.origin;
    } catch (e) { return false; }
  }
  function isLoginPath(pathname) { return /(^|\/)login(\.html)?$/i.test(pathname); }
  function safeReturnUrl(candidate) {
    if (!candidate) return TalentosConfig.DEFAULT_RETURN;
    let url; try { url = new URL(candidate, window.location.href); } catch { return TalentosConfig.DEFAULT_RETURN; }
    if (!sameOrigin(url.href)) return TalentosConfig.DEFAULT_RETURN;
    if (isLoginPath(url.pathname)) return TalentosConfig.DEFAULT_RETURN;
    if (url.pathname === "/" || url.pathname === "") return "index.html" + url.search + url.hash;
    return url.pathname + url.search + url.hash;
  }
  async function ensureFirebaseAuthReady() {
    const auth = firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged((user) => { unsub(); resolve(user); });
    });
  }
  function emailDomainAllowed(email) {
    if (!email || typeof email !== "string") return false;
    const domain = email.slice(email.lastIndexOf("@")+1).toLowerCase();
    return TalentosConfig.ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith("." + d));
  }
  async function protect(options) {
    const cfg = Object.assign({ loginPage: TalentosConfig.LOGIN_PAGE }, options || {});
    const params = new URLSearchParams(window.location.search);
    const requestedReturn = params.get("return");
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const returnTarget = safeReturnUrl(requestedReturn || currentPath);
    const auth = firebase.auth();
    let user = await ensureFirebaseAuthReady();
    if (!user) { window.location.replace(cfg.loginPage + "?return=" + encodeURIComponent(returnTarget)); return; }
    if (!emailDomainAllowed(user.email)) {
      try { await auth.signOut(); } catch (e) {}
      window.location.replace(cfg.loginPage + "?error=forbidden&return=" + encodeURIComponent(returnTarget));
      return;
    }
    global.TalentosAuthGuard = global.TalentosAuthGuard || {};
    global.TalentosAuthGuard.currentUser = { uid: user.uid, email: user.email, displayName: user.displayName || null };
  }
  global.TalentosAuthGuard = Object.assign(global.TalentosAuthGuard || {}, { protect, safeReturnUrl, emailDomainAllowed });
})(window);

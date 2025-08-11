(function(){
  try {
    var hasCompat = (typeof firebase !== 'undefined') && firebase.apps && firebase.apps.length > 0;
    var hasMod = (typeof firebase !== 'undefined') && firebase.getApps && firebase.getApps().length > 0;
    if (!hasCompat && !hasMod) {
      var cfg = (window.TalentosConfig && (TalentosConfig.firebaseConfig || TalentosConfig)) || null;
      if (cfg) { firebase.initializeApp(cfg); console.log("[guard] App inicializado (fallback)."); }
    }
  } catch(e){ console.error("[guard] auto-init", e); }
})();
(function (global) {
  function sameOrigin(url) { try { const u=new URL(url,location.href); return u.origin===location.origin; } catch { return false; } }
  function isLoginPath(p) { return /(^|\/)login(\.html)?$/i.test(p); }
  function safeReturnUrl(candidate){
    if(!candidate) return TalentosConfig.DEFAULT_RETURN;
    let u; try{ u=new URL(candidate,location.href);}catch{ return TalentosConfig.DEFAULT_RETURN;}
    if(!sameOrigin(u.href)) return TalentosConfig.DEFAULT_RETURN;
    if(isLoginPath(u.pathname)) return TalentosConfig.DEFAULT_RETURN;
    if(u.pathname==="/"||u.pathname==="") return "index.html"+u.search+u.hash;
    return u.pathname+u.search+u.hash;
  }
  async function ensureAuthReady(){
    const auth=firebase.auth();
    try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);}catch{}
    return new Promise((res)=>{ const off=auth.onAuthStateChanged(u=>{off(); res(u);});});
  }
  function emailDomainAllowed(email){
    if(!email) return false; const d=String(email).split("@").pop().toLowerCase();
    return TalentosConfig.ALLOWED_DOMAINS.some(dom=> d===dom || d.endsWith("."+dom));
  }
  async function protect(opts){
    const cfg=Object.assign({loginPage:TalentosConfig.LOGIN_PAGE}, opts||{});
    const params=new URLSearchParams(location.search);
    const requested=params.get("return");
    const current=location.pathname+location.search+location.hash;
    const ret=safeReturnUrl(requested||current);
    const auth=firebase.auth();
    const user=await ensureAuthReady();
    if(!user){ location.replace(cfg.loginPage+"?return="+encodeURIComponent(ret)); return; }
    if(!emailDomainAllowed(user.email)){ try{await auth.signOut();}catch{}; location.replace(cfg.loginPage+"?error=forbidden&return="+encodeURIComponent(ret)); return; }
    global.TalentosAuthGuard=global.TalentosAuthGuard||{};
    global.TalentosAuthGuard.currentUser={ uid:user.uid, email:user.email, displayName:user.displayName||null };
  }
  global.TalentosAuthGuard=Object.assign(global.TalentosAuthGuard||{}, { protect, safeReturnUrl, emailDomainAllowed });
})(window);

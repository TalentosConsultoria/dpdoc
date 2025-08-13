/* auth-guard.js
 * Deve ser incluído em TODAS as páginas protegidas (ex.: index.html).
 * Nunca chama signInWithRedirect(). Apenas envia o usuário para login.html se não estiver logado.
 * Usa uma flag de sessão para evitar loops (ex.: em race conditions de carregamento).
 */
(function(){
  let app;
  try {
    app = firebase.app();
  } catch(e){
    console.error("Firebase não inicializado em página protegida:", e);
    return;
  }
  const auth = firebase.auth();
  const GUARD_FLAG = "guard_redirect_v1";

  auth.onAuthStateChanged((user)=>{
    if (user){
      sessionStorage.removeItem(GUARD_FLAG);
      // opcional: exibir email no cabeçalho, etc.
      const emailEl = document.querySelector("[data-user-email]");
      if (emailEl) emailEl.textContent = user.email || "";
      return;
    }
    const already = sessionStorage.getItem(GUARD_FLAG) === "1";
    if (!already){
      sessionStorage.setItem(GUARD_FLAG, "1");
      window.location.replace("./login.html");
    }
  });
})();

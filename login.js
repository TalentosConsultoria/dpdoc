/* login.js
 * Fluxo de autenticação exclusivo nesta página.
 * - Primeiro processa getRedirectResult()
 * - Tenta signInWithRedirect() somente UMA vez por sessão (sessionStorage)
 * - Se falhar, exibe botão para o usuário iniciar manualmente
 */
(function(){
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('signin-btn');
  const errBox = document.getElementById('error-box');

  function showError(e){
    console.error(e);
    errBox.textContent = (e && e.message) ? e.message : String(e);
    errBox.classList.remove('hidden');
  }
  function showButton(){
    btn.classList.remove('hidden');
    statusEl.textContent = "Clique para entrar com sua conta Microsoft.";
  }
  function validateDomain(email){
    if (!window.TalentosConfig || !window.TalentosConfig.allowedEmailDomain) return true;
    const dom = window.TalentosConfig.allowedEmailDomain.toLowerCase();
    const got = String(email||"").toLowerCase().split("@")[1];
    return got === dom;
  }

  let app;
  try {
    app = firebase.app();
  } catch(e){
    showError("Firebase não inicializado. Verifique config.js.");
    return;
  }
  const auth = firebase.auth();
  const provider = new firebase.auth.OAuthProvider('microsoft.com');
  // Escopo básico - ajuste se precisar
  provider.setCustomParameters({ prompt: 'select_account' });

  const TRIED_KEY = "ms_redirect_tried_v1";

  // 1) Se já está logado, vai para a index
  auth.onAuthStateChanged((user)=>{
    if (user){
      // Valida domínio do e-mail (segurança organizacional/LGPD)
      if (!validateDomain(user.email)) {
        auth.signOut();
        showError("Apenas contas @talentosconsultoria.com.br podem acessar.");
        showButton();
        return;
      }
      statusEl.textContent = "Autenticado. Redirecionando…";
      window.location.replace("./index.html");
    }
  });

  // 2) Processa o retorno do redirect (se houver)
  auth.getRedirectResult()
    .then((result)=>{
      if (result && result.user){
        statusEl.textContent = "Login concluído. Redirecionando…";
        // onAuthStateChanged acima cuidará do redirect
        return;
      }
      // 3) Se não logado, tenta redirect somente UMA vez
      if (!auth.currentUser){
        const tried = sessionStorage.getItem(TRIED_KEY) === "1";
        if (!tried){
          sessionStorage.setItem(TRIED_KEY, "1");
          statusEl.textContent = "Redirecionando para Microsoft…";
          return auth.signInWithRedirect(provider);
        } else {
          // Evita loops: já tentamos uma vez, agora mostramos botão
          showButton();
        }
      }
    })
    .catch((e)=>{
      // Em erro, permite tentativa manual e limpa a flag
      sessionStorage.removeItem(TRIED_KEY);
      showError(e);
      showButton();
    });

  // 4) Botão manual (fallback)
  btn.addEventListener('click', ()=>{
    statusEl.textContent = "Redirecionando para Microsoft…";
    auth.signInWithRedirect(provider).catch((e)=>{
      showError(e);
    });
  });

})();

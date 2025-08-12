(function (global) {
  const G = global;
  const LG = (m) => console.log(`[AUTHGUARD] ${m}`);
  const ERR = (m, e) => console.error(`[AUTHGUARD] ${m}`, e);

  const config = G.TalentosConfig || {};
  const redirectOnFail = `${config.loginPage || 'login.html'}?error=forbidden`;
  const defaultReturn = `${config.redirectAfterLogin || 'index.html'}`;

  // Tenta redirecionar para a página anterior, evitando loops
  function safeReturnUrl(url) {
    if (!url || url.includes(config.loginPage)) {
      return defaultReturn;
    }
    const safeUrl = new URL(url, window.location.origin);
    return safeUrl.origin === window.location.origin ? safeUrl.pathname + safeUrl.search : defaultReturn;
  }

  G.TalentosAuthGuard = {
    emailDomainAllowed: (email) => {
      const allowedDomains = (config.allowedDomains || []).map(d => d.toLowerCase());
      const userDomain = (email || '').split('@').pop().toLowerCase();
      return allowedDomains.length === 0 || allowedDomains.includes(userDomain);
    },

    // A função principal de proteção.
    protect: () => {
      try {
        const auth = firebase.auth();
        auth.onAuthStateChanged(user => {
          if (user) {
            if (TalentosAuthGuard.emailDomainAllowed(user.email)) {
              // Usuário autenticado e com domínio permitido.
              LG('Acesso permitido.');
              document.documentElement.removeAttribute('data-auth');
              document.body.style.visibility = 'visible';
            } else {
              // Domínio inválido. Desconecta e redireciona.
              LG('Domínio de e-mail não permitido. Desconectando...');
              auth.signOut().then(() => {
                window.location.replace(redirectOnFail);
              });
            }
          } else {
            // Sem usuário. Redireciona para a página de login.
            LG('Nenhum usuário autenticado. Redirecionando...');
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.replace(`${config.loginPage}?return=${returnUrl}`);
          }
        });
      } catch (e) {
        ERR('Falha ao inicializar o guardião de autenticação.', e);
        // Fallback: em caso de erro, remove a restrição para evitar a tela branca.
        document.documentElement.removeAttribute('data-auth');
        document.body.style.visibility = 'visible';
      }
    }
  };

  // Garante que o corpo da página fica visível em caso de erro no script
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (document.documentElement.getAttribute('data-auth') === 'checking') {
        ERR('O script de autenticação não respondeu a tempo. Liberando a página como fallback.');
        document.documentElement.removeAttribute('data-auth');
        document.body.style.visibility = 'visible';
      }
    }, 1500);
  });
})(window);
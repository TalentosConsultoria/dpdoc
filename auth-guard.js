(function (global) {
  const G = global;
  const LG = (m) => console.log(`[AUTHGUARD] ${m}`);
  const ERR = (m, e) => console.error(`[AUTHGUARD] ${m}`, e);

  // A função principal de proteção.
  const protect = () => {
    // Garante que o corpo da página fica visível em caso de erro no script
    setTimeout(() => {
      const isChecking = document.documentElement.getAttribute('data-auth') === 'checking';
      if (isChecking) {
        ERR('O script de autenticação não respondeu a tempo. Liberando a página como fallback.');
        document.documentElement.removeAttribute('data-auth');
        document.body.style.visibility = 'visible';
      }
    }, 1500);

    try {
      const config = G.TalentosConfig;
      if (!config || !G.firebase) {
        throw new Error("Firebase ou configuração não carregados.");
      }

      const auth = firebase.auth();
      const redirectOnFail = `${config.LOGIN_PAGE || 'login.html'}?error=forbidden`;
      const emailDomainAllowed = (email) => {
        const allowedDomains = (config.ALLOWED_DOMAINS || []).map(d => d.toLowerCase());
        const userDomain = (email || '').split('@').pop().toLowerCase();
        return allowedDomains.length === 0 || allowedDomains.includes(userDomain);
      };

      auth.onAuthStateChanged(user => {
        if (user) {
          if (emailDomainAllowed(user.email)) {
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
          window.location.replace(`${config.LOGIN_PAGE}?return=${returnUrl}`);
        }
      });
    } catch (e) {
      ERR('Falha ao inicializar o guardião de autenticação.', e);
      // Fallback: em caso de erro, remove a restrição para evitar a tela branca.
      document.documentElement.removeAttribute('data-auth');
      document.body.style.visibility = 'visible';
    }
  };

  G.TalentosAuthGuard = {
    protect
  };

  // Chama a função protect assim que o arquivo é carregado
  protect();
})(window);
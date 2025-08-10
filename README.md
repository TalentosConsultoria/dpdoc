# Talentos Auth Package v3.1 — Firebase compat 10.12.4 (redirect-only)

Configuração pronta para o projeto **talentosbd-e4206**.

## Alterações nesta versão:
- `config.js` já com sua `firebaseConfig` real preenchida.
- `login.html` com diagnóstico detalhado (`error.code` e `error.message`) para falhas de login/redirect.
- Fluxo redirect-only com anti-loop.
- `auth-guard.js` unificado e seguro.

## Passos obrigatórios
1) Certifique-se que `dpdoc.talentosconsultoria.com.br` está listado em Firebase → Authentication → Settings → Authorized domains.
2) No Azure Entra ID, o Redirect URI (Web) deve estar:
   `https://talentosbd-e4206.firebaseapp.com/__/auth/handler`
3) Firebase → Authentication → Sign-in method → Microsoft: habilitado com o mesmo App do Azure.
4) Suba os arquivos para o seu host (`dpdoc.talentosconsultoria.com.br`) mantendo a estrutura.

## Teste
- `/index.html` deslogado → `/login.html?return=index.html` → login → volta autenticado.
- Conta fora do domínio → bloqueia e faz sign-out.
- `return` externo → ignorado (fallback `index.html`).

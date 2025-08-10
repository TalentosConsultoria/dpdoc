# Talentos Auth Package v2 (redirect-only) — Firebase compat 10.12.4

Correções desta versão:
- `login.html` usa **apenas redirect** (remove popup) para eliminar o efeito abre/fecha.
- Anti-loop de redirecionamento com `sessionStorage`.
- `config.js` valida se `firebaseConfig` contém placeholders e mostra aviso na UI.
- Guard unificado inalterado (usa `safeReturnUrl`, valida domínio, persistence LOCAL).
- `README.md` com checklist de configuração (Firebase/Azure) e testes.

## Passos obrigatórios após subir os arquivos
1) Em `config.js`, cole a **firebaseConfig real** (Console do Firebase → Configurações do projeto → Seus apps → Configuração).
2) Firebase → Authentication → Settings → **Authorized domains**: adicione `dpdoc.talentosconsultoria.com.br` (e outros hosts que usará).
3) Azure Entra ID → App registrations → Seu App → **Redirect URIs** (Web):
   `https://<SEU_AUTH_DOMAIN_DO_FIREBASE>/__/auth/handler`
   Ex.: `https://talentos-auth.web.app/__/auth/handler`
4) Firebase → Authentication → Sign-in method → Microsoft: use o mesmo App (Client ID/Secret) do passo 3.
5) Teste: acesse `/index.html` deslogado → deve ir a `/login.html?return=index.html` → autentica → volta logado.

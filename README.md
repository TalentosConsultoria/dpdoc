# Talentos Auth Demo (MSAL + Firebase)

Projeto estático para GitHub Pages/Cloudflare com login Microsoft (MSAL, redirect flow) e inicialização de Firebase para uso como banco.

## Estrutura
- `login.html` – inicia o fluxo MSAL por redirect, valida tenant e domínio e redireciona para `index.html`.
- `index.html` – página protegida. Se não houver sessão, volta para `login.html`. Mostra o usuário e inclui um teste de leitura do Firestore.
- `assets/js/config.js` – parâmetros do tenant, clientId, domínio aceito e Firebase.
- `assets/js/msal-init.js` – inicializa MSAL e conduz o fluxo de redirect no login.
- `assets/js/auth.js` – guardas para páginas protegidas e utilitários de token.
- `assets/js/firebase-init.js` – inicializa Firebase (App + Firestore) via módulos ESM.
- `assets/css/styles.css` – estilo simples, consistente com páginas estáticas.

## Observações de Segurança
- A validação usa `tid` (tenant) e `preferred_username` (e-mail) do **ID Token**.
- O armazenamento é `sessionStorage` e o logout limpa sessão e faz `logoutRedirect`.
- Para **gravação** no Firestore com este setup 100% front-end, avalie emitir **Custom Tokens** via backend/worker (ex.: Cloudflare Worker) ou ajustar regras temporariamente apenas para leitura.

## Dica de Redirect URI
- Cadastre no Azure AD a URL exata da `login.html`, por exemplo:
  `https://dpdoc.talentosconsultoria.com.br/login.html`

## Teste do Firestore
- Crie (manual) o doc `_demo/hello` com `{ "msg": "world" }` para ver o teste funcionar.


## Validações aplicadas no ID Token
- `tid` (tenant) deve ser igual ao informado em `AAD_TENANT_ID`.
- `preferred_username` deve terminar com `@talentosconsultoria.com.br`.
- `aud` (clientId) deve ser igual ao `AAD_CLIENT_ID` do app.

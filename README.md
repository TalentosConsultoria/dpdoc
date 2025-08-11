# Talentos Auth v3.4 (Cloudflare-safe)
- `auth-guard.js` com **auto-init** (se `config.js` ainda não rodou).
- HTMLs com `data-cfasync="false"` para evitar reordenação do Rocket Loader.
- `config.js` inicializa o Firebase e expõe `TalentosConfig` (com aliases).

## Ordem dos scripts (obrigatória)
firebase-app-compat → firebase-auth-compat → config.js → auth-guard.js → `TalentosAuthGuard.protect()`.

## Se usar Cloudflare
- Faça **Purge cache**.
- Opcional: crie regra para Rocket Loader OFF em `config.js`, `auth-guard.js`, `index.html`, `login.html`.

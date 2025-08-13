# DPDoc • Correção de Loop de Autenticação e Visualização de Documentos

Este pacote corrige o loop de autenticação e organiza o fluxo de login com Microsoft (Azure AD) via Firebase **compat**.

## Como funciona

- **login.html**: única página que executa `signInWithRedirect()`. Primeiro roda `getRedirectResult()`. Tenta o redirect **só uma vez por sessão** usando `sessionStorage`. Em caso de erro, exibe botão para tentativa manual.
- **index.html**: página protegida. Usa `auth-guard.js` que apenas verifica `onAuthStateChanged`; se não logado, envia para `login.html`. **Nunca** chama `signInWithRedirect()`.
- **config.js**: inicializa o Firebase uma única vez por página. Evita reinit duplicado.
- `.bdoc`: não renderiza no navegador; o fluxo força **download**. PDFs abrem no `<iframe>` desde que o **Content-Type** e **CORS** estejam corretos.

## Passos de implantação

1. **Backups**: faça backup dos seus arquivos atuais.
2. Substitua/adicione estes arquivos no seu host:
   - `login.html`
   - `index.html`
   - `config.js`
   - `login.js`
   - `auth-guard.js`
3. Confirme que **apenas** `login.html` contém a lógica de redirect. `index.html` e outras páginas protegidas devem carregar `config.js` + `auth-guard.js`.
4. **Firebase Console → Authentication → Settings → Authorized domains**: inclua `dpdoc.talentosconsultoria.com.br` e `auth.talentosconsultoria.com.br` se for usar ambos.
5. **Firebase Console → Authentication → Sign-in method**: habilite Microsoft e configure o app Azure AD.
6. Se usa Firebase Hosting/Storage com CDN e *service worker*, limpe cache/versão para evitar rotas antigas que causam loop.

## CORS e Content-Type (para PDF)

No Firebase Storage, PDFs devem possuir `Content-Type: application/pdf`. Se necessário:

```bash
# gsutil (opcional para CORS)
gsutil cors set cors.json gs://talentosbd-e4206.appspot.com
```

`cors.json` exemplo:
```json
[
  {
    "origin": ["https://dpdoc.talentosconsultoria.com.br"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Boas práticas de segurança (LGPD)

- Restringir o domínio de e-mail corporativo (já previsto em `login.js`).
- Expor o botão **Sair** sempre visível.
- Usar `LOCAL` persistence para reduzir relogin forçado, mas preferir sessões curtas no Azure AD quando necessário.
- Manter `Authorized domains` estritamente necessários.
- Evitar expor dados pessoais em logs do navegador/console.

## Problemas comuns e soluções

- **Loop contínuo:**
  - `index.html` chamando redirect (remova).
  - Inicialização duplicada do Firebase (use apenas `config.js`).
  - Não aguardar `getRedirectResult()` no `login.html` antes de redirecionar.
- **PDF em branco:** Content-Type incorreto ou CORS bloqueando. Ajustar metadados do arquivo e CORS (acima).
- **.bdoc não abre:** comportamento esperado. Somente download.

## Suporte rápido

Se ainda houver loop:
- Abra `login.html` em aba anônima e veja o console (F12) para mensagens do `login.js`.
- Verifique se `sessionStorage` contém `ms_redirect_tried_v1`. Feche/abra a aba para limpar.
- Confirme “Microsoft” habilitado no Firebase e o **Redirect URI** do Azure AD está exatamente como o do Firebase.

# Talentos Intranet — Implantação com Microsoft Entra ID (MSAL)

Este pacote adiciona autenticação **Entra ID** (MSAL) à sua Wiki estática, sem alterar o visual.
Arquivos novos:
- `login.html` — página de entrada
- `msal-config.js` — configuração do MSAL (clientId/tenant/redirect)
- `auth-guard.js` — proteção de rotas e helpers (logout, token)

## 1) App Registration (Azure Entra ID)
- Tipo: Single-page application (SPA)
- **IDs**: 
  - Tenant: `cba0be9f-94ad-4a26-b291-fa90af7491ee`
  - Client: `aceb5b29-df99-4d90-8533-233407b08a2c`
- **Redirect URIs (SPA)**:
  - `https://dpdoc.talentosconsultoria.com.br/login.html`
  - `https://dpdoc.talentosconsultoria.com.br/index.html`
- Supported account types: **Single tenant**.
- Permissões: Microsoft Graph `User.Read` (delegada).

> Se você usar outro subdomínio/ambiente (homolog/dev), adicione os respectivos URIs.

## 2) Publicação (duas opções)

**A) Cloudflare Pages (estático)**
1. Crie um projeto e faça upload da pasta da intranet (ou conecte ao repositório).
2. Em *Custom Domains*, aponte `dpdoc.talentosconsultoria.com.br`.
3. Ative TLS (Full, mínimo TLS 1.2) e HTTP->HTTPS.
4. Regras de cache:
   - Bypass para `/login.html` e `/index.html` (evitar cache de redirect).
5. Segurança:
   - WAF ativado, Bot Fight, e Rate Limiting se necessário.

**B) Nginx + Cloudflare (edge)**
1. Nginx servindo estático (`index.html`, `login.html`, `styles.css`, `script.js`).
2. Headers recomendados (Nginx):
   ```
   add_header Content-Security-Policy "default-src 'self' https://alcdn.msauth.net; script-src 'self' https://alcdn.msauth.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://login.microsoftonline.com;";
   add_header X-Content-Type-Options nosniff;
   add_header X-Frame-Options DENY;
   add_header Referrer-Policy no-referrer-when-downgrade;
   add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
   ```
   > Ajuste CSP conforme recursos adicionais.

## 3) Como funciona a proteção
- `index.html` carrega `msal-config.js` e `auth-guard.js`.
- Se **não autenticado** ou e-mail não termina com `@talentosconsultoria.com.br`, redireciona para `login.html`.
- `login.html` realiza o fluxo MSAL `loginRedirect`.
- Após o login, volta para `index.html`.
- `logout()` faz `logoutRedirect()`.

## 4) LGPD e segurança
- Tokens ficam em **sessionStorage** (reduz risco de persistência indevida).
- Não armazenamos dados pessoais além do que MSAL mantém localmente para a sessão.
- Registre acessos apenas no servidor/edge (Cloudflare) com política de retenção mínima.
- Opcional: Conditonal Access (MFA, dispositivos conformes).

## 5) Testes
- Teste local via `http://127.0.0.1:5500/` (Live Server), porém MSAL exige HTTPS e URIs idênticas às registradas para redirecionamento funcionar.
- Em produção, teste:
  - `/login.html` abre e redireciona para a Microsoft.
  - Após login, `/index.html` é exibido e **permanece** logado.
  - `logout()` retorna à `login.html`.

## 6) Ajustes úteis
- Para exibir o nome do usuário autenticado:
  ```html
  <span id="who"></span>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      if (window.getAuthAccount) {
        const acc = window.getAuthAccount();
        if (acc) document.getElementById("who").textContent = acc.name || acc.username;
      }
    });
  </script>
  ```
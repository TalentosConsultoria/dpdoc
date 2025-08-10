# Talentos Auth Package (Firebase compat 10.12.4 + Microsoft OAuth)

Este pacote padroniza autenticação para páginas estáticas protegidas.
Fluxo oficial único: **login.html** → Microsoft OAuth → retorno seguro → guard.

## O que vem
- `config.js`: fonte única da `firebaseConfig` (preencha seus valores reais).
- `auth-guard.js`: guard unificado para todas as páginas protegidas.
- `login.html`: login com popup→fallback em redirect, validação de domínio `@talentosconsultoria.com.br` e `return` seguro (mesma origem e não aponta para login).
- `index.html`: exemplo protegido usando `auth-guard.js`.
- `protected-template.html`: modelo para aplicar em outras páginas protegidas (copie este cabeçalho).
- `index-debug.html`: painel de depuração baseado em Firebase Auth real (sem `sessionStorage`).
- `README.md`: este arquivo.

## Como usar
1) Hospede todos os arquivos no mesmo host (ex.: `https://dpdoc.talentosconsultoria.com.br/`).
2) Preencha sua `firebaseConfig` real dentro de `config.js` (há TODOs marcados).
3) Em **todas** as páginas protegidas, inclua (na ordem):
   ```html
   <script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js"></script>
   <script src="./config.js"></script>
   <script src="./auth-guard.js"></script>
   <script>TalentosAuthGuard.protect();</script>
   ```
4) Remova quaisquer referências antigas a `login-firebase.html`. O único login é `login.html`.
5) **Opcional**: ajuste `ALLOWED_DOMAINS` em `auth-guard.js` se quiser permitir mais domínios.

## Segurança
- `safeReturnUrl()` só permite retorno para a **mesma origem** e bloqueia `login*.html`.
- Validação de e-mail termina com `@talentosconsultoria.com.br` (ou domínios extras que você add).
- Persistência LOCAL do Firebase Auth; sign-out se e-mail não autorizado.
- CSP e `Referrer-Policy` recomendadas no seu host/CDN.

## Testes recomendados
- Acessar `/index.html` deslogado → redireciona para `/login.html?return=index.html`.
- Logar com conta do domínio permitido → retorna à página e permanece logado.
- Logar com conta **fora** do domínio → sign-out imediato e volta ao login com erro.
- Navegar entre páginas protegidas sem reautenticar.
- Testar `return` malicioso (outras origens) → deve cair no fallback `/index.html`.

## Suporte a normas e conformidade
- Evita open redirect.
- Minimiza exposição de dados: não loga tokens no console, apenas estados.
- Compatível com boas práticas de segurança da informação.

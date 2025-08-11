# DPDoc — Single Page (GitHub Pages + Cloudflare + Firebase Auth/Firestore)

Este pacote reduz tudo a **uma única página** (`index.html`) e usa **Firebase Auth com Microsoft** via **popup** (com fallback para redirect). Não há dependência do `__/auth/handler`, então funciona em **GitHub Pages + Cloudflare** sem precisar de Firebase Hosting.

## O que você precisa conferir

1) **Firebase Console → Authentication**
   - Provedor **Microsoft** ativado com **Client ID/Secret** do Azure.
   - Em **Configurações → Domínios autorizados** deve ter:
     - `talentosbd-e4206.firebaseapp.com` (default do projeto)
     - `talentosbd-e4206.web.app` (ok manter)
     - `dpdoc.talentosconsultoria.com.br` (seu domínio do site)
   - Em **Regras do Firestore**, libere o acesso a usuários autenticados (exemplo mínimo):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

2) **Azure Entra ID → App registrations (seu app MS) → Authentication**
   - Mantenha o Redirect URI do Firebase:
     `https://talentosbd-e4206.firebaseapp.com/__/auth/handler`
   - (É usado apenas no *fallback* de redirect — o fluxo principal é *popup*).

3) **GitHub Pages + Cloudflare**
   - Nada especial. Somente garanta HTTPS e que popups não estejam bloqueados pelo navegador.

## Como usar

- Publique **apenas** `index.html` na raiz do repositório do GitHub Pages.
- Abra `https://dpdoc.talentosconsultoria.com.br`.
- Clique em **Entrar com Microsoft**.
- Após logado, use os botões **Gravar doc** e **Ler doc** para testar o Firestore.

Qualquer ajuste de domínio permitido, altere no topo do `index.html`:
```js
const APP = { allowedDomain: "talentosconsultoria.com.br" };
```

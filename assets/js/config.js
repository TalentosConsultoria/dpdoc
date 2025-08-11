/* assets/js/config.js
 * Centraliza a configuração.
 * Edite apenas se mudar tenant/cliente ou o caminho do site.
 */
window.TalentosConfig = {
  firebase: {
    apiKey: "AIzaSyDgm9XVyk3myuMdpU7lGHm6z5gRyOKmiyw",
    authDomain: "talentosbd-e4206.firebaseapp.com",
    projectId: "talentosbd-e4206",
    storageBucket: "talentosbd-e4206.appspot.com",
    messagingSenderId: "688471762561",
    appId: "1:688471762561:web:119a3758d63a8df7126a4b"
  },
  // Tenant AAD e aplicação (MSAL)
  AAD_TENANT_ID: "cba0be9f-94ad-4a26-b291-fa90af7491ee",
  AAD_CLIENT_ID: "aceb5b29-df99-4d90-8533-233407b08a2c",

  // Domínio aceito (checagem extra por e-mail)
  ALLOWED_EMAIL_DOMAIN: "talentosconsultoria.com.br",

  // Página padrão após login
  POST_LOGIN_PAGE: "index.html",

  // Opcional: escopo do Microsoft Graph se precisar (ex.: perfil básico)
  MSAL_SCOPES: ["User.Read"]
};

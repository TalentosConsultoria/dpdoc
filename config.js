/* config.js
 * Inicializa o Firebase usando objeto global window.TalentosConfig fornecido no HTML.
 * Garanta que window.TalentosConfig.firebase contenha as chaves do projeto.
 */
(function () {
  if (!window.TalentosConfig || !window.TalentosConfig.firebase) {
    console.error("TalentosConfig.firebase não encontrado. Defina em <script> antes de carregar config.js.");
    return;
  }
  // Evita reinit múltiplo
  if (firebase.apps && firebase.apps.length) return;

  firebase.initializeApp(window.TalentosConfig.firebase);
  // Opcional: persisência em LOCAL para não perder sessão em reload
  try {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  } catch(e){ console.warn("Persistência não ajustada:", e); }
})();

// assets/js/firebase-init.js
// Inicializa Firebase (apenas App e Firestore como exemplo).
// Import via módulos para funcionar no GitHub Pages + Cloudflare sem bundler.
(async function(){
  const cfg = window.TalentosConfig?.firebase;
  if (!cfg) {
    console.warn("Config Firebase ausente. Pulando init.");
    return;
  }

  // Carrega módulos do Firebase dinamicamente
  const [{ initializeApp }, { getFirestore, doc, getDoc }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js")
  ]);

  const app = initializeApp(cfg);
  const db = getFirestore(app);
  window.__firebaseApp = app;
  window.__firestore = db;

  // Exemplo de leitura controlada (ajuste conforme suas regras do Firestore)
  async function readSample() {
    try {
      const ref = doc(db, "_demo", "hello");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        console.log("Firestore _demo/hello:", snap.data());
        const el = document.querySelector("#firestore-status");
        if (el) el.textContent = "Firestore OK: " + JSON.stringify(snap.data());
      } else {
        console.log("Documento _demo/hello não encontrado.");
        const el = document.querySelector("#firestore-status");
        if (el) el.textContent = "Firestore OK: documento não encontrado";
      }
    } catch (e) {
      console.error("Erro ao acessar Firestore:", e);
      const el = document.querySelector("#firestore-status");
      if (el) el.textContent = "Erro Firestore: " + e.message;
    }
  }

  window.TalentosDB = { app, db, readSample };
})();

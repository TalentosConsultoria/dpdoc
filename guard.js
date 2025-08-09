// =========================
// Configuração Firebase
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyAL8t7sgoCoNj3nkfUG3mkz0WEpRmH3K8",
  authDomain: "talentosbd-e4206.firebaseapp.com",
  projectId: "talentosbd-e4206"
  // appId, etc. são opcionais para Auth
};
if (!window.firebase?.apps?.length) firebase.initializeApp(firebaseConfig);

// =========================
// Configuração de segurança
// =========================
const ORG_DOMAIN = "talentosconsultoria.com.br";
const LOGIN_PAGE = "login.html";

function pageName() {
  const path = location.pathname.split("/").pop();
  return path || "index.html";
}

function goLogin(reason) {
  const ret = encodeURIComponent(pageName() + (location.search || "") + (location.hash || ""));
  location.replace(`${LOGIN_PAGE}?return=${ret}${reason ? `&reason=${reason}` : ""}`);
}

// =========================
// Guard de autenticação
// =========================
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    goLogin("no-session");
    return;
  }
  const em = (user.email || "").toLowerCase();
  if (!em.endsWith(`@${ORG_DOMAIN}`)) {
    await firebase.auth().signOut();
    goLogin("wrong-domain");
    return;
  }

  // Mostra barra de usuário, se existir
  const ub = document.getElementById("userbar");
  const ue = document.getElementById("uemail");
  if (ub && ue) {
    ue.textContent = em;
    ub.style.display = "flex";
  }
});

// Logout, se botão existir
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await firebase.auth().signOut();
      goLogin("logout");
    });
  }
});

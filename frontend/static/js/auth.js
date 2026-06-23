// Kimlik doğrulama: giriş, çıkış, oturum durumu, rol bazlı görünürlük.
const Auth = (() => {
  let currentUser = null;

  const isAdmin = () => currentUser && currentUser.role === "admin";
  const isEditor = () => currentUser && ["admin", "editor"].includes(currentUser.role);
  const getUser = () => currentUser;

  function showLogin() {
    document.getElementById("login-view").classList.remove("hidden");
    document.getElementById("app-view").classList.add("hidden");
  }

  function showApp() {
    document.getElementById("login-view").classList.add("hidden");
    document.getElementById("app-view").classList.remove("hidden");
  }

  function applyRoleVisibility() {
    // Sadece editör+ görebilecek öğeler
    document.querySelectorAll(".editor-only").forEach((el) => {
      el.style.display = isEditor() ? "" : "none";
    });
    // Admin sekmesi
    const usersTab = document.getElementById("tab-users");
    if (usersTab) usersTab.hidden = !isAdmin();
  }

  async function loadCurrentUser() {
    currentUser = await API.get("/auth/me");
    const chip = document.getElementById("current-user");
    chip.textContent = `${currentUser.username} · ${roleLabel(currentUser.role)}`;
    applyRoleVisibility();
    return currentUser;
  }

  function roleLabel(role) {
    return { admin: "Admin", editor: "Editör", viewer: "İzleyici" }[role] || role;
  }

  async function init() {
    if (!API.getToken()) { showLogin(); return false; }
    try {
      await loadCurrentUser();
      showApp();
      return true;
    } catch {
      API.clearToken();
      showLogin();
      return false;
    }
  }

  function logout() {
    API.clearToken();
    currentUser = null;
    showLogin();
  }

  function bindLoginForm(onSuccess) {
    const form = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      try {
        const data = await API.login(username, password);
        API.setToken(data.access_token);
        await loadCurrentUser();
        showApp();
        onSuccess && onSuccess();
      } catch (err) {
        errEl.textContent = err.message;
      }
    });
  }

  return { init, logout, bindLoginForm, isAdmin, isEditor, getUser, roleLabel, showLogin };
})();

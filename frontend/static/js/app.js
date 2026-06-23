// ===================== UI YARDIMCILARI =====================
const UI = {
  esc(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  },
  fmtDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt)) return "—";
    return dt.toLocaleDateString("tr-TR");
  },
  fmtMoney(n) {
    const num = Number(n || 0);
    return num.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },
  openModal(html) {
    document.getElementById("modal-body").innerHTML = html;
    document.getElementById("modal-overlay").classList.remove("hidden");
  },
  closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-body").innerHTML = "";
  },
  toast(msg, type = "") {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },
};

// Durum → renk (backend colors.py ile tutarlı)
const MapColors = {
  STATUS: { aktif: "#4f6ef7", beklemede: "#f39c12", tamamlandi: "#27ae60", iptal: "#95a5a6" },
  status(s) { return this.STATUS[s] || "#95a5a6"; },
};


// ===================== KULLANICILAR (Admin) =====================
const Users = (() => {
  async function render() {
    const users = await API.get("/auth/users");
    const box = document.getElementById("users-list");
    box.innerHTML = users.map((u) => `
      <div class="project-card" style="cursor:default">
        <div class="card-meta">
          <span class="badge" style="background:${u.role === "admin" ? "#e74c3c" : u.role === "editor" ? "#4f6ef7" : "#95a5a6"}">
            ${Auth.roleLabel(u.role)}
          </span>
          ${u.is_active ? "" : `<span class="pill">Pasif</span>`}
        </div>
        <h4>${UI.esc(u.username)}</h4>
        <div class="muted">${UI.esc([u.first_name, u.last_name].filter(Boolean).join(" ")) || "—"}</div>
        <div class="muted">${UI.esc(u.email) || "—"}</div>
        <div class="modal-actions" style="margin-top:8px;justify-content:flex-start">
          <button class="btn btn-sm" data-edit-user="${u.id}">✏️ Düzenle</button>
        </div>
      </div>`).join("") || `<p class="muted">Kullanıcı yok.</p>`;
    box.querySelectorAll("[data-edit-user]").forEach((el) =>
      el.onclick = () => openEditForm(users.find((u) => u.id === +el.dataset.editUser)));
  }

  function openForm() {
    UI.openModal(`
      <h3>Yeni Kullanıcı</h3>
      <form id="user-form">
        <div class="form-grid">
          <div class="form-row"><label>Kullanıcı Adı</label><input name="username" required /></div>
          <div class="form-row"><label>Parola</label><input name="password" type="password" required /></div>
          <div class="form-row"><label>Ad</label><input name="first_name" /></div>
          <div class="form-row"><label>Soyad</label><input name="last_name" /></div>
          <div class="form-row"><label>E-posta</label><input name="email" type="email" /></div>
          <div class="form-row"><label>Sistem Rolü</label>
            <select name="role">
              <option value="viewer">İzleyici</option>
              <option value="editor">Editör</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-row"><label>Meslek Rolü</label>
            <select name="meslek_rolu">
              <option value="">— Seçiniz —</option>
              <option value="ELK">⚡ Elektrik/Otomasyon Müh.</option>
              <option value="PLC">🔷 PLC Programcısı</option>
              <option value="SCADA">🖥️ SCADA Mühendisi</option>
              <option value="SAHA">🔧 Saha Teknisyeni</option>
              <option value="PM">📋 Proje Müdürü</option>
            </select>
          </div>
        </div>
        <div class="form-error" id="uf-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="uf-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("uf-cancel").onclick = () => UI.closeModal();
    document.getElementById("user-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      if (!data.meslek_rolu) delete data.meslek_rolu;
      try {
        await API.post("/auth/register", data);
        UI.toast("Kullanıcı oluşturuldu", "success");
        UI.closeModal();
        render();
      } catch (err) {
        document.getElementById("uf-error").textContent = err.message;
      }
    };
  }

  function openEditForm(u) {
    UI.openModal(`
      <h3>Kullanıcı Düzenle — ${UI.esc(u.username)}</h3>
      <form id="ue-form">
        <div class="form-grid">
          <div class="form-row"><label>Ad</label><input name="first_name" value="${UI.esc(u.first_name)}" /></div>
          <div class="form-row"><label>Soyad</label><input name="last_name" value="${UI.esc(u.last_name)}" /></div>
          <div class="form-row"><label>E-posta</label><input name="email" type="email" value="${UI.esc(u.email)}" /></div>
          <div class="form-row"><label>Rol</label>
            <select name="role">
              <option value="viewer" ${u.role === "viewer" ? "selected" : ""}>İzleyici</option>
              <option value="editor" ${u.role === "editor" ? "selected" : ""}>Editör</option>
              <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
          </div>
          <div class="form-row"><label>Meslek Rolü</label>
            <select name="meslek_rolu">
              <option value="" ${!u.meslek_rolu ? "selected" : ""}>— Seçiniz —</option>
              <option value="ELK"   ${u.meslek_rolu === "ELK"   ? "selected" : ""}>⚡ Elektrik/Otomasyon Müh.</option>
              <option value="PLC"   ${u.meslek_rolu === "PLC"   ? "selected" : ""}>🔷 PLC Programcısı</option>
              <option value="SCADA" ${u.meslek_rolu === "SCADA" ? "selected" : ""}>🖥️ SCADA Mühendisi</option>
              <option value="SAHA"  ${u.meslek_rolu === "SAHA"  ? "selected" : ""}>🔧 Saha Teknisyeni</option>
              <option value="PM"    ${u.meslek_rolu === "PM"    ? "selected" : ""}>📋 Proje Müdürü</option>
            </select>
          </div>
          <div class="form-row"><label>Durum</label>
            <select name="is_active">
              <option value="true" ${u.is_active ? "selected" : ""}>Aktif</option>
              <option value="false" ${!u.is_active ? "selected" : ""}>Pasif</option>
            </select>
          </div>
        </div>
        <div class="form-error" id="ue-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ue-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("ue-cancel").onclick = () => UI.closeModal();
    document.getElementById("ue-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.patch(`/auth/users/${u.id}`, {
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          email: fd.get("email"),
          role: fd.get("role"),
          meslek_rolu: fd.get("meslek_rolu") || "",
          is_active: fd.get("is_active") === "true",
        });
        UI.toast("Kullanıcı güncellendi", "success");
        UI.closeModal();
        render();
      } catch (err) {
        document.getElementById("ue-error").textContent = err.message;
      }
    };
  }

  return { render, openForm };
})();


// ===================== BİLDİRİM MODÜLÜ =====================
const Notif = (() => {
  let pollTimer = null;

  async function yukle() {
    try {
      const list = await API.get("/auth/notifications");
      renderBadge(list);
      renderList(list);
    } catch (_) {}
  }

  function renderBadge(list) {
    const badge = document.getElementById("notif-badge");
    if (!badge) return;
    const unread = list.filter(b => !b.okundu).length;
    badge.textContent = unread > 9 ? "9+" : unread;
    badge.classList.toggle("hidden", unread === 0);
  }

  function renderList(list) {
    const el = document.getElementById("notif-list");
    if (!el) return;
    if (!list.length) {
      el.innerHTML = `<p class="muted" style="padding:12px;text-align:center">Bildirim yok</p>`;
      return;
    }
    el.innerHTML = list.map(b => `
      <div class="notif-item${b.okundu ? "" : " unread"}" data-id="${b.id}">
        <div class="notif-item-title">${UI.esc(b.baslik)}</div>
        ${b.mesaj ? `<div class="notif-item-msg">${UI.esc(b.mesaj)}</div>` : ""}
        <div class="notif-item-meta">${new Date(b.olusturuldu).toLocaleString("tr-TR")}</div>
      </div>`).join("");

    el.querySelectorAll(".notif-item.unread").forEach(el2 => {
      el2.addEventListener("click", async () => {
        const id = el2.dataset.id;
        await API.post(`/auth/notifications/${id}/oku`, {});
        yukle();
      });
    });
  }

  function ac() {
    document.getElementById("notif-panel").classList.remove("hidden");
    yukle();
  }

  function kapat() {
    document.getElementById("notif-panel").classList.add("hidden");
  }

  function bindEvents() {
    const btn = document.getElementById("notif-btn");
    const panel = document.getElementById("notif-panel");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.contains("hidden") ? ac() : kapat();
    });
    document.addEventListener("click", (e) => {
      if (!document.getElementById("notif-wrap").contains(e.target)) kapat();
    });
    document.getElementById("notif-oku-hepsi").addEventListener("click", async () => {
      await API.post("/auth/notifications/oku-hepsi", {});
      yukle();
    });
    // 60 saniyede bir polling
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(yukle, 60000);
  }

  return { yukle, bindEvents };
})();


// ===================== ANA UYGULAMA =====================
const App = (() => {
  let currentTab = "map";

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${tab}`).classList.add("active");

    if (tab === "map")      MapView.render();
    if (tab === "projects") Projects.load({ resetPage: true });
    if (tab === "reports")  Reports.renderCharts();
    if (tab === "techdocs") TechDocs.load();
    if (tab === "specs")    Specs.load();
    if (tab === "skills")   Skills.load();
    if (tab === "tasks")    GorevTakip.load();
    if (tab === "calculations") Calculations.load();
    if (tab === "costanalysis") CostAnalysis.load();
    if (tab === "eplan")       Eplan.load();
    if (tab === "flow")        ProjectFlow.load();
    if (tab === "glossary")    Glossary.load();
    if (tab === "risks")       Risks.load();
    if (tab === "punchlist")   PunchList.load();
    if (tab === "iolist")      IOList.load();
    if (tab === "users")    Users.render();
  }

  function refreshStats() { Reports.renderStatBar(); }
  function refreshMapAndStats() {
    Reports.renderStatBar();
    if (currentTab === "map") MapView.render();
  }

  // Sidebar aç/kapat
  function _initSidebar() {
    const sidebar  = document.getElementById("sidebar");
    const overlay  = document.getElementById("sidebar-overlay");
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (!sidebar || !toggleBtn) return;

    let collapsed = false;
    const mq = window.matchMedia("(max-width: 768px)");

    function setCollapsed(val) {
      collapsed = val;
      sidebar.classList.toggle("collapsed", collapsed);
      overlay.classList.toggle("show", !collapsed && mq.matches);
    }

    toggleBtn.addEventListener("click", () => setCollapsed(!collapsed));
    overlay.addEventListener("click", () => setCollapsed(true));
    mq.addEventListener("change", () => { if (!mq.matches) overlay.classList.remove("show"); });

    if (mq.matches) setCollapsed(true);
  }

  // Admin grubunu göster/gizle
  function _applyAdminVisibility() {
    const grp = document.getElementById("sidebar-group-admin");
    if (grp) grp.style.display = Auth.isAdmin() ? "" : "none";
  }

  function bindEvents() {
    _initSidebar();
    document.getElementById("logout-btn").onclick = () => Auth.logout();

    document.querySelectorAll(".tab").forEach((t) => {
      t.onclick = () => switchTab(t.dataset.tab);
    });

    // Modal kapatma
    document.getElementById("modal-close").onclick = () => UI.closeModal();
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") UI.closeModal();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") UI.closeModal(); });

    // Proje filtreleri
    let searchTimer;
    document.getElementById("filter-search").addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => Projects.load({ resetPage: true }), 300);
    });
    document.getElementById("filter-province").onchange = () => Projects.load({ resetPage: true });
    document.getElementById("filter-status").onchange = () => Projects.load({ resetPage: true });
    document.getElementById("new-project-btn").onclick = () => Projects.openForm();
    document.getElementById("new-user-btn").onclick = () => Users.openForm();
    TechDocs.bindEvents();
    Specs.bindEvents();
    Skills.bindEvents();
    Notif.bindEvents();

    // Haritada il seçimi → Projeler sekmesine geç ve filtrele
    MapView.onSelect((province) => showProvinceProjects(province));

    // Oturum süresi dolduğunda
    window.addEventListener("auth:expired", () => {
      UI.toast("Oturum süresi doldu. Tekrar giriş yapın.", "error");
      Auth.showLogin();
    });
  }

  function sideCardsHtml(items, { showProvince = false } = {}) {
    return items.map((p) => `
      <div class="side-card" data-pid="${p.id}">
        <h5>${UI.esc(p.name)}</h5>
        ${showProvince ? `<div class="muted side-card-prov">${UI.esc(p.province)}</div>` : ""}
        <div class="card-meta">
          <span class="badge" style="background:${MapColors.status(p.status)}">${UI.esc(p.status_display)}</span>
          <span>%${p.progress}</span>
          ${p.is_delayed ? `<span class="delay-flag">⚠️</span>` : ""}
        </div>
      </div>`).join("");
  }

  function bindSideCards(box) {
    box.querySelectorAll("[data-pid]").forEach((el) =>
      el.addEventListener("click", () => Projects.openDetail(+el.dataset.pid)));
  }

  // Varsayılan görünüm: en son eklenen, henüz tamamlanmamış projeler
  async function showRecentProjects() {
    document.getElementById("side-province").textContent = "Son Tamamlanmamış Projeler";
    const box = document.getElementById("side-projects");
    box.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    try {
      const data = await API.get("/projects/");
      const items = (data.items || data)
        .filter((p) => p.status !== "tamamlandi" && p.progress < 100)
        .slice(0, 8);
      if (!items.length) {
        box.innerHTML = `<p class="muted">Devam eden proje bulunmuyor.</p>`;
        return;
      }
      box.innerHTML = sideCardsHtml(items, { showProvince: true });
      bindSideCards(box);
    } catch (err) {
      box.innerHTML = `<p class="muted">${UI.esc(err.message)}</p>`;
    }
  }

  async function showProvinceProjects(province) {
    document.getElementById("side-province").textContent = province;
    const box = document.getElementById("side-projects");
    box.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    const backBtn = `<button type="button" class="link-back" id="side-back">← Son projeler</button>`;
    try {
      const data = await API.get(`/projects/?province=${encodeURIComponent(province)}`);
      const items = data.items || data;
      if (!items.length) {
        box.innerHTML = `${backBtn}<p class="muted">Bu ilde proje yok.</p>
          ${Auth.isEditor() ? `<button class="btn btn-primary btn-sm" id="add-here">+ Bu İlde Proje Ekle</button>` : ""}`;
        const addBtn = document.getElementById("add-here");
        if (addBtn) addBtn.onclick = () => Projects.openForm({ province });
      } else {
        box.innerHTML = backBtn + sideCardsHtml(items);
        bindSideCards(box);
      }
      document.getElementById("side-back").onclick = () => showRecentProjects();
    } catch (err) {
      box.innerHTML = `<p class="muted">${UI.esc(err.message)}</p>`;
    }
  }

  async function start() {
    Projects.populateProvinceFilter();
    bindEvents();
    const ok = await Auth.init();
    if (ok) {
      _applyAdminVisibility();
      refreshStats();
      switchTab("map");
      showRecentProjects();
      Notif.yukle();
    }
  }

  return { start, switchTab, refreshStats, refreshMapAndStats, showRecentProjects };
})();

// ===================== BAŞLAT =====================
document.addEventListener("DOMContentLoaded", () => {
  Auth.bindLoginForm(() => {
    App.refreshStats();
    App.switchTab("map");
    App.showRecentProjects();
    Notif.yukle();
  });
  App.start();
});

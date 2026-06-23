// ===================== SKILL EKOSİSTEMİ =====================
const Skills = (() => {
  let selectedRolId = null;
  let currentItab = "tasks";
  let cachedRol = null;
  let cachedRefs = null;

  // --- Yükle ---
  async function load() {
    const bar = document.getElementById("skill-roles-bar");
    bar.innerHTML = `<p class="muted" style="padding:8px">Yükleniyor…</p>`;
    try {
      const eko = await API.get("/skills");
      renderRoles(eko.roller);
      if (selectedRolId) {
        await selectRole(selectedRolId);
      } else {
        document.getElementById("skill-empty").classList.remove("hidden");
        document.getElementById("skill-detail").classList.add("hidden");
      }
    } catch (err) {
      bar.innerHTML = `<p class="muted" style="padding:8px">${UI.esc(err.message)}</p>`;
    }
  }

  // --- Rol Kartları ---
  function renderRoles(roller) {
    const bar = document.getElementById("skill-roles-bar");
    bar.innerHTML = roller.map((r) => `
      <div class="skill-role-card ${r.rol_id === selectedRolId ? "active" : ""}"
           data-rol="${UI.esc(r.rol_id)}"
           style="border-top:3px solid ${UI.esc(r.renk_kodu)}">
        <div class="skill-role-icon">${UI.esc(r.ikon)}</div>
        <div class="skill-role-name">${UI.esc(r.rol_adi)}</div>
        <div class="muted skill-role-count">${r.gorev_sayisi} görev</div>
      </div>`).join("");

    bar.querySelectorAll("[data-rol]").forEach((el) =>
      el.addEventListener("click", () => selectRole(el.dataset.rol)));
  }

  // --- Rol Seç ---
  async function selectRole(rolId) {
    selectedRolId = rolId;

    // Aktif kart stilini güncelle
    document.querySelectorAll(".skill-role-card").forEach((el) =>
      el.classList.toggle("active", el.dataset.rol === rolId));

    document.getElementById("skill-empty").classList.add("hidden");
    const detail = document.getElementById("skill-detail");
    detail.classList.remove("hidden");
    detail.querySelector("#skill-detail-body").innerHTML =
      `<p class="muted" style="padding:20px">Yükleniyor…</p>`;

    try {
      const [rol, refs] = await Promise.all([
        API.get(`/skills/roles/${rolId}`),
        API.get(`/skills/roles/${rolId}/references`),
      ]);
      cachedRol = rol;
      cachedRefs = refs;
      renderDetailHeader(rol, refs);
      renderItab(currentItab);
    } catch (err) {
      detail.querySelector("#skill-detail-body").innerHTML =
        `<p class="muted" style="padding:20px">${UI.esc(err.message)}</p>`;
    }
  }

  // --- Detay Başlığı ---
  function renderDetailHeader(rol, refs) {
    document.getElementById("skill-role-title").innerHTML = `
      <span class="skill-detail-icon">${UI.esc(rol.ikon)}</span>
      <div>
        <div class="skill-detail-name">${UI.esc(rol.rol_adi)}</div>
        <div class="muted" style="font-size:12.5px">
          ${rol.gorev_sablonlari.length} görev şablonu · ${refs.length} referans doküman
        </div>
      </div>`;
  }

  // --- İç Sekme Geçişi ---
  function renderItab(tab) {
    currentItab = tab;
    document.querySelectorAll(".skill-itab").forEach((el) =>
      el.classList.toggle("active", el.dataset.itab === tab));
    if (tab === "tasks") renderTaskTemplates(cachedRol.gorev_sablonlari);
    if (tab === "refs")  renderRefs(cachedRefs);
  }

  // --- Görev Şablonları ---
  function renderTaskTemplates(tasks) {
    const box = document.getElementById("skill-detail-body");

    // Faza göre grupla (sıra koruyarak)
    const phaseOrder = [];
    const byPhase = {};
    tasks.forEach((t) => {
      if (!byPhase[t.faz]) { byPhase[t.faz] = []; phaseOrder.push(t.faz); }
      byPhase[t.faz].push(t);
    });

    if (!tasks.length) {
      box.innerHTML = `<p class="muted" style="padding:20px">Bu role ait görev şablonu yok.</p>`;
      return;
    }

    box.innerHTML = phaseOrder.map((faz) => {
      const list = byPhase[faz];
      return `
        <div class="skill-phase-group">
          <div class="skill-phase-header">
            <span class="skill-phase-badge">${UI.esc(faz)}</span>
            <span class="muted" style="font-size:12px">${list.length} görev</span>
          </div>
          <div class="skill-task-table">
            <div class="skill-task-head">
              <span>Görev No</span><span>Görev Adı</span><span>Süre</span><span>Teslim</span>
            </div>
            ${list.map((t) => `
              <div class="skill-task-row">
                <span class="skill-task-id">${UI.esc(t.gorev_id)}</span>
                <span class="skill-task-name">${UI.esc(t.gorev_adi)}</span>
                <span class="skill-task-dur">${t.min_gun}–${t.max_gun} gün</span>
                <span class="muted skill-task-del">${UI.esc(t.teslimati || "—")}</span>
              </div>`).join("")}
          </div>
        </div>`;
    }).join("");
  }

  // --- Referans Dokümanlar ---
  function renderRefs(refs) {
    const box = document.getElementById("skill-detail-body");
    if (!refs.length) {
      box.innerHTML = `<p class="muted" style="padding:20px">Bu role ait referans doküman yok.</p>`;
      return;
    }
    box.innerHTML = `<div class="skill-refs-grid">${
      refs.map((r) => `
        <div class="skill-ref-card" data-slug="${UI.esc(r.slug)}">
          <div class="skill-ref-title">${UI.esc(r.baslik)}</div>
          ${r.standart ? `<div class="skill-ref-std">${UI.esc(r.standart)}</div>` : ""}
          <div class="skill-ref-foot">
            ${r.revizyon ? `<span class="pill">Rev ${UI.esc(r.revizyon)}</span>` : ""}
            <span class="skill-ref-open">Aç →</span>
          </div>
        </div>`).join("")
    }</div>`;

    box.querySelectorAll("[data-slug]").forEach((el) =>
      el.addEventListener("click", () => openRefModal(el.dataset.slug)));
  }

  // --- Referans Modal ---
  async function openRefModal(slug) {
    UI.openModal(`<p class="muted">Yükleniyor…</p>`);
    try {
      const doc = await API.get(`/skills/references/${slug}`);
      const html = typeof marked !== "undefined"
        ? marked.parse(doc.icerik)
        : `<pre style="white-space:pre-wrap;font-size:13px">${UI.esc(doc.icerik)}</pre>`;

      document.getElementById("modal-body").innerHTML = `
        <div class="ref-modal-head">
          <h3>${UI.esc(doc.baslik)}</h3>
          ${doc.standart ? `<div class="muted">${UI.esc(doc.standart)}</div>` : ""}
          ${doc.revizyon ? `<span class="pill" style="margin-top:4px">Rev ${UI.esc(doc.revizyon)}</span>` : ""}
        </div>
        <div class="ref-md-body">${html}</div>`;

      // Modal'ı geniş yap
      document.querySelector(".modal").style.maxWidth = "860px";
    } catch (err) {
      document.getElementById("modal-body").innerHTML =
        `<p class="muted">${UI.esc(err.message)}</p>`;
    }
  }

  // --- Event Bağlama ---
  function bindEvents() {
    document.querySelectorAll(".skill-itab").forEach((btn) =>
      btn.addEventListener("click", () => {
        if (!cachedRol) return;
        renderItab(btn.dataset.itab);
      }));

    // Modal kapanınca genişliği sıfırla
    document.getElementById("modal-close").addEventListener("click", () => {
      const m = document.querySelector(".modal");
      if (m) m.style.maxWidth = "";
    });
  }

  return { load, bindEvents };
})();

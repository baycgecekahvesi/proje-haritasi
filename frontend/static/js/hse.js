// ===================== SGK & İSG =====================
const HSE = (() => {
  const ACC_SEV_COLOR = { NEAR_MISS: "#f39c12", MINOR: "#e67e22", MAJOR: "#e74c3c", FATAL: "#8e44ad" };
  const ACC_SEV_LABEL = { NEAR_MISS: "Ramak Kala", MINOR: "Hafif", MAJOR: "Ağır", FATAL: "Ölümlü" };
  const INSP_STATUS_COLOR = { open: "#f39c12", closed: "#27ae60", in_progress: "#4f6ef7" };
  const INSP_STATUS_LABEL = { open: "Açık", closed: "Kapalı", in_progress: "Devam Ediyor" };

  let activeTab = "workers";
  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("hse-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects/"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>SGK & İSG Yönetimi</h2>
        <select id="hse-project-sel" style="min-width:220px">
          <option value="">— Proje Seçin —</option>
          ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
        </select>
      </div>
      <div id="hse-summary" style="display:none;margin-bottom:16px"></div>
      <div class="tab-bar" style="margin-bottom:16px">
        <button class="rp-tab ${activeTab==="workers"?"active":""}" data-hsetab="workers">Çalışan Giriş</button>
        <button class="rp-tab ${activeTab==="accidents"?"active":""}" data-hsetab="accidents">İş Kazaları</button>
        <button class="rp-tab ${activeTab==="inspections"?"active":""}" data-hsetab="inspections">Denetimler</button>
      </div>
      <div id="hse-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("hse-project-sel").onchange = async (e) => {
      selectedProjectId = e.target.value || null;
      if (selectedProjectId) {
        await _loadSummary();
        _loadTab();
      } else {
        document.getElementById("hse-summary").style.display = "none";
        document.getElementById("hse-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
      }
    };
    body.querySelectorAll(".rp-tab").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.hsetab;
        body.querySelectorAll(".rp-tab").forEach(b => b.classList.toggle("active", b.dataset.hsetab === activeTab));
        if (selectedProjectId) _loadTab();
      };
    });
  }

  async function _loadSummary() {
    const summaryEl = document.getElementById("hse-summary");
    try {
      const s = await API.get(`/hse/summary/?project_id=${selectedProjectId}`);
      summaryEl.style.display = "";
      summaryEl.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div class="project-card" style="flex:1;min-width:140px;cursor:default;padding:12px">
            <div class="muted" style="font-size:12px">Toplam Çalışan Gün</div>
            <div style="font-size:24px;font-weight:700;margin-top:4px">${s.total_worker_days||0}</div>
          </div>
          <div class="project-card" style="flex:1;min-width:140px;cursor:default;padding:12px;border-color:${(s.accident_count||0)>0?"#e74c3c":"var(--border)"}">
            <div class="muted" style="font-size:12px">Kaza Sayısı</div>
            <div style="font-size:24px;font-weight:700;margin-top:4px;color:${(s.accident_count||0)>0?"#e74c3c":"inherit"}">${s.accident_count||0}</div>
          </div>
          <div class="project-card" style="flex:1;min-width:140px;cursor:default;padding:12px;border-color:${(s.open_inspection_count||0)>0?"#f39c12":"var(--border)"}">
            <div class="muted" style="font-size:12px">Açık Denetim</div>
            <div style="font-size:24px;font-weight:700;margin-top:4px;color:${(s.open_inspection_count||0)>0?"#f39c12":"inherit"}">${s.open_inspection_count||0}</div>
          </div>
        </div>
      `;
    } catch { summaryEl.style.display = "none"; }
  }

  function _loadTab() {
    if (activeTab === "workers")     _renderWorkers();
    if (activeTab === "accidents")   _renderAccidents();
    if (activeTab === "inspections") _renderInspections();
  }

  // ── Çalışan Giriş ─────────────────────────────────────────
  async function _renderWorkers() {
    const content = document.getElementById("hse-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let entries = [];
    try { entries = await API.get(`/hse/worker-entries/?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Çalışan Giriş Kayıtları</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-worker-btn">+ Giriş Ekle</button>` : ""}
      </div>
      ${!entries.length ? `<p class="muted">Kayıt yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Tarih</th><th>Çalışan Sayısı</th><th>Taşeron</th><th>Ekleyen</th></tr></thead>
        <tbody>${entries.map(e => `
          <tr>
            <td>${UI.fmtDate(e.date)}</td>
            <td style="font-weight:600">${e.worker_count}</td>
            <td class="muted">${UI.esc(e.subcontractor||"—")}</td>
            <td class="muted" style="font-size:12px">${UI.esc(e.created_by||"—")}</td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-worker-btn");
      if (btn) btn.onclick = () => _openWorkerForm();
    }
  }

  async function _openWorkerForm() {
    UI.openModal(`
      <h3>Çalışan Giriş Kaydı</h3>
      <form id="worker-form">
        <div class="form-grid">
          <div class="form-row"><label>Tarih</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="form-row"><label>Çalışan Sayısı</label><input type="number" name="worker_count" value="1" min="0" required /></div>
        </div>
        <div class="form-row"><label>Taşeron</label><input name="subcontractor" /></div>
        <div class="form-error" id="worker-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="worker-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("worker-cancel").onclick = () => UI.closeModal();
    document.getElementById("worker-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/hse/worker-entries/", {
          project_id: +selectedProjectId,
          date: fd.get("date"),
          worker_count: parseInt(fd.get("worker_count"), 10),
          subcontractor: fd.get("subcontractor") || "",
        });
        UI.toast("Giriş kaydedildi", "success");
        UI.closeModal();
        _renderWorkers();
        _loadSummary();
      } catch (err) { document.getElementById("worker-err").textContent = err.message; }
    };
  }

  // ── İş Kazaları ───────────────────────────────────────────
  async function _renderAccidents() {
    const content = document.getElementById("hse-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let accidents = [];
    try { accidents = await API.get(`/hse/accidents/?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>İş Kazası Kayıtları</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-acc-btn">+ Kaza Kaydet</button>` : ""}
      </div>
      ${!accidents.length ? `<p class="muted">Kaza kaydı yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Tarih</th><th>Önem</th><th>Yaralı Sayısı</th><th>SGK Bildirimi</th><th>Açıklama</th></tr></thead>
        <tbody>${accidents.map(a => `
          <tr>
            <td>${UI.fmtDate(a.date)}</td>
            <td><span class="badge" style="background:${ACC_SEV_COLOR[a.severity]||'#95a5a6'}">${ACC_SEV_LABEL[a.severity]||a.severity}</span></td>
            <td>${a.injured_count||0}</td>
            <td>
              <span class="pill" style="background:${a.sgk_notified?"#27ae6022":"#e74c3c22"};color:${a.sgk_notified?"#27ae60":"#e74c3c"}">
                ${a.sgk_notified?"Bildirildi":"Bildirilmedi"}
              </span>
            </td>
            <td class="muted" style="font-size:12px;max-width:200px">${UI.esc(a.description||"—")}</td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-acc-btn");
      if (btn) btn.onclick = () => _openAccidentForm();
    }
  }

  async function _openAccidentForm() {
    UI.openModal(`
      <h3>Yeni Kaza Kaydı</h3>
      <form id="acc-form">
        <div class="form-grid">
          <div class="form-row"><label>Tarih</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="form-row"><label>Önem</label>
            <select name="severity">
              <option value="NEAR_MISS">Ramak Kala</option>
              <option value="MINOR">Hafif</option>
              <option value="MAJOR">Ağır</option>
              <option value="FATAL">Ölümlü</option>
            </select>
          </div>
          <div class="form-row"><label>Yaralı Sayısı</label><input type="number" name="injured_count" value="0" min="0" /></div>
          <div class="form-row"><label>SGK Bildirimi</label>
            <select name="sgk_notified">
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </div>
        <div class="form-row"><label>Açıklama</label><textarea name="description"></textarea></div>
        <div class="form-error" id="acc-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="acc-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("acc-cancel").onclick = () => UI.closeModal();
    document.getElementById("acc-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/hse/accidents/", {
          project_id: +selectedProjectId,
          date: fd.get("date"),
          severity: fd.get("severity"),
          injured_count: parseInt(fd.get("injured_count") || "0", 10),
          sgk_notified: fd.get("sgk_notified") === "true",
          description: fd.get("description") || "",
        });
        UI.toast("Kaza kaydedildi", "success");
        UI.closeModal();
        _renderAccidents();
        _loadSummary();
      } catch (err) { document.getElementById("acc-err").textContent = err.message; }
    };
  }

  // ── İSG Denetimleri ───────────────────────────────────────
  async function _renderInspections() {
    const content = document.getElementById("hse-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let inspections = [];
    try { inspections = await API.get(`/hse/inspections/?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>İSG Denetimleri</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-insp-btn">+ Denetim Ekle</button>` : ""}
      </div>
      ${!inspections.length ? `<p class="muted">Denetim kaydı yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Tarih</th><th>Denetçi</th><th>Bulgular</th><th>Sonraki Denetim</th><th>Durum</th></tr></thead>
        <tbody>${inspections.map(ins => `
          <tr>
            <td>${UI.fmtDate(ins.date)}</td>
            <td>${UI.esc(ins.inspector||"—")}</td>
            <td class="muted" style="font-size:12px;max-width:180px">${UI.esc(ins.findings||"—")}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(ins.next_inspection)||"—"}</td>
            <td><span class="pill" style="background:${INSP_STATUS_COLOR[ins.status]||'#95a5a6'}22;color:${INSP_STATUS_COLOR[ins.status]||'#95a5a6'}">${INSP_STATUS_LABEL[ins.status]||ins.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-insp-btn");
      if (btn) btn.onclick = () => _openInspectionForm();
    }
  }

  async function _openInspectionForm() {
    UI.openModal(`
      <h3>Yeni Denetim</h3>
      <form id="insp-form">
        <div class="form-grid">
          <div class="form-row"><label>Tarih</label><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="form-row"><label>Denetçi</label><input name="inspector" /></div>
        </div>
        <div class="form-row"><label>Bulgular</label><textarea name="findings"></textarea></div>
        <div class="form-row"><label>Sonraki Denetim Tarihi</label><input type="date" name="next_inspection" /></div>
        <div class="form-error" id="insp-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="insp-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("insp-cancel").onclick = () => UI.closeModal();
    document.getElementById("insp-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/hse/inspections/", {
          project_id: +selectedProjectId,
          date: fd.get("date"),
          inspector: fd.get("inspector") || "",
          findings: fd.get("findings") || "",
          next_inspection: fd.get("next_inspection") || null,
        });
        UI.toast("Denetim kaydedildi", "success");
        UI.closeModal();
        _renderInspections();
        _loadSummary();
      } catch (err) { document.getElementById("insp-err").textContent = err.message; }
    };
  }

  return { load };
})();

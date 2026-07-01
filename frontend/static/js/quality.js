// ===================== KALİTE & ITP =====================
const Quality = (() => {
  const HP_COLOR = { H: "#e74c3c", W: "#f39c12", R: "#4f6ef7" };
  const HP_LABEL = { H: "Hold", W: "Witness", R: "Review" };
  const PLAN_STATUS_COLOR = { active: "#27ae60", completed: "#4f6ef7", cancelled: "#95a5a6" };
  const PLAN_STATUS_LABEL = { active: "Aktif", completed: "Tamamlandı", cancelled: "İptal" };
  const NCR_SEV_COLOR = { MINOR: "#f39c12", MAJOR: "#e74c3c", CRITICAL: "#8e44ad" };
  const NCR_STATUS_COLOR = { open: "#e74c3c", closed: "#27ae60", in_progress: "#f39c12" };
  const NCR_STATUS_LABEL = { open: "Açık", closed: "Kapalı", in_progress: "Devam Ediyor" };

  let activeTab = "itp";
  let selectedProjectId = null;
  let selectedPlanId = null;

  async function load() {
    const body = document.getElementById("quality-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects/"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Kalite & ITP</h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select id="quality-project-sel" style="min-width:220px">
            <option value="">— Proje Seçin —</option>
            ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="tab-bar" style="margin-bottom:16px">
        <button class="rp-tab ${activeTab==="itp"?"active":""}" data-qtab="itp">ITP Planları</button>
        <button class="rp-tab ${activeTab==="ncr"?"active":""}" data-qtab="ncr">NCR Listesi</button>
      </div>
      <div id="quality-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("quality-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      selectedPlanId = null;
      _loadTab();
    };
    body.querySelectorAll(".rp-tab").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.qtab;
        body.querySelectorAll(".rp-tab").forEach(b => b.classList.toggle("active", b.dataset.qtab === activeTab));
        _loadTab();
      };
    });
  }

  function _loadTab() {
    if (!selectedProjectId) return;
    if (activeTab === "itp") _renderITP();
    if (activeTab === "ncr") _renderNCR();
  }

  // ── ITP Planları ─────────────────────────────────────────
  async function _renderITP() {
    const content = document.getElementById("quality-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let plans = [];
    try { plans = await API.get(`/quality/plans/?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Muayene & Test Planları</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-plan-btn">+ Yeni Plan</button>` : ""}
      </div>
      ${!plans.length ? `<p class="muted">ITP planı yok.</p>` : `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${plans.map(pl => `
          <div class="row-item" style="cursor:pointer" data-plan-id="${pl.id}">
            <div>
              <strong>${UI.esc(pl.title)}</strong>
              <span class="pill" style="background:${PLAN_STATUS_COLOR[pl.status]||'#95a5a6'}22;color:${PLAN_STATUS_COLOR[pl.status]||'#95a5a6'}">${PLAN_STATUS_LABEL[pl.status]||pl.status}</span>
              ${pl.responsible ? `<span class="muted" style="font-size:12px">Sorumlu: ${UI.esc(pl.responsible)}</span>` : ""}
            </div>
            <button class="btn btn-sm" data-open-plan="${pl.id}">Kalemleri Gör</button>
          </div>`).join("")}
      </div>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-plan-btn");
      if (btn) btn.onclick = () => _openPlanForm();
    }
    content.querySelectorAll("[data-open-plan]").forEach(el => {
      el.onclick = () => _renderPlanItems(+el.dataset.openPlan, el.closest("[data-plan-id]").querySelector("strong").textContent);
    });
  }

  async function _renderPlanItems(planId, planTitle) {
    const content = document.getElementById("quality-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let items = [];
    try { items = await API.get(`/quality/plans/${planId}/items/`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div style="margin-bottom:12px">
        <button class="btn btn-ghost btn-sm" id="back-to-plans">← Planlara Dön</button>
        <strong style="margin-left:8px">${UI.esc(planTitle)}</strong>
      </div>
      <div class="section-header" style="margin-bottom:12px">
        <h3>Plan Kalemleri</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-item-btn">+ Kalem Ekle</button>` : ""}
      </div>
      ${!items.length ? `<p class="muted">Kalem yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Aktivite</th><th>Hold Noktası</th><th>Sorumlu</th><th>Durum</th>${editor?"<th>İşlem</th>":""}</tr></thead>
        <tbody>${items.map(it => `
          <tr>
            <td>${UI.esc(it.activity)}</td>
            <td><span class="badge" style="background:${HP_COLOR[it.hold_point_type]||'#95a5a6'}">${HP_LABEL[it.hold_point_type]||it.hold_point_type}</span></td>
            <td class="muted">${UI.esc(it.responsible)||"—"}</td>
            <td><span class="pill" style="background:${it.is_completed?"#27ae6022":"#f39c1222"};color:${it.is_completed?"#27ae60":"#f39c12"}">${it.is_completed?"Tamamlandı":"Bekliyor"}</span></td>
            ${editor ? `<td>
              ${!it.is_completed ? `<button class="btn btn-sm btn-primary" data-complete-item="${it.id}" data-plan="${planId}">Tamamla</button>` : ""}
            </td>` : ""}
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    document.getElementById("back-to-plans").onclick = () => _renderITP();
    if (editor) {
      const btn = document.getElementById("new-item-btn");
      if (btn) btn.onclick = () => _openItemForm(planId, planTitle);
      content.querySelectorAll("[data-complete-item]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.patch(`/quality/plans/${el.dataset.plan}/items/${el.dataset.completeItem}/`, { is_completed: true });
            UI.toast("Kalem tamamlandı", "success");
            _renderPlanItems(planId, planTitle);
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
  }

  async function _openPlanForm() {
    UI.openModal(`
      <h3>Yeni ITP Planı</h3>
      <form id="plan-form">
        <div class="form-row"><label>Başlık</label><input name="title" required /></div>
        <div class="form-row"><label>Sorumlu</label><input name="responsible" /></div>
        <div class="form-row"><label>Durum</label>
          <select name="status">
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
        <div class="form-error" id="plan-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="plan-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("plan-cancel").onclick = () => UI.closeModal();
    document.getElementById("plan-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/quality/plans/", {
          project_id: +selectedProjectId,
          title: fd.get("title"),
          responsible: fd.get("responsible") || "",
          status: fd.get("status"),
        });
        UI.toast("Plan oluşturuldu", "success");
        UI.closeModal();
        _renderITP();
      } catch (err) { document.getElementById("plan-err").textContent = err.message; }
    };
  }

  async function _openItemForm(planId, planTitle) {
    UI.openModal(`
      <h3>${UI.esc(planTitle)} — Yeni Kalem</h3>
      <form id="item-form">
        <div class="form-row"><label>Aktivite</label><input name="activity" required /></div>
        <div class="form-row"><label>Hold Noktası</label>
          <select name="hold_point_type">
            <option value="H">H — Hold (Bekle)</option>
            <option value="W">W — Witness (Tanık)</option>
            <option value="R">R — Review (İncele)</option>
          </select>
        </div>
        <div class="form-row"><label>Sorumlu</label><input name="responsible" /></div>
        <div class="form-error" id="item-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="item-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Ekle</button>
        </div>
      </form>
    `);
    document.getElementById("item-cancel").onclick = () => UI.closeModal();
    document.getElementById("item-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/quality/plans/${planId}/items/`, {
          activity: fd.get("activity"),
          hold_point_type: fd.get("hold_point_type"),
          responsible: fd.get("responsible") || "",
        });
        UI.toast("Kalem eklendi", "success");
        UI.closeModal();
        _renderPlanItems(planId, planTitle);
      } catch (err) { document.getElementById("item-err").textContent = err.message; }
    };
  }

  // ── NCR Listesi ───────────────────────────────────────────
  async function _renderNCR() {
    const content = document.getElementById("quality-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let ncrs = [];
    try { ncrs = await API.get(`/quality/${selectedProjectId}/ncrs/`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Uygunsuzluk Raporları (NCR)</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-ncr-btn">+ Yeni NCR</button>` : ""}
      </div>
      ${!ncrs.length ? `<p class="muted">NCR kaydı yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>NCR No</th><th>Başlık</th><th>Önem</th><th>Durum</th><th>Tarih</th></tr></thead>
        <tbody>${ncrs.map(n => `
          <tr>
            <td style="font-family:monospace">${UI.esc(n.ncr_number||"—")}</td>
            <td>${UI.esc(n.title)}</td>
            <td><span class="badge" style="background:${NCR_SEV_COLOR[n.severity]||'#95a5a6'}">${UI.esc(n.severity)}</span></td>
            <td><span class="pill" style="background:${NCR_STATUS_COLOR[n.status]||'#95a5a6'}22;color:${NCR_STATUS_COLOR[n.status]||'#95a5a6'}">${NCR_STATUS_LABEL[n.status]||n.status}</span></td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(n.created_at)}</td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-ncr-btn");
      if (btn) btn.onclick = () => _openNCRForm();
    }
  }

  async function _openNCRForm() {
    UI.openModal(`
      <h3>Yeni NCR</h3>
      <form id="ncr-form">
        <div class="form-row"><label>Başlık</label><input name="title" required /></div>
        <div class="form-row"><label>Açıklama</label><textarea name="description"></textarea></div>
        <div class="form-row"><label>Önem</label>
          <select name="severity">
            <option value="MINOR">MINOR</option>
            <option value="MAJOR">MAJOR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <div class="form-error" id="ncr-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ncr-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("ncr-cancel").onclick = () => UI.closeModal();
    document.getElementById("ncr-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/quality/${selectedProjectId}/ncrs/`, {
          title: fd.get("title"),
          description: fd.get("description") || "",
          severity: fd.get("severity"),
        });
        UI.toast("NCR oluşturuldu", "success");
        UI.closeModal();
        _renderNCR();
      } catch (err) { document.getElementById("ncr-err").textContent = err.message; }
    };
  }

  return { load };
})();

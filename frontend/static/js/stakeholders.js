// ===================== PAYDAŞ YÖNETİMİ =====================
const Stakeholders = (() => {
  const IMPACT_COLOR = { LOW: "#27ae60", MEDIUM: "#f39c12", HIGH: "#e74c3c" };
  const IMPACT_LABEL = { LOW: "Düşük", MEDIUM: "Orta", HIGH: "Yüksek" };
  const FREQ_LABEL = {
    daily: "Günlük", weekly: "Haftalık", monthly: "Aylık",
    quarterly: "3 Aylık", as_needed: "İhtiyaç Halinde"
  };

  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("stakeholders-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects/"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Paydaş Yönetimi</h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select id="sh-project-sel" style="min-width:220px">
            <option value="">— Proje Seçin —</option>
            ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
          </select>
          ${Auth.isEditor() ? `<button class="btn btn-primary btn-sm" id="new-sh-btn" style="display:none">+ Paydaş Ekle</button>` : ""}
        </div>
      </div>
      <div id="sh-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("sh-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      const newBtn = document.getElementById("new-sh-btn");
      if (newBtn) newBtn.style.display = selectedProjectId ? "" : "none";
      if (selectedProjectId) _renderList();
      else document.getElementById("sh-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
    };
    const newBtn = document.getElementById("new-sh-btn");
    if (newBtn) newBtn.onclick = () => _openForm();
  }

  async function _renderList() {
    const content = document.getElementById("sh-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let stakeholders = [];
    try { stakeholders = await API.get(`/stakeholders/?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    const admin = Auth.isAdmin();
    content.innerHTML = `
      ${!stakeholders.length ? `<p class="muted">Paydaş kaydı yok.</p>` : `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${stakeholders.map(sh => `
          <div class="project-card" style="cursor:default;position:relative">
            <div class="card-meta">
              <span class="badge" style="background:${IMPACT_COLOR[sh.impact]||'#95a5a6'}">${IMPACT_LABEL[sh.impact]||sh.impact}</span>
              ${sh.interest ? `<span class="pill" style="font-size:11px">İlgi: ${UI.esc(sh.interest)}</span>` : ""}
            </div>
            <h4 style="margin:6px 0 2px">${UI.esc(sh.name)}</h4>
            ${sh.organization ? `<div class="muted" style="font-size:12px">🏢 ${UI.esc(sh.organization)}</div>` : ""}
            ${sh.role ? `<div class="muted" style="font-size:12px">👤 ${UI.esc(sh.role)}</div>` : ""}
            ${sh.contact_frequency ? `<div class="muted" style="font-size:12px;margin-top:4px">📅 ${FREQ_LABEL[sh.contact_frequency]||sh.contact_frequency} iletişim</div>` : ""}
            ${editor || admin ? `
            <div class="modal-actions" style="margin-top:8px;justify-content:flex-start">
              ${editor ? `<button class="btn btn-sm btn-ghost" data-edit-sh="${sh.id}">Düzenle</button>` : ""}
              ${admin ? `<button class="btn btn-sm btn-danger" data-del-sh="${sh.id}">Sil</button>` : ""}
            </div>` : ""}
          </div>`).join("")}
      </div>`}
    `;
    if (editor) {
      content.querySelectorAll("[data-edit-sh]").forEach(el => {
        const sh = stakeholders.find(s => s.id === +el.dataset.editSh);
        if (sh) el.onclick = () => _openForm(sh);
      });
    }
    if (admin) {
      content.querySelectorAll("[data-del-sh]").forEach(el => {
        el.onclick = async () => {
          if (!confirm("Paydaş silinsin mi?")) return;
          try {
            await API.del(`/stakeholders/${el.dataset.delSh}/`);
            UI.toast("Paydaş silindi", "success");
            _renderList();
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
  }

  async function _openForm(sh = null) {
    const isEdit = !!sh;
    const v = (k, d = "") => sh && sh[k] != null ? sh[k] : d;
    UI.openModal(`
      <h3>${isEdit ? "Paydaş Düzenle" : "Yeni Paydaş"}</h3>
      <form id="sh-form">
        <div class="form-row"><label>Ad Soyad</label><input name="name" required value="${UI.esc(v("name"))}" /></div>
        <div class="form-grid">
          <div class="form-row"><label>Organizasyon</label><input name="organization" value="${UI.esc(v("organization"))}" /></div>
          <div class="form-row"><label>Rol / Unvan</label><input name="role" value="${UI.esc(v("role"))}" /></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Etki Seviyesi</label>
            <select name="impact">
              <option value="LOW" ${v("impact")==="LOW"?"selected":""}>Düşük</option>
              <option value="MEDIUM" ${v("impact")==="MEDIUM"?"selected":""}>Orta</option>
              <option value="HIGH" ${v("impact")==="HIGH"?"selected":""}>Yüksek</option>
            </select>
          </div>
          <div class="form-row"><label>İlgi Alanı</label><input name="interest" value="${UI.esc(v("interest"))}" /></div>
        </div>
        <div class="form-row"><label>İletişim Sıklığı</label>
          <select name="contact_frequency">
            <option value="as_needed" ${v("contact_frequency")==="as_needed"?"selected":""}>İhtiyaç Halinde</option>
            <option value="daily" ${v("contact_frequency")==="daily"?"selected":""}>Günlük</option>
            <option value="weekly" ${v("contact_frequency")==="weekly"?"selected":""}>Haftalık</option>
            <option value="monthly" ${v("contact_frequency")==="monthly"?"selected":""}>Aylık</option>
            <option value="quarterly" ${v("contact_frequency")==="quarterly"?"selected":""}>3 Aylık</option>
          </select>
        </div>
        <div class="form-row"><label>İletişim Bilgileri</label><input name="contact_info" placeholder="e-posta, telefon…" value="${UI.esc(v("contact_info"))}" /></div>
        <div class="form-error" id="sh-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="sh-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Ekle"}</button>
        </div>
      </form>
    `);
    document.getElementById("sh-cancel").onclick = () => UI.closeModal();
    document.getElementById("sh-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = {
        project_id: +selectedProjectId,
        name: fd.get("name"),
        organization: fd.get("organization") || "",
        role: fd.get("role") || "",
        impact: fd.get("impact"),
        interest: fd.get("interest") || "",
        contact_frequency: fd.get("contact_frequency"),
        contact_info: fd.get("contact_info") || "",
      };
      try {
        if (isEdit) await API.patch(`/stakeholders/${sh.id}/`, payload);
        else await API.post("/stakeholders/", payload);
        UI.toast(isEdit ? "Paydaş güncellendi" : "Paydaş eklendi", "success");
        UI.closeModal();
        _renderList();
      } catch (err) { document.getElementById("sh-err").textContent = err.message; }
    };
  }

  return { load };
})();

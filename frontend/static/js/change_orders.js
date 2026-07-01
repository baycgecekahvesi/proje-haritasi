// ===================== DEĞİŞİKLİK EMİRLERİ =====================
const ChangeOrders = (() => {
  const STATUS_COLOR = { DRAFT: "#95a5a6", SUBMITTED: "#4f6ef7", APPROVED: "#27ae60", REJECTED: "#e74c3c" };
  const STATUS_LABEL = { DRAFT: "Taslak", SUBMITTED: "Gönderildi", APPROVED: "Onaylandı", REJECTED: "Reddedildi" };

  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("change-orders-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Değişiklik Emirleri</h2>
        <select id="co-project-sel" style="min-width:220px">
          <option value="">— Proje Seçin —</option>
          ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
        </select>
      </div>
      <div id="co-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("co-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      if (selectedProjectId) _renderList();
      else document.getElementById("co-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
    };
  }

  async function _renderList() {
    const content = document.getElementById("co-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let orders = [];
    try { orders = await API.get(`/change-orders?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    const admin = Auth.isAdmin();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Değişiklik Emirleri</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-co-btn">+ Yeni CO</button>` : ""}
      </div>
      ${!orders.length ? `<p class="muted">Değişiklik emri yok.</p>` : `
      <table class="data-table">
        <thead>
          <tr>
            <th>CO No</th><th>Başlık</th><th>Sebep</th>
            <th>Maliyet Etkisi</th><th>Zaman Etkisi</th><th>Durum</th>
            ${admin ? "<th>İşlem</th>" : ""}
          </tr>
        </thead>
        <tbody>${orders.map(o => `
          <tr>
            <td style="font-family:monospace">${UI.esc(o.co_number||"—")}</td>
            <td>${UI.esc(o.title)}</td>
            <td class="muted" style="font-size:12px;max-width:160px">${UI.esc(o.reason||"—")}</td>
            <td style="color:${o.cost_impact>=0?"#27ae60":"#e74c3c"};font-weight:600">
              ${o.cost_impact>=0?"+":""}${UI.fmtMoney(o.cost_impact)} ₺
            </td>
            <td class="muted">${o.time_impact_days!=null?o.time_impact_days+" gün":"—"}</td>
            <td>
              <span class="badge" style="background:${STATUS_COLOR[o.status]||'#95a5a6'}">
                ${STATUS_LABEL[o.status]||o.status}
              </span>
            </td>
            ${admin ? `<td style="display:flex;gap:4px;flex-wrap:wrap">
              ${o.status==="SUBMITTED" ? `
                <button class="btn btn-sm btn-primary" data-approve-co="${o.id}">Onayla</button>
                <button class="btn btn-sm btn-danger" data-reject-co="${o.id}">Reddet</button>
              ` : ""}
            </td>` : ""}
          </tr>`).join("")}
        </tbody>
      </table>`}
      ${editor ? `
      <div style="margin-top:16px">
        <h4 style="margin-bottom:8px">Taslak CO Gönder</h4>
        ${orders.filter(o=>o.status==="DRAFT").length ? `
        <div style="display:flex;flex-direction:column;gap:6px">
          ${orders.filter(o=>o.status==="DRAFT").map(o=>`
            <div class="row-item">
              <span>${UI.esc(o.co_number||o.title)}</span>
              <button class="btn btn-sm" data-submit-co="${o.id}">Gönder</button>
            </div>`).join("")}
        </div>` : `<p class="muted">Gönderilecek taslak yok.</p>`}
      </div>` : ""}
    `;

    if (editor) {
      const btn = document.getElementById("new-co-btn");
      if (btn) btn.onclick = () => _openForm();
      content.querySelectorAll("[data-submit-co]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.post(`/change-orders/${el.dataset.submitCo}/submit`, {});
            UI.toast("CO gönderildi", "success");
            _renderList();
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
    if (admin) {
      content.querySelectorAll("[data-approve-co]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.post(`/change-orders/${el.dataset.approveCo}/approve`, {});
            UI.toast("CO onaylandı", "success");
            _renderList();
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
      content.querySelectorAll("[data-reject-co]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.post(`/change-orders/${el.dataset.rejectCo}/reject`, {});
            UI.toast("CO reddedildi", "success");
            _renderList();
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
  }

  async function _openForm() {
    UI.openModal(`
      <h3>Yeni Değişiklik Emri</h3>
      <form id="co-form">
        <div class="form-row"><label>Başlık</label><input name="title" required /></div>
        <div class="form-row"><label>Sebep</label><textarea name="reason"></textarea></div>
        <div class="form-grid">
          <div class="form-row"><label>Maliyet Etkisi (₺)</label><input type="number" step="0.01" name="cost_impact" value="0" /></div>
          <div class="form-row"><label>Zaman Etkisi (gün)</label><input type="number" name="time_impact_days" value="0" /></div>
        </div>
        <div class="form-error" id="co-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="co-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("co-cancel").onclick = () => UI.closeModal();
    document.getElementById("co-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/change-orders", {
          project_id: +selectedProjectId,
          title: fd.get("title"),
          reason: fd.get("reason") || "",
          cost_impact: parseFloat(fd.get("cost_impact") || "0"),
          time_impact_days: parseInt(fd.get("time_impact_days") || "0", 10),
        });
        UI.toast("Değişiklik emri oluşturuldu", "success");
        UI.closeModal();
        _renderList();
      } catch (err) { document.getElementById("co-err").textContent = err.message; }
    };
  }

  return { load };
})();

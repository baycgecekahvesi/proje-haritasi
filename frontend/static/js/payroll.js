// ===================== HAKEDİŞ & PUANTAJ =====================
const Payroll = (() => {
  const STATUS_COLOR = { draft:"#95a5a6", submitted:"#f39c12", approved:"#27ae60", rejected:"#e74c3c" };
  const STATUS_LABEL = { draft:"Taslak", submitted:"Gönderildi", approved:"Onaylandı", rejected:"Reddedildi" };

  let activeTab = "timesheets";

  async function load() {
    const panel = document.getElementById("panel-payroll");
    if (!panel) return;
    panel.innerHTML = `
      <div class="rp-layout">
        <div class="rp-tabs">
          <button class="rp-tab ${activeTab==="timesheets"?"active":""}" data-py="timesheets">Puantajlar</button>
          <button class="rp-tab ${activeTab==="payments"?"active":""}"   data-py="payments">Hakedişler</button>
        </div>
        <div id="py-body" class="rp-body"></div>
      </div>
    `;
    panel.querySelectorAll(".rp-tab").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.py;
        panel.querySelectorAll(".rp-tab").forEach(b => b.classList.toggle("active", b.dataset.py === activeTab));
        _loadTab();
      };
    });
    _loadTab();
  }

  function _loadTab() {
    if (activeTab === "timesheets") _renderTimesheets();
    if (activeTab === "payments")   _renderPayments();
  }

  // ── Puantajlar ────────────────────────────────────────────
  async function _renderTimesheets() {
    const body = document.getElementById("py-body");
    body.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let data;
    try { data = await API.get("/payroll/timesheets"); } catch(e) { body.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return; }
    const items = data.items || data;
    const editor = Auth.isEditor();
    const admin  = Auth.isAdmin();
    body.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Puantaj Listesi</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-ts-btn">+ Yeni Puantaj</button>` : ""}
      </div>
      ${!items.length ? `<p class="muted">Kayıt yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Tarih</th><th>Proje</th><th>Kişi</th><th>Saat</th><th>Açıklama</th><th>Durum</th>${admin?"<th>İşlem</th>":""}</tr></thead>
        <tbody>${items.map(t => `
          <tr>
            <td>${UI.fmtDate(t.work_date)}</td>
            <td>${UI.esc(t.project_name)}</td>
            <td>${UI.esc(t.user_username)}</td>
            <td>${t.hours_worked}</td>
            <td class="muted" style="font-size:12px">${UI.esc(t.work_description)||"—"}</td>
            <td><span class="badge" style="background:${STATUS_COLOR[t.status]||'#95a5a6'}">${STATUS_LABEL[t.status]||t.status}</span></td>
            ${admin ? `<td>
              ${t.status !== "approved" ? `<button class="btn btn-sm btn-primary" data-approve-ts="${t.id}">Onayla</button>` : ""}
              <button class="btn btn-sm btn-danger" data-del-ts="${t.id}">x</button>
            </td>` : ""}
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-ts-btn");
      if (btn) btn.onclick = () => _openTimesheetForm();
    }
    if (admin) {
      body.querySelectorAll("[data-approve-ts]").forEach(el => el.onclick = async () => {
        await API.post(`/payroll/timesheets/${el.dataset.approveTs}/approve`, {});
        UI.toast("Puantaj onaylandı", "success");
        _renderTimesheets();
      });
      body.querySelectorAll("[data-del-ts]").forEach(el => el.onclick = async () => {
        if (!confirm("Silinsin mi?")) return;
        await API.del(`/payroll/timesheets/${el.dataset.delTs}`);
        UI.toast("Silindi", "success");
        _renderTimesheets();
      });
    }
  }

  async function _openTimesheetForm() {
    let projects = [];
    try { const d = await API.get("/projects/?page=1"); projects = d.items || d; } catch {}
    UI.openModal(`
      <h3>Yeni Puantaj</h3>
      <form id="ts-form">
        <div class="form-grid">
          <div class="form-row"><label>Proje</label>
            <select name="project_id" required>
              <option value="">— Seçin —</option>
              ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
            </select>
          </div>
          <div class="form-row"><label>Tarih</label><input type="date" name="work_date" required /></div>
          <div class="form-row"><label>Saat</label><input type="number" step="0.5" name="hours_worked" value="8" min="0.5" max="24" /></div>
        </div>
        <div class="form-row"><label>Açıklama</label><textarea name="work_description"></textarea></div>
        <div class="form-error" id="ts-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ts-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("ts-cancel").onclick = () => UI.closeModal();
    document.getElementById("ts-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/payroll/timesheets", {
          project_id:       +fd.get("project_id"),
          work_date:        fd.get("work_date"),
          hours_worked:     parseFloat(fd.get("hours_worked")),
          work_description: fd.get("work_description") || "",
        });
        UI.toast("Puantaj kaydedildi", "success");
        UI.closeModal();
        _renderTimesheets();
      } catch(err) { document.getElementById("ts-err").textContent = err.message; }
    };
  }

  // ── Hakedişler ────────────────────────────────────────────
  async function _renderPayments() {
    const body = document.getElementById("py-body");
    body.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let data;
    try { data = await API.get("/payroll/payments"); } catch(e) { body.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return; }
    const items = data.items || data;
    const editor = Auth.isEditor();
    const admin  = Auth.isAdmin();
    body.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Hakediş Listesi</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-pay-btn">+ Yeni Hakediş</button>` : ""}
      </div>
      ${!items.length ? `<p class="muted">Kayıt yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Proje</th><th>Dönem</th><th>Planlanan</th><th>Gerçekleşen</th><th>Onaylanan</th><th>Durum</th>${admin?"<th>İşlem</th>":""}</tr></thead>
        <tbody>${items.map(p => `
          <tr>
            <td>${UI.esc(p.project_name)}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(p.period_start)} — ${UI.fmtDate(p.period_end)}</td>
            <td>${UI.fmtMoney(p.planned_amount)} ₺</td>
            <td>${UI.fmtMoney(p.actual_amount)} ₺</td>
            <td>${UI.fmtMoney(p.approved_amount)} ₺</td>
            <td><span class="badge" style="background:${STATUS_COLOR[p.status]||'#95a5a6'}">${STATUS_LABEL[p.status]||p.status}</span></td>
            ${admin ? `<td>
              ${p.status !== "approved" ? `<button class="btn btn-sm btn-primary" data-approve-pay="${p.id}">Onayla</button>` : ""}
              <button class="btn btn-sm btn-danger" data-del-pay="${p.id}">x</button>
            </td>` : ""}
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-pay-btn");
      if (btn) btn.onclick = () => _openPaymentForm();
    }
    if (admin) {
      body.querySelectorAll("[data-approve-pay]").forEach(el => el.onclick = async () => {
        await API.post(`/payroll/payments/${el.dataset.approvePay}/approve`, {});
        UI.toast("Hakediş onaylandı", "success");
        _renderPayments();
      });
      body.querySelectorAll("[data-del-pay]").forEach(el => el.onclick = async () => {
        if (!confirm("Silinsin mi?")) return;
        await API.del(`/payroll/payments/${el.dataset.delPay}`);
        UI.toast("Silindi", "success");
        _renderPayments();
      });
    }
  }

  async function _openPaymentForm() {
    let projects = [];
    try { const d = await API.get("/projects/?page=1"); projects = d.items || d; } catch {}
    UI.openModal(`
      <h3>Yeni Hakediş</h3>
      <form id="pay-form">
        <div class="form-grid">
          <div class="form-row"><label>Proje</label>
            <select name="project_id" required>
              <option value="">— Seçin —</option>
              ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
            </select>
          </div>
          <div class="form-row"><label>Dönem Başlangıç</label><input type="date" name="period_start" required /></div>
          <div class="form-row"><label>Dönem Bitiş</label><input type="date" name="period_end" required /></div>
          <div class="form-row"><label>Planlanan (₺)</label><input type="number" step="0.01" name="planned_amount" value="0" /></div>
          <div class="form-row"><label>Gerçekleşen (₺)</label><input type="number" step="0.01" name="actual_amount" value="0" /></div>
        </div>
        <div class="form-row"><label>Açıklama</label><textarea name="description"></textarea></div>
        <div class="form-error" id="pay-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="pay-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("pay-cancel").onclick = () => UI.closeModal();
    document.getElementById("pay-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/payroll/payments", {
          project_id:     +fd.get("project_id"),
          period_start:   fd.get("period_start"),
          period_end:     fd.get("period_end"),
          planned_amount: parseFloat(fd.get("planned_amount")||"0"),
          actual_amount:  parseFloat(fd.get("actual_amount")||"0"),
          description:    fd.get("description")||"",
        });
        UI.toast("Hakediş kaydedildi", "success");
        UI.closeModal();
        _renderPayments();
      } catch(err) { document.getElementById("pay-err").textContent = err.message; }
    };
  }

  return { load };
})();

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
        <thead><tr><th>Proje</th><th>Dönem</th><th>Planlanan</th><th>Gerçekleşen</th><th>Onaylanan</th><th>Durum</th><th>Detay</th>${admin?"<th>İşlem</th>":""}</tr></thead>
        <tbody>${items.map(p => `
          <tr>
            <td>${UI.esc(p.project_name)}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(p.period_start)} — ${UI.fmtDate(p.period_end)}</td>
            <td>${UI.fmtMoney(p.planned_amount)} ₺</td>
            <td>${UI.fmtMoney(p.actual_amount)} ₺</td>
            <td>${UI.fmtMoney(p.approved_amount)} ₺</td>
            <td><span class="badge" style="background:${STATUS_COLOR[p.status]||'#95a5a6'}">${STATUS_LABEL[p.status]||p.status}</span></td>
            <td><button class="btn btn-sm btn-ghost" data-pay-detail="${p.id}">Metraj & Fiyat</button></td>
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
    body.querySelectorAll("[data-pay-detail]").forEach(el => {
      el.onclick = () => _openPaymentDetail(+el.dataset.payDetail);
    });
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

  // ── Hakediş Detay: Metraj & Fiyat Farkı ─────────────────
  async function _openPaymentDetail(paymentId) {
    let metraj = [], fiyatFarki = [];
    try { metraj = await API.get(`/payroll/payments/${paymentId}/metraj/`); } catch {}
    try { fiyatFarki = await API.get(`/payroll/payments/${paymentId}/fiyat-farki/`); } catch {}
    const editor = Auth.isEditor();

    const metrajTotal = metraj.reduce((sum, r) => sum + (parseFloat(r.unit_price||0) * parseFloat(r.actual_quantity||0)), 0);

    UI.openModal(`
      <h3>Hakediş Detayı</h3>

      <h4 style="margin:12px 0 8px">📐 Metraj Cetveli</h4>
      ${!metraj.length ? `<p class="muted">Metraj satırı yok.</p>` : `
      <table class="data-table" style="font-size:12px">
        <thead>
          <tr>
            <th>Poz No</th><th>Tanım</th><th>Birim</th>
            <th style="text-align:right">Sözleşme Miktarı</th>
            <th style="text-align:right">Gerçekleşen</th>
            <th style="text-align:right">Birim Fiyat</th>
            <th style="text-align:right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${metraj.map(r => {
            const amount = parseFloat(r.unit_price||0) * parseFloat(r.actual_quantity||0);
            return `<tr>
              <td style="font-family:monospace">${UI.esc(r.poz_number||"—")}</td>
              <td>${UI.esc(r.description)}</td>
              <td class="muted">${UI.esc(r.unit||"—")}</td>
              <td style="text-align:right">${UI.fmtMoney(r.contract_quantity)}</td>
              <td style="text-align:right">${UI.fmtMoney(r.actual_quantity)}</td>
              <td style="text-align:right">${UI.fmtMoney(r.unit_price)} ₺</td>
              <td style="text-align:right;font-weight:600">${UI.fmtMoney(amount)} ₺</td>
            </tr>`;
          }).join("")}
          <tr style="font-weight:700;border-top:2px solid var(--border)">
            <td colspan="6" style="text-align:right">Toplam</td>
            <td style="text-align:right">${UI.fmtMoney(metrajTotal)} ₺</td>
          </tr>
        </tbody>
      </table>`}
      ${editor ? `<button class="btn btn-sm btn-primary" style="margin-top:8px" id="new-metraj-btn">+ Satır Ekle</button>` : ""}

      <h4 style="margin:16px 0 8px">📊 Fiyat Farkı</h4>
      ${!fiyatFarki.length ? `<p class="muted">Fiyat farkı kaydı yok.</p>` : `
      <table class="data-table" style="font-size:12px">
        <thead>
          <tr>
            <th>Endeks Türü</th>
            <th style="text-align:right">Başlangıç Endeksi</th>
            <th style="text-align:right">Bitiş Endeksi</th>
            <th style="text-align:right">Fark Tutarı</th>
          </tr>
        </thead>
        <tbody>
          ${fiyatFarki.map(ff => `
          <tr>
            <td>${UI.esc(ff.index_type||"—")}</td>
            <td style="text-align:right">${UI.fmtMoney(ff.start_index)}</td>
            <td style="text-align:right">${UI.fmtMoney(ff.end_index)}</td>
            <td style="text-align:right;font-weight:600;color:${parseFloat(ff.difference_amount||0)>=0?"#27ae60":"#e74c3c"}">
              ${parseFloat(ff.difference_amount||0)>=0?"+":""}${UI.fmtMoney(ff.difference_amount)} ₺
            </td>
          </tr>`).join("")}
        </tbody>
      </table>`}
      ${editor ? `<button class="btn btn-sm btn-primary" style="margin-top:8px" id="new-ff-btn">+ Fiyat Farkı Ekle</button>` : ""}
    `);

    if (editor) {
      const metrajBtn = document.getElementById("new-metraj-btn");
      if (metrajBtn) metrajBtn.onclick = () => _openMetrajForm(paymentId);
      const ffBtn = document.getElementById("new-ff-btn");
      if (ffBtn) ffBtn.onclick = () => _openFiyatFarkiForm(paymentId);
    }
  }

  async function _openMetrajForm(paymentId) {
    UI.openModal(`
      <h3>Metraj Satırı Ekle</h3>
      <form id="metraj-form">
        <div class="form-grid">
          <div class="form-row"><label>Poz No</label><input name="poz_number" placeholder="1.1.1" /></div>
          <div class="form-row"><label>Birim</label><input name="unit" placeholder="adet, m², m…" /></div>
        </div>
        <div class="form-row"><label>Tanım</label><input name="description" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Sözleşme Miktarı</label><input type="number" step="0.001" name="contract_quantity" value="0" /></div>
          <div class="form-row"><label>Gerçekleşen Miktar</label><input type="number" step="0.001" name="actual_quantity" value="0" /></div>
          <div class="form-row"><label>Birim Fiyat (₺)</label><input type="number" step="0.01" name="unit_price" value="0" /></div>
        </div>
        <div class="form-error" id="metraj-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="metraj-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Ekle</button>
        </div>
      </form>
    `);
    document.getElementById("metraj-cancel").onclick = () => { UI.closeModal(); _openPaymentDetail(paymentId); };
    document.getElementById("metraj-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/payroll/payments/${paymentId}/metraj/`, {
          poz_number: fd.get("poz_number") || "",
          description: fd.get("description"),
          unit: fd.get("unit") || "",
          contract_quantity: parseFloat(fd.get("contract_quantity")||"0"),
          actual_quantity: parseFloat(fd.get("actual_quantity")||"0"),
          unit_price: parseFloat(fd.get("unit_price")||"0"),
        });
        UI.toast("Metraj satırı eklendi", "success");
        UI.closeModal();
        _openPaymentDetail(paymentId);
      } catch (err) { document.getElementById("metraj-err").textContent = err.message; }
    };
  }

  async function _openFiyatFarkiForm(paymentId) {
    UI.openModal(`
      <h3>Fiyat Farkı Ekle</h3>
      <form id="ff-form">
        <div class="form-row"><label>Endeks Türü</label><input name="index_type" placeholder="ÜFE, TÜFE, İnşaat İndeksi…" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Başlangıç Endeksi</label><input type="number" step="0.001" name="start_index" value="0" /></div>
          <div class="form-row"><label>Bitiş Endeksi</label><input type="number" step="0.001" name="end_index" value="0" /></div>
          <div class="form-row"><label>Fark Tutarı (₺)</label><input type="number" step="0.01" name="difference_amount" value="0" /></div>
        </div>
        <div class="form-error" id="ff-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ff-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Ekle</button>
        </div>
      </form>
    `);
    document.getElementById("ff-cancel").onclick = () => { UI.closeModal(); _openPaymentDetail(paymentId); };
    document.getElementById("ff-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/payroll/payments/${paymentId}/fiyat-farki/`, {
          index_type: fd.get("index_type"),
          start_index: parseFloat(fd.get("start_index")||"0"),
          end_index: parseFloat(fd.get("end_index")||"0"),
          difference_amount: parseFloat(fd.get("difference_amount")||"0"),
        });
        UI.toast("Fiyat farkı eklendi", "success");
        UI.closeModal();
        _openPaymentDetail(paymentId);
      } catch (err) { document.getElementById("ff-err").textContent = err.message; }
    };
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

// ===================== TEDARİK =====================
const Procurement = (() => {
  const REQ_STATUS_COLOR = { pending: "#f39c12", approved: "#27ae60", rejected: "#e74c3c", ordered: "#4f6ef7" };
  const REQ_STATUS_LABEL = { pending: "Bekliyor", approved: "Onaylandı", rejected: "Reddedildi", ordered: "Sipariş Verildi" };
  const ORD_STATUS_COLOR = { draft: "#95a5a6", sent: "#4f6ef7", partial: "#f39c12", delivered: "#27ae60", cancelled: "#e74c3c" };
  const ORD_STATUS_LABEL = { draft: "Taslak", sent: "Gönderildi", partial: "Kısmi Teslim", delivered: "Teslim Alındı", cancelled: "İptal" };

  let activeTab = "requests";
  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("procurement-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Tedarik Yönetimi</h2>
        <select id="proc-project-sel" style="min-width:220px">
          <option value="">— Proje Seçin —</option>
          ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
        </select>
      </div>
      <div class="tab-bar" style="margin-bottom:16px">
        <button class="rp-tab ${activeTab==="requests"?"active":""}" data-ptab="requests">Satın Alma Talepleri</button>
        <button class="rp-tab ${activeTab==="orders"?"active":""}" data-ptab="orders">Siparişler</button>
      </div>
      <div id="proc-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("proc-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      if (selectedProjectId) _loadTab();
      else document.getElementById("proc-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
    };
    body.querySelectorAll(".rp-tab").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.ptab;
        body.querySelectorAll(".rp-tab").forEach(b => b.classList.toggle("active", b.dataset.ptab === activeTab));
        if (selectedProjectId) _loadTab();
      };
    });
  }

  function _loadTab() {
    if (activeTab === "requests") _renderRequests();
    if (activeTab === "orders")   _renderOrders();
  }

  // ── Satın Alma Talepleri ──────────────────────────────────
  async function _renderRequests() {
    const content = document.getElementById("proc-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let reqs = [];
    try { reqs = await API.get(`/procurement/requests?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Satın Alma Talepleri</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-req-btn">+ Yeni Talep</button>` : ""}
      </div>
      ${!reqs.length ? `<p class="muted">Talep kaydı yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>Kalem Adı</th><th>Miktar</th><th>Birim</th><th>Gerekli Tarih</th><th>Durum</th></tr></thead>
        <tbody>${reqs.map(r => `
          <tr>
            <td>${UI.esc(r.item_name)}</td>
            <td>${r.quantity}</td>
            <td class="muted">${UI.esc(r.unit||"—")}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(r.required_date)}</td>
            <td><span class="badge" style="background:${REQ_STATUS_COLOR[r.status]||'#95a5a6'}">${REQ_STATUS_LABEL[r.status]||r.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-req-btn");
      if (btn) btn.onclick = () => _openRequestForm();
    }
  }

  async function _openRequestForm() {
    UI.openModal(`
      <h3>Yeni Satın Alma Talebi</h3>
      <form id="req-form">
        <div class="form-row"><label>Kalem Adı</label><input name="item_name" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Miktar</label><input type="number" step="0.01" name="quantity" value="1" required /></div>
          <div class="form-row"><label>Birim</label><input name="unit" placeholder="adet, kg, m…" /></div>
        </div>
        <div class="form-row"><label>Gerekli Tarih</label><input type="date" name="required_date" /></div>
        <div class="form-row"><label>Açıklama</label><textarea name="description"></textarea></div>
        <div class="form-error" id="req-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="req-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("req-cancel").onclick = () => UI.closeModal();
    document.getElementById("req-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/procurement/requests", {
          project_id: +selectedProjectId,
          item_name: fd.get("item_name"),
          quantity: parseFloat(fd.get("quantity")),
          unit: fd.get("unit") || "",
          required_date: fd.get("required_date") || null,
          description: fd.get("description") || "",
        });
        UI.toast("Talep oluşturuldu", "success");
        UI.closeModal();
        _renderRequests();
      } catch (err) { document.getElementById("req-err").textContent = err.message; }
    };
  }

  // ── Siparişler ────────────────────────────────────────────
  async function _renderOrders() {
    const content = document.getElementById("proc-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let orders = [];
    try { orders = await API.get(`/procurement/orders?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    const today = new Date();
    content.innerHTML = `
      <div class="section-header" style="margin-bottom:12px">
        <h3>Siparişler</h3>
        ${editor ? `<button class="btn btn-primary btn-sm" id="new-ord-btn">+ Yeni Sipariş</button>` : ""}
      </div>
      ${!orders.length ? `<p class="muted">Sipariş yok.</p>` : `
      <table class="data-table">
        <thead><tr><th>PO No</th><th>Tedarikçi</th><th>Tutar</th><th>Beklenen Teslim</th><th>Gerçek Teslim</th><th>Durum</th>${editor?"<th>Teslimat</th>":""}</tr></thead>
        <tbody>${orders.map(o => {
          const isLate = o.expected_delivery && !o.actual_delivery && new Date(o.expected_delivery) < today;
          return `<tr style="${isLate?"background:#e74c3c11":""}" title="${isLate?"Gecikmiş teslimat":""}">
            <td style="font-family:monospace">${UI.esc(o.po_number||"—")}</td>
            <td>${UI.esc(o.supplier||"—")}</td>
            <td>${UI.fmtMoney(o.amount)} ₺</td>
            <td class="muted" style="font-size:12px;color:${isLate?"#e74c3c":""}">${UI.fmtDate(o.expected_delivery)}${isLate?" ⚠️":""}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(o.actual_delivery)||"—"}</td>
            <td><span class="badge" style="background:${ORD_STATUS_COLOR[o.status]||'#95a5a6'}">${ORD_STATUS_LABEL[o.status]||o.status}</span></td>
            ${editor ? `<td><button class="btn btn-sm" data-delivery="${o.id}">+ Teslimat</button></td>` : ""}
          </tr>`;
        }).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      const btn = document.getElementById("new-ord-btn");
      if (btn) btn.onclick = () => _openOrderForm();
      content.querySelectorAll("[data-delivery]").forEach(el => {
        el.onclick = () => _openDeliveryForm(el.dataset.delivery);
      });
    }
  }

  async function _openOrderForm() {
    UI.openModal(`
      <h3>Yeni Sipariş</h3>
      <form id="ord-form">
        <div class="form-row"><label>PO No</label><input name="po_number" /></div>
        <div class="form-row"><label>Tedarikçi</label><input name="supplier" /></div>
        <div class="form-row"><label>Tutar (₺)</label><input type="number" step="0.01" name="amount" value="0" /></div>
        <div class="form-grid">
          <div class="form-row"><label>Beklenen Teslim</label><input type="date" name="expected_delivery" /></div>
        </div>
        <div class="form-error" id="ord-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ord-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("ord-cancel").onclick = () => UI.closeModal();
    document.getElementById("ord-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/procurement/orders", {
          project_id: +selectedProjectId,
          po_number: fd.get("po_number") || "",
          supplier: fd.get("supplier") || "",
          amount: parseFloat(fd.get("amount") || "0"),
          expected_delivery: fd.get("expected_delivery") || null,
        });
        UI.toast("Sipariş oluşturuldu", "success");
        UI.closeModal();
        _renderOrders();
      } catch (err) { document.getElementById("ord-err").textContent = err.message; }
    };
  }

  async function _openDeliveryForm(orderId) {
    UI.openModal(`
      <h3>Teslimat Kaydet</h3>
      <form id="del-form">
        <div class="form-row"><label>Teslimat Tarihi</label><input type="date" name="delivery_date" required value="${new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-row"><label>Teslim Alınan Miktar</label><input type="number" step="0.01" name="received_quantity" value="0" /></div>
        <div class="form-row"><label>Not</label><textarea name="notes"></textarea></div>
        <div class="form-error" id="del-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="del-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("del-cancel").onclick = () => UI.closeModal();
    document.getElementById("del-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/procurement/orders/${orderId}/deliveries`, {
          delivery_date: fd.get("delivery_date"),
          received_quantity: parseFloat(fd.get("received_quantity") || "0"),
          notes: fd.get("notes") || "",
        });
        UI.toast("Teslimat kaydedildi", "success");
        UI.closeModal();
        _renderOrders();
      } catch (err) { document.getElementById("del-err").textContent = err.message; }
    };
  }

  return { load };
})();

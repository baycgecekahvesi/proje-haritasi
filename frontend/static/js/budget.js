// Bütçe paneli: planlanan tutar, kullanım çubuğu, harcama listesi/ekleme, aşım uyarısı.
const Budget = (() => {
  const TYPES = {
    labor: "İşçilik", material: "Malzeme", equipment: "Ekipman",
    service: "Hizmet", other: "Diğer",
  };
  const CUR = { TRY: "₺", USD: "$", EUR: "€" };

  async function render(projectId, box) {
    const b = await API.get(`/budget/${projectId}`);
    const editor = Auth.isEditor();
    const sym = CUR[b.currency] || "";
    const barColor = b.is_over_budget ? "#e74c3c" : b.usage_percent > 80 ? "#f39c12" : "#27ae60";
    const pct = Math.min(b.usage_percent, 100);

    box.innerHTML = `
      <div class="card-meta" style="justify-content:space-between">
        <span>Planlanan: <strong>${UI.fmtMoney(b.planned_amount)} ${sym}</strong></span>
        <span>Harcanan: <strong>${UI.fmtMoney(b.total_spent)} ${sym}</strong></span>
        <span>Kalan: <strong class="${b.remaining < 0 ? "over-budget" : ""}">${UI.fmtMoney(b.remaining)} ${sym}</strong></span>
      </div>
      <div class="progress" style="margin:10px 0"><span style="width:${pct}%;background:${barColor}"></span></div>
      <div class="card-meta" style="justify-content:space-between">
        <span>%${b.usage_percent} kullanım</span>
        ${b.is_over_budget ? `<span class="over-budget">⚠️ BÜTÇE AŞILDI</span>` : ""}
        ${editor ? `<button class="btn btn-sm" id="edit-budget-${projectId}">Bütçeyi Düzenle</button>` : ""}
      </div>

      <div id="expenses-${projectId}" style="margin-top:12px">
        ${b.expenses.map((e) => expHtml(e, sym, editor)).join("") || `<p class="muted">Harcama kaydı yok.</p>`}
      </div>

      ${editor ? `
      <form id="exp-form-${projectId}" class="form-grid" style="margin-top:10px">
        <input name="description" placeholder="Harcama açıklaması" required />
        <input name="amount" type="number" step="0.01" placeholder="Tutar" required />
        <select name="expense_type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}" />
        <input name="invoice_no" placeholder="Fatura no (ops.)" />
        <button class="btn btn-primary btn-sm" type="submit">+ Harcama Ekle</button>
      </form>` : ""}
    `;

    if (editor) {
      box.querySelector(`#exp-form-${projectId}`).onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await API.post(`/budget/${projectId}/expenses`, {
            description: fd.get("description"),
            amount: fd.get("amount"),
            expense_type: fd.get("expense_type"),
            date: fd.get("date"),
            invoice_no: fd.get("invoice_no") || "",
          });
          render(projectId, box);
          App.refreshStats();
        } catch (err) { UI.toast(err.message, "error"); }
      };

      box.querySelectorAll("[data-del-exp]").forEach((el) => {
        el.onclick = async () => {
          await API.del(`/budget/${projectId}/expenses/${el.dataset.delExp}`);
          render(projectId, box);
          App.refreshStats();
        };
      });

      const editBtn = box.querySelector(`#edit-budget-${projectId}`);
      if (editBtn) editBtn.onclick = () => openBudgetForm(projectId, b, box);
    }
  }

  function expHtml(e, sym, editor) {
    return `
      <div class="row-item">
        <div>
          <strong>${UI.esc(e.description)}</strong>
          <span class="pill">${TYPES[e.expense_type] || e.expense_type}</span>
          <span class="muted" style="font-size:12px">${UI.fmtDate(e.date)}${e.invoice_no ? " · Fatura: " + UI.esc(e.invoice_no) : ""}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <strong>${UI.fmtMoney(e.amount)} ${sym}</strong>
          ${editor ? `<button class="btn btn-sm btn-ghost" data-del-exp="${e.id}">✕</button>` : ""}
        </div>
      </div>`;
  }

  function openBudgetForm(projectId, b, box) {
    UI.openModal(`
      <h3>Bütçe Düzenle</h3>
      <form id="budget-form">
        <div class="form-row"><label>Planlanan Tutar</label><input name="planned_amount" type="number" step="0.01" value="${b.planned_amount}" /></div>
        <div class="form-row"><label>Para Birimi</label>
          <select name="currency">
            ${Object.entries(CUR).map(([k, v]) => `<option value="${k}" ${b.currency === k ? "selected" : ""}>${k} (${v})</option>`).join("")}
          </select>
        </div>
        <div class="form-row"><label>Notlar</label><textarea name="notes">${UI.esc(b.notes || "")}</textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="bf-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("bf-cancel").onclick = () => UI.closeModal();
    document.getElementById("budget-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.patch(`/budget/${projectId}`, {
        planned_amount: fd.get("planned_amount"),
        currency: fd.get("currency"),
        notes: fd.get("notes"),
      });
      UI.toast("Bütçe güncellendi", "success");
      UI.closeModal();
      // Detay modalını yeniden açmak yerine ilgili kutuyu yenile
      Projects.openDetail(projectId);
    };
  }

  return { render };
})();

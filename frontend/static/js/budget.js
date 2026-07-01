// Bütçe paneli: planlanan tutar, kullanım çubuğu, WBS kalemleri, harcama listesi/ekleme, aşım uyarısı.
const Budget = (() => {
  const TYPES = {
    labor: "İşçilik", material: "Malzeme", equipment: "Ekipman",
    service: "Hizmet", other: "Diğer",
  };
  const LINE_CATS = {
    iscilik: "İşçilik", malzeme: "Malzeme", ekipman: "Ekipman",
    taseron: "Taşeronluk", genel_gider: "Genel Gider", diger: "Diğer",
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

      <details open style="margin-top:16px">
        <summary style="cursor:pointer;font-weight:600;padding:4px 0">📊 WBS Bütçe Kalemleri</summary>
        <div id="lines-${projectId}" style="margin-top:8px">
          ${linesHtml(b.lines || [], sym, editor, projectId)}
        </div>
        ${editor ? `
        <form id="line-form-${projectId}" class="form-grid" style="margin-top:8px">
          <select name="category">${Object.entries(LINE_CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
          <input name="description" placeholder="Kalem açıklaması" required />
          <input name="planned_amount" type="number" step="0.01" placeholder="Planlanan tutar" required />
          <input name="actual_amount" type="number" step="0.01" placeholder="Gerçekleşen tutar" value="0" />
          <button class="btn btn-primary btn-sm" type="submit">+ Kalem Ekle</button>
        </form>` : ""}
      </details>

      <details open style="margin-top:16px">
        <summary style="cursor:pointer;font-weight:600;padding:4px 0">💸 Harcamalar</summary>
        <div id="expenses-${projectId}" style="margin-top:8px">
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
      </details>
    `;

    if (editor) {
      const lineForm = box.querySelector(`#line-form-${projectId}`);
      if (lineForm) {
        lineForm.onsubmit = async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await API.post(`/budget/${projectId}/lines`, {
              category: fd.get("category"),
              description: fd.get("description"),
              planned_amount: fd.get("planned_amount"),
              actual_amount: fd.get("actual_amount") || "0",
            });
            render(projectId, box);
          } catch (err) { UI.toast(err.message, "error"); }
        };
      }

      box.querySelectorAll("[data-del-line]").forEach((el) => {
        el.onclick = async () => {
          await API.del(`/budget/${projectId}/lines/${el.dataset.delLine}`);
          render(projectId, box);
        };
      });

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

  function linesHtml(lines, sym, editor, projectId) {
    if (!lines.length) return `<p class="muted">Kalem tanımlanmamış.</p>`;
    const total_planned = lines.reduce((s, l) => s + parseFloat(l.planned_amount), 0);
    const total_actual = lines.reduce((s, l) => s + parseFloat(l.actual_amount), 0);
    return `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;padding:4px 6px">Kategori</th>
          <th style="text-align:left;padding:4px 6px">Açıklama</th>
          <th style="text-align:right;padding:4px 6px">Planlanan</th>
          <th style="text-align:right;padding:4px 6px">Gerçekleşen</th>
          <th style="text-align:right;padding:4px 6px">Fark</th>
          ${editor ? `<th></th>` : ""}
        </tr></thead>
        <tbody>
          ${lines.map((l) => {
            const diff = parseFloat(l.actual_amount) - parseFloat(l.planned_amount);
            const diffColor = diff > 0 ? "#e74c3c" : diff < 0 ? "#27ae60" : "inherit";
            return `<tr style="border-bottom:1px solid var(--border)">
              <td style="padding:4px 6px"><span class="pill">${UI.esc(l.category_display)}</span></td>
              <td style="padding:4px 6px">${UI.esc(l.description)}</td>
              <td style="text-align:right;padding:4px 6px">${UI.fmtMoney(l.planned_amount)} ${sym}</td>
              <td style="text-align:right;padding:4px 6px">${UI.fmtMoney(l.actual_amount)} ${sym}</td>
              <td style="text-align:right;padding:4px 6px;color:${diffColor}">${diff > 0 ? "+" : ""}${UI.fmtMoney(diff)} ${sym}</td>
              ${editor ? `<td style="padding:4px 6px"><button class="btn btn-sm btn-ghost" data-del-line="${l.id}">✕</button></td>` : ""}
            </tr>`;
          }).join("")}
          <tr style="font-weight:600;border-top:2px solid var(--border)">
            <td colspan="2" style="padding:4px 6px">Toplam</td>
            <td style="text-align:right;padding:4px 6px">${UI.fmtMoney(total_planned)} ${sym}</td>
            <td style="text-align:right;padding:4px 6px">${UI.fmtMoney(total_actual)} ${sym}</td>
            <td style="text-align:right;padding:4px 6px;color:${total_actual - total_planned > 0 ? "#e74c3c" : "#27ae60"}">${total_actual - total_planned > 0 ? "+" : ""}${UI.fmtMoney(total_actual - total_planned)} ${sym}</td>
            ${editor ? `<td></td>` : ""}
          </tr>
        </tbody>
      </table>`;
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

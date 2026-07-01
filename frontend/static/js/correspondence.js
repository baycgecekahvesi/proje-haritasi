// ===================== YAZIŞMA YÖNETİMİ =====================
const Correspondence = (() => {
  const TYPE_COLOR = { RFI: "#4f6ef7", DCN: "#8e44ad", LETTER: "#27ae60", MEMO: "#f39c12", TRANSMITTAL: "#2980b9" };
  const STATUS_COLOR = { open: "#f39c12", answered: "#27ae60", overdue: "#e74c3c", closed: "#95a5a6" };
  const STATUS_LABEL = { open: "Açık", answered: "Yanıtlandı", overdue: "Gecikmiş", closed: "Kapalı" };

  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("correspondence-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Yazışma Yönetimi</h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select id="corr-project-sel" style="min-width:220px">
            <option value="">— Proje Seçin —</option>
            ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
          </select>
          ${Auth.isEditor() ? `<button class="btn btn-primary btn-sm" id="new-corr-btn" style="display:none">+ Yeni Yazışma</button>` : ""}
        </div>
      </div>
      <div id="corr-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("corr-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      const newBtn = document.getElementById("new-corr-btn");
      if (newBtn) newBtn.style.display = selectedProjectId ? "" : "none";
      if (selectedProjectId) _renderList();
      else document.getElementById("corr-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
    };

    const newBtn = document.getElementById("new-corr-btn");
    if (newBtn) newBtn.onclick = () => _openForm();
  }

  async function _renderList() {
    const content = document.getElementById("corr-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let items = [];
    try { items = await API.get(`/correspondence?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    const today = new Date();
    content.innerHTML = `
      ${!items.length ? `<p class="muted">Yazışma kaydı yok.</p>` : `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ref No</th><th>Tür</th><th>Konu</th><th>Gönderen</th><th>Alıcı</th>
            <th>Gönderim</th><th>Yanıt Süresi</th><th>Durum</th>
            ${editor ? "<th>İşlem</th>" : ""}
          </tr>
        </thead>
        <tbody>${items.map(it => {
          const isOverdue = it.response_deadline && it.status==="open" && new Date(it.response_deadline) < today;
          return `<tr style="${isOverdue?"background:#e74c3c11;":""}">
            <td style="font-family:monospace">${UI.esc(it.ref_number||"—")}</td>
            <td><span class="badge" style="background:${TYPE_COLOR[it.type]||'#95a5a6'}">${UI.esc(it.type)}</span></td>
            <td style="max-width:200px">${UI.esc(it.subject)}</td>
            <td class="muted">${UI.esc(it.sender||"—")}</td>
            <td class="muted">${UI.esc(it.receiver||"—")}</td>
            <td class="muted" style="font-size:12px">${UI.fmtDate(it.sent_date)}</td>
            <td class="muted" style="font-size:12px;color:${isOverdue?"#e74c3c":""}">
              ${UI.fmtDate(it.response_deadline)||"—"}${isOverdue?" ⚠️":""}
            </td>
            <td><span class="pill" style="background:${STATUS_COLOR[it.status]||'#95a5a6'}22;color:${STATUS_COLOR[it.status]||'#95a5a6'}">${STATUS_LABEL[it.status]||it.status}</span></td>
            ${editor ? `<td style="display:flex;gap:4px">
              ${it.status==="open" ? `<button class="btn btn-sm btn-primary" data-respond-corr="${it.id}">Yanıtla</button>` : ""}
            </td>` : ""}
          </tr>`;
        }).join("")}
        </tbody>
      </table>`}
    `;
    if (editor) {
      content.querySelectorAll("[data-respond-corr]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.post(`/correspondence/${el.dataset.respondCorr}/respond`, {});
            UI.toast("Yazışma yanıtlandı olarak işaretlendi", "success");
            _renderList();
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
  }

  async function _openForm() {
    UI.openModal(`
      <h3>Yeni Yazışma</h3>
      <form id="corr-form">
        <div class="form-grid">
          <div class="form-row"><label>Ref No</label><input name="ref_number" placeholder="RFI-001" /></div>
          <div class="form-row"><label>Tür</label>
            <select name="type">
              <option value="RFI">RFI</option>
              <option value="DCN">DCN</option>
              <option value="LETTER">Mektup</option>
              <option value="MEMO">Memorandum</option>
              <option value="TRANSMITTAL">Transmittal</option>
            </select>
          </div>
        </div>
        <div class="form-row"><label>Konu</label><input name="subject" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Gönderen</label><input name="sender" /></div>
          <div class="form-row"><label>Alıcı</label><input name="receiver" /></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Gönderim Tarihi</label><input type="date" name="sent_date" value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="form-row"><label>Yanıt Süresi</label><input type="date" name="response_deadline" /></div>
        </div>
        <div class="form-row"><label>İçerik</label><textarea name="body"></textarea></div>
        <div class="form-error" id="corr-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="corr-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("corr-cancel").onclick = () => UI.closeModal();
    document.getElementById("corr-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/correspondence", {
          project_id: +selectedProjectId,
          ref_number: fd.get("ref_number") || "",
          type: fd.get("type"),
          subject: fd.get("subject"),
          sender: fd.get("sender") || "",
          receiver: fd.get("receiver") || "",
          sent_date: fd.get("sent_date") || null,
          response_deadline: fd.get("response_deadline") || null,
          body: fd.get("body") || "",
        });
        UI.toast("Yazışma oluşturuldu", "success");
        UI.closeModal();
        _renderList();
      } catch (err) { document.getElementById("corr-err").textContent = err.message; }
    };
  }

  return { load };
})();

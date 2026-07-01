// ===================== TOPLANTI & AKSİYONLAR =====================
const Meetings = (() => {
  const TYPE_LABEL = { kickoff: "Kickoff", weekly: "Haftalık", technical: "Teknik", review: "Gözden Geçirme", other: "Diğer" };
  const TYPE_COLOR = { kickoff: "#8e44ad", weekly: "#4f6ef7", technical: "#2980b9", review: "#27ae60", other: "#95a5a6" };
  const ACT_STATUS_COLOR = { open: "#f39c12", completed: "#27ae60", cancelled: "#95a5a6" };
  const ACT_STATUS_LABEL = { open: "Açık", completed: "Tamamlandı", cancelled: "İptal" };

  let selectedProjectId = null;

  async function load() {
    const body = document.getElementById("meetings-body");
    if (!body) return;

    let projects = [];
    try { const d = await API.get("/projects"); projects = d.items || d; } catch {}

    body.innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <h2>Toplantı & Aksiyonlar</h2>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select id="mtg-project-sel" style="min-width:220px">
            <option value="">— Proje Seçin —</option>
            ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
          </select>
          ${Auth.isEditor() ? `<button class="btn btn-primary btn-sm" id="new-mtg-btn" style="display:none">+ Yeni Toplantı</button>` : ""}
        </div>
      </div>
      <div id="mtg-content"><p class="muted">Proje seçin.</p></div>
    `;

    document.getElementById("mtg-project-sel").onchange = (e) => {
      selectedProjectId = e.target.value || null;
      const newBtn = document.getElementById("new-mtg-btn");
      if (newBtn) newBtn.style.display = selectedProjectId ? "" : "none";
      if (selectedProjectId) _renderMeetings();
      else document.getElementById("mtg-content").innerHTML = `<p class="muted">Proje seçin.</p>`;
    };
    const newBtn = document.getElementById("new-mtg-btn");
    if (newBtn) newBtn.onclick = () => _openMeetingForm();
  }

  async function _renderMeetings() {
    const content = document.getElementById("mtg-content");
    content.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let meetings = [];
    try { meetings = await API.get(`/meetings?project_id=${selectedProjectId}`); } catch (e) {
      content.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    content.innerHTML = `
      ${!meetings.length ? `<p class="muted">Toplantı kaydı yok.</p>` : `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${meetings.map(m => `
          <div class="row-item" style="cursor:pointer;flex-direction:column;align-items:flex-start;gap:6px" data-mtg-id="${m.id}">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;width:100%">
              <span class="badge" style="background:${TYPE_COLOR[m.type]||'#95a5a6'}">${TYPE_LABEL[m.type]||m.type}</span>
              <strong>${UI.esc(m.title)}</strong>
              <span class="muted" style="font-size:12px;margin-left:auto">
                📅 ${UI.fmtDate(m.meeting_date)}
                ${m.location ? ` · 📍 ${UI.esc(m.location)}` : ""}
              </span>
            </div>
            <div style="display:flex;gap:12px;font-size:12px;color:var(--muted,#666)">
              <span>👥 ${m.attendee_count||0} katılımcı</span>
              <span>✅ ${m.action_count||0} aksiyon</span>
              <button class="btn btn-sm" data-open-mtg="${m.id}" style="margin-left:auto">Detay & Aksiyonlar</button>
            </div>
          </div>`).join("")}
      </div>`}
    `;
    content.querySelectorAll("[data-open-mtg]").forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        _openMeetingDetail(+el.dataset.openMtg);
      };
    });
  }

  async function _openMeetingDetail(meetingId) {
    let meeting = null, actions = [];
    try {
      const meetings = await API.get(`/meetings/?project_id=${selectedProjectId}`);
      meeting = meetings.find(m => m.id === meetingId);
      actions = await API.get(`/meetings/${meetingId}/actions`);
    } catch (e) {
      UI.toast(e.message, "error"); return;
    }
    const editor = Auth.isEditor();
    const today = new Date();
    UI.openModal(`
      <h3>${UI.esc(meeting?.title || "Toplantı Detayı")}</h3>
      <div class="card-meta" style="margin-bottom:8px">
        <span class="badge" style="background:${TYPE_COLOR[meeting?.type]||'#95a5a6'}">${TYPE_LABEL[meeting?.type]||meeting?.type}</span>
        <span class="muted">📅 ${UI.fmtDate(meeting?.meeting_date)}</span>
        ${meeting?.location ? `<span class="muted">📍 ${UI.esc(meeting.location)}</span>` : ""}
      </div>
      ${meeting?.minutes ? `<div style="background:var(--surface,#f5f7fa);border-radius:6px;padding:10px;font-size:13px;margin-bottom:12px;white-space:pre-wrap">${UI.esc(meeting.minutes)}</div>` : ""}

      <div class="section-header" style="margin:12px 0 8px">
        <h4>Aksiyon Kalemleri</h4>
        ${editor ? `<button class="btn btn-sm btn-primary" id="new-action-btn">+ Aksiyon Ekle</button>` : ""}
      </div>
      ${!actions.length ? `<p class="muted">Aksiyon yok.</p>` : `
      <div style="display:flex;flex-direction:column;gap:6px">
        ${actions.map(a => {
          const isLate = a.due_date && a.status !== "completed" && new Date(a.due_date) < today;
          return `<div class="row-item" style="${isLate?"background:#e74c3c11;":""}">
            <div>
              <span>${UI.esc(a.description)}</span>
              <span class="muted" style="font-size:12px"> · 👤 ${UI.esc(a.responsible||"—")} · 📅 ${UI.fmtDate(a.due_date)||"—"}</span>
              ${isLate ? `<span class="pill" style="background:#e74c3c22;color:#e74c3c;margin-left:4px">Gecikmiş</span>` : ""}
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="pill" style="background:${ACT_STATUS_COLOR[a.status]||'#95a5a6'}22;color:${ACT_STATUS_COLOR[a.status]||'#95a5a6'}">${ACT_STATUS_LABEL[a.status]||a.status}</span>
              ${editor && a.status!=="completed" ? `<button class="btn btn-sm btn-primary" data-complete-action="${a.id}">Tamamla</button>` : ""}
            </div>
          </div>`;
        }).join("")}
      </div>`}
    `);

    if (editor) {
      const newActionBtn = document.getElementById("new-action-btn");
      if (newActionBtn) newActionBtn.onclick = () => _openActionForm(meetingId);
      document.querySelectorAll("[data-complete-action]").forEach(el => {
        el.onclick = async () => {
          try {
            await API.patch(`/meetings/${meetingId}/actions/${el.dataset.completeAction}`, { status: "completed" });
            UI.toast("Aksiyon tamamlandı", "success");
            _openMeetingDetail(meetingId);
          } catch (err) { UI.toast(err.message, "error"); }
        };
      });
    }
  }

  async function _openMeetingForm() {
    UI.openModal(`
      <h3>Yeni Toplantı</h3>
      <form id="mtg-form">
        <div class="form-row"><label>Başlık</label><input name="title" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Tür</label>
            <select name="type">
              <option value="weekly">Haftalık</option>
              <option value="kickoff">Kickoff</option>
              <option value="technical">Teknik</option>
              <option value="review">Gözden Geçirme</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          <div class="form-row"><label>Tarih</label><input type="date" name="meeting_date" required value="${new Date().toISOString().slice(0,10)}" /></div>
        </div>
        <div class="form-row"><label>Yer</label><input name="location" /></div>
        <div class="form-row"><label>Katılımcılar</label><input name="attendees" placeholder="Ad Soyad, virgülle ayırın" /></div>
        <div class="form-row"><label>Toplantı Tutanağı</label><textarea name="minutes" rows="4"></textarea></div>
        <div class="form-error" id="mtg-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="mtg-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Oluştur</button>
        </div>
      </form>
    `);
    document.getElementById("mtg-cancel").onclick = () => UI.closeModal();
    document.getElementById("mtg-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/meetings", {
          project_id: +selectedProjectId,
          title: fd.get("title"),
          type: fd.get("type"),
          meeting_date: fd.get("meeting_date"),
          location: fd.get("location") || "",
          attendees: fd.get("attendees") || "",
          minutes: fd.get("minutes") || "",
        });
        UI.toast("Toplantı oluşturuldu", "success");
        UI.closeModal();
        _renderMeetings();
      } catch (err) { document.getElementById("mtg-err").textContent = err.message; }
    };
  }

  async function _openActionForm(meetingId) {
    UI.openModal(`
      <h3>Yeni Aksiyon Kalemi</h3>
      <form id="action-form">
        <div class="form-row"><label>Açıklama</label><input name="description" required /></div>
        <div class="form-grid">
          <div class="form-row"><label>Sorumlu</label><input name="responsible" /></div>
          <div class="form-row"><label>Son Tarih</label><input type="date" name="due_date" /></div>
        </div>
        <div class="form-error" id="action-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="action-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Ekle</button>
        </div>
      </form>
    `);
    document.getElementById("action-cancel").onclick = () => UI.closeModal();
    document.getElementById("action-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post(`/meetings/${meetingId}/actions`, {
          description: fd.get("description"),
          responsible: fd.get("responsible") || "",
          due_date: fd.get("due_date") || null,
        });
        UI.toast("Aksiyon eklendi", "success");
        UI.closeModal();
        _openMeetingDetail(meetingId);
      } catch (err) { document.getElementById("action-err").textContent = err.message; }
    };
  }

  return { load };
})();

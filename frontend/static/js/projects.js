// Proje listesi, filtreler, sayfalama, detay modalı ve oluştur/düzenle formu.
const Projects = (() => {
  let page = 1;
  let totalCount = 0;
  const PAGE_SIZE = 20;
  let categories = [];

  const STATUS = {
    aktif: "Aktif", beklemede: "Beklemede",
    tamamlandi: "Tamamlandı", iptal: "İptal",
  };

  function buildQuery() {
    const province = document.getElementById("filter-province").value;
    const status = document.getElementById("filter-status").value;
    const search = document.getElementById("filter-search").value.trim();
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    params.set("page", page);
    return params.toString();
  }

  async function ensureCategories() {
    if (categories.length) return categories;
    try { categories = await API.get("/projects/categories"); } catch { categories = []; }
    return categories;
  }

  async function load(opts = {}) {
    if (opts.province !== undefined) {
      document.getElementById("filter-province").value = opts.province;
    }
    if (opts.resetPage) page = 1;

    try {
      const data = await API.get(`/projects/?${buildQuery()}`);
      const items = data.items || data;
      totalCount = data.count != null ? data.count : items.length;
      renderCards(items, document.getElementById("projects-list"));
      renderPager();
    } catch (err) {
      document.getElementById("projects-list").innerHTML =
        `<p class="muted" style="padding:24px">Projeler yüklenemedi: ${UI.esc(err.message)}</p>`;
    }
  }

  function renderCards(items, container) {
    if (!items.length) {
      container.innerHTML = `<p class="muted">Kayıt bulunamadı.</p>`;
      return;
    }
    container.innerHTML = items.map(cardHtml).join("");
    container.querySelectorAll("[data-pid]").forEach((el) => {
      el.addEventListener("click", () => openDetail(+el.dataset.pid));
    });
  }

  function cardHtml(p) {
    const color = MapColors.status(p.status);
    const delay = p.is_delayed
      ? `<span class="delay-flag">⚠️ Gecikmede${p.delay_days ? " · " + p.delay_days + " gün" : ""}</span>`
      : "";
    return `
      <div class="project-card" data-pid="${p.id}">
        <div class="card-meta">
          <span class="badge" style="background:${color}">${UI.esc(p.status_display)}</span>
          <span class="pill">📍 ${UI.esc(p.province)}</span>
          ${p.category ? `<span class="pill" style="background:${p.category.color}22;color:${p.category.color}">${UI.esc(p.category.name)}</span>` : ""}
        </div>
        <h4>${UI.esc(p.name)}</h4>
        <div class="progress"><span style="width:${p.progress}%;background:${color}"></span></div>
        <div class="card-meta">
          <span>%${p.progress} ilerleme</span>
          <span>📋 ${p.task_count} görev</span>
          ${delay}
        </div>
      </div>`;
  }

  function renderPager() {
    const pager = document.getElementById("projects-pager");
    const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    if (pages <= 1) { pager.innerHTML = ""; return; }
    pager.innerHTML = `
      <button class="btn btn-sm" ${page <= 1 ? "disabled" : ""} id="prev-page">‹ Önceki</button>
      <span>Sayfa ${page} / ${pages}</span>
      <button class="btn btn-sm" ${page >= pages ? "disabled" : ""} id="next-page">Sonraki ›</button>`;
    const prev = document.getElementById("prev-page");
    const next = document.getElementById("next-page");
    if (prev) prev.onclick = () => { page--; load(); };
    if (next) next.onclick = () => { page++; load(); };
  }

  // ---------------- Detay ----------------
  async function openDetail(id) {
    const p = await API.get(`/projects/${id}`);
    const color = MapColors.status(p.status);
    const editor = Auth.isEditor();
    const admin = Auth.isAdmin();

    UI.openModal(`
      <h3>${UI.esc(p.name)}</h3>
      <div class="card-meta">
        <span class="badge" style="background:${color}">${UI.esc(p.status_display)}</span>
        <span class="pill">📍 ${UI.esc(p.province)}</span>
        <span class="pill">%${p.progress}</span>
        ${p.is_delayed ? `<span class="delay-flag">⚠️ Gecikmede</span>` : ""}
      </div>
      <p class="muted" style="margin-top:10px">${UI.esc(p.description) || "Açıklama yok."}</p>
      <div class="card-meta" style="margin-top:8px">
        <span>📅 Planlanan: ${UI.fmtDate(p.planned_start)} → ${UI.fmtDate(p.planned_end)}</span>
        <span>✅ Gerçek: ${UI.fmtDate(p.actual_start)} → ${UI.fmtDate(p.actual_end)}</span>
      </div>
      <div class="modal-actions">
        ${editor ? `<button class="btn" id="edit-project">✏️ Düzenle</button>` : ""}
        ${admin ? `<button class="btn btn-danger" id="delete-project">🗑️ Sil</button>` : ""}
      </div>

      <div class="detail-section"><h4>📋 Görevler</h4><div id="tasks-box">Yükleniyor…</div></div>
      <div class="detail-section"><h4>💰 Bütçe</h4><div id="budget-box">Yükleniyor…</div></div>
      <div class="detail-section"><h4>📎 Dökümanlar</h4><div id="docs-box">Yükleniyor…</div></div>
      <div class="detail-section"><h4>🖼️ Görseller</h4><div id="images-box">Yükleniyor…</div></div>
      <div class="detail-section"><h4>🔑 İzinler</h4><div id="permits-box">Yükleniyor…</div></div>
    `);

    if (editor) document.getElementById("edit-project").onclick = () => openForm(p);
    if (admin) document.getElementById("delete-project").onclick = async () => {
      if (!confirm("Bu proje ve tüm verileri silinecek. Emin misiniz?")) return;
      await API.del(`/projects/${p.id}`);
      UI.toast("Proje silindi", "success");
      UI.closeModal();
      load();
      App.refreshMapAndStats();
    };

    Tasks.render(p.id, document.getElementById("tasks-box"), p.member_list || []);
    Budget.render(p.id, document.getElementById("budget-box"));
    Documents.render(p.id, document.getElementById("docs-box"));
    Images.render(p.id, document.getElementById("images-box"));
    Permits.render(p.id, document.getElementById("permits-box"));
  }

  // ---------------- Form ----------------
  async function openForm(project = null) {
    await ensureCategories();
    const isEdit = !!project;
    const provinceOpts = window.PROVINCES.map(
      (pr) => `<option value="${pr}" ${project && project.province === pr ? "selected" : ""}>${pr}</option>`
    ).join("");
    const catOpts = `<option value="">— Kategori yok —</option>` + categories.map(
      (c) => `<option value="${c.id}" ${project && project.category && project.category.id === c.id ? "selected" : ""}>${UI.esc(c.name)}</option>`
    ).join("");
    const v = (k, d = "") => (project && project[k] != null ? project[k] : d);

    UI.openModal(`
      <h3>${isEdit ? "Projeyi Düzenle" : "Yeni Proje"}</h3>
      <form id="project-form">
        <div class="form-row"><label>Proje Adı</label><input name="name" required value="${UI.esc(v("name"))}" /></div>
        <div class="form-row"><label>Açıklama</label><textarea name="description">${UI.esc(v("description"))}</textarea></div>
        <div class="form-grid">
          <div class="form-row"><label>İl</label><select name="province" required>${provinceOpts}</select></div>
          <div class="form-row"><label>Kategori</label><select name="category_id">${catOpts}</select></div>
          <div class="form-row"><label>Durum</label>
            <select name="status">
              ${Object.entries(STATUS).map(([k, lbl]) => `<option value="${k}" ${v("status", "aktif") === k ? "selected" : ""}>${lbl}</option>`).join("")}
            </select>
          </div>
          <div class="form-row"><label>İlerleme (%)</label><input type="number" name="progress" min="0" max="100" value="${v("progress", 0)}" /></div>
          <div class="form-row"><label>Planlanan Başlangıç</label><input type="date" name="planned_start" value="${v("planned_start") || ""}" /></div>
          <div class="form-row"><label>Planlanan Bitiş</label><input type="date" name="planned_end" value="${v("planned_end") || ""}" /></div>
          <div class="form-row"><label>Gerçek Başlangıç</label><input type="date" name="actual_start" value="${v("actual_start") || ""}" /></div>
          <div class="form-row"><label>Gerçek Bitiş</label><input type="date" name="actual_end" value="${v("actual_end") || ""}" /></div>
        </div>
        <div class="form-error" id="pf-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="pf-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Oluştur"}</button>
        </div>
      </form>
    `);

    document.getElementById("pf-cancel").onclick = () => UI.closeModal();
    document.getElementById("project-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        name: fd.get("name"),
        description: fd.get("description"),
        province: fd.get("province"),
        status: fd.get("status"),
        progress: parseInt(fd.get("progress") || "0", 10),
        category_id: fd.get("category_id") ? +fd.get("category_id") : null,
        planned_start: fd.get("planned_start") || null,
        planned_end: fd.get("planned_end") || null,
        actual_start: fd.get("actual_start") || null,
        actual_end: fd.get("actual_end") || null,
      };
      try {
        if (isEdit) await API.patch(`/projects/${project.id}`, body);
        else await API.post("/projects/", body);
        UI.toast(isEdit ? "Proje güncellendi" : "Proje oluşturuldu", "success");
        UI.closeModal();
        load();
        App.refreshMapAndStats();
      } catch (err) {
        document.getElementById("pf-error").textContent = err.message;
      }
    };
  }

  function populateProvinceFilter() {
    const sel = document.getElementById("filter-province");
    sel.innerHTML = `<option value="">Tüm iller</option>` +
      window.PROVINCES.map((p) => `<option value="${p}">${p}</option>`).join("");
  }

  return { load, openDetail, openForm, populateProvinceFilter };
})();


// ===================== GÖREVLER =====================
const Tasks = (() => {
  const PRIO = { low: "Düşük", medium: "Orta", high: "Yüksek" };
  const PRIO_COLOR = { low: "#95a5a6", medium: "#f39c12", high: "#e74c3c" };

  async function render(projectId, box, members = []) {
    const tasks = await API.get(`/projects/${projectId}/tasks`);
    const editor = Auth.isEditor();
    const memberOpts = `<option value="">— Atanmamış —</option>` +
      members.map((m) => `<option value="${m.id}">${UI.esc(m.username)}</option>`).join("");
    const parentOpts = `<option value="">— Üst Görev Yok —</option>` +
      tasks.map((t) => `<option value="${t.id}">${t.wbs_code ? "[" + UI.esc(t.wbs_code) + "] " : ""}${UI.esc(t.title)}</option>`).join("");
    box.innerHTML = `
      <div id="task-rows">${tasks.map((t) => rowHtml(t, editor)).join("") || `<p class="muted">Henüz görev yok.</p>`}</div>
      ${editor ? `
      <form id="task-form" style="margin-top:10px;display:grid;grid-template-columns:auto 1fr auto auto auto auto auto;gap:6px;align-items:center">
        <input name="wbs_code" placeholder="WBS (örn: 1.2)" style="width:80px" />
        <input name="title" placeholder="Yeni görev başlığı" required />
        <select name="parent_id">${parentOpts}</select>
        <select name="assignee_id">${memberOpts}</select>
        <select name="priority">
          <option value="low">Düşük</option><option value="medium" selected>Orta</option><option value="high">Yüksek</option>
        </select>
        <input type="date" name="due_date" style="width:auto" />
        <input type="date" name="planned_start" placeholder="Plan Başl." style="width:auto" />
        <input type="date" name="planned_end" placeholder="Plan Bitiş" style="width:auto" />
        <button class="btn btn-primary btn-sm" type="submit">+ Ekle</button>
      </form>` : ""}
    `;

    if (editor) {
      box.querySelector("#task-form").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await API.post(`/projects/${projectId}/tasks`, {
          title: fd.get("title"),
          wbs_code: fd.get("wbs_code") || "",
          parent_id: fd.get("parent_id") ? +fd.get("parent_id") : null,
          assignee_id: fd.get("assignee_id") ? +fd.get("assignee_id") : null,
          priority: fd.get("priority"),
          due_date: fd.get("due_date") || null,
          planned_start: fd.get("planned_start") || null,
          planned_end: fd.get("planned_end") || null,
        });
        render(projectId, box, members);
      };
      box.querySelectorAll("[data-toggle]").forEach((el) => {
        el.onchange = async () => {
          await API.patch(`/projects/${projectId}/tasks/${el.dataset.toggle}`, { is_done: el.checked });
          render(projectId, box, members);
        };
      });
      box.querySelectorAll("[data-del-task]").forEach((el) => {
        el.onclick = async () => {
          await API.del(`/projects/${projectId}/tasks/${el.dataset.delTask}`);
          render(projectId, box, members);
        };
      });
      box.querySelectorAll("[data-progress-task]").forEach((el) => {
        el.addEventListener("click", async () => {
          const taskId = el.dataset.progressTask;
          const row = el.closest("[data-task-id]");
          const currentPct = row ? (row.querySelector(".muted")?.textContent?.replace("%", "") || "0") : "0";
          const val = prompt("Yeni ilerleme (0-100):", currentPct);
          if (val === null) return;
          const n = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
          await API.patch(`/projects/${projectId}/tasks/${taskId}/progress?progress=${n}`, {});
          render(projectId, box, members);
        });
      });
    }
  }

  function rowHtml(t, editor) {
    const progressColor = t.is_done ? "#27ae60" : "#4f6ef7";
    const indent = t.parent_id ? "margin-left:20px;border-left:2px solid var(--border);padding-left:8px;" : "";
    return `
      <div class="row-item${t.is_overdue && !t.is_done ? " task-overdue" : ""}" data-task-id="${t.id}" style="${indent}">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${editor ? `<input type="checkbox" data-toggle="${t.id}" ${t.is_done ? "checked" : ""} />` : ""}
          ${t.wbs_code ? `<span class="pill" style="font-family:monospace;font-size:11px;background:#4f6ef722;color:#4f6ef7">${UI.esc(t.wbs_code)}</span>` : ""}
          <span style="${t.is_done ? "text-decoration:line-through;color:#95a5a6" : ""}">${UI.esc(t.title)}</span>
          <span class="pill" style="background:${PRIO_COLOR[t.priority]}22;color:${PRIO_COLOR[t.priority]}">${PRIO[t.priority]}</span>
          <span class="muted" style="font-size:11px">%${t.progress || 0}</span>
          ${t.is_overdue && !t.is_done ? `<span class="pill" style="background:#e74c3c22;color:#e74c3c">⏰ Gecikmiş</span>` : ""}
          ${t.assignee_username ? `<span class="pill">👤 ${UI.esc(t.assignee_username)}</span>` : ""}
          ${t.due_date ? `<span class="muted" style="font-size:12px">📅 ${UI.fmtDate(t.due_date)}</span>` : ""}
        </div>
        <div class="task-progress-bar"><span style="width:${t.progress || 0}%;background:${progressColor}"></span></div>
        ${editor ? `
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-sm btn-ghost" data-progress-task="${t.id}" title="İlerleme güncelle">📊</button>
          <button class="btn btn-sm btn-ghost" data-del-task="${t.id}">✕</button>
        </div>` : ""}
      </div>`;
  }

  return { render };
})();


// ===================== İZİNLER =====================
const Permits = (() => {
  const PERMIT_STATUS_COLOR = { valid: "#27ae60", expired: "#e74c3c", pending: "#f39c12", cancelled: "#95a5a6" };
  const PERMIT_STATUS_LABEL = { valid: "Geçerli", expired: "Süresi Dolmuş", pending: "Bekliyor", cancelled: "İptal" };

  async function render(projectId, box) {
    let permits = [];
    try { permits = await API.get(`/documents/permits/?project_id=${projectId}`); } catch (e) {
      box.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`; return;
    }
    const editor = Auth.isEditor();
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    box.innerHTML = `
      ${!permits.length ? `<p class="muted">İzin/ruhsat kaydı yok.</p>` : `
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
        ${permits.map(pm => {
          const expiry = pm.expiry_date ? new Date(pm.expiry_date) : null;
          const isExpired = expiry && expiry < today;
          const isExpiringSoon = expiry && !isExpired && expiry < thirtyDays;
          const rowStyle = isExpired
            ? "background:#e74c3c11;border-left:3px solid #e74c3c;"
            : isExpiringSoon
            ? "background:#f39c1211;border-left:3px solid #f39c12;"
            : "";
          return `<div class="row-item" style="${rowStyle}">
            <div>
              <strong>${UI.esc(pm.permit_type||pm.type||"İzin")}</strong>
              <span class="pill" style="margin-left:4px">${UI.esc(pm.permit_number||"—")}</span>
              ${pm.issuing_authority ? `<span class="muted" style="font-size:12px"> · ${UI.esc(pm.issuing_authority)}</span>` : ""}
              <div class="muted" style="font-size:12px;margin-top:2px">
                ${pm.start_date ? `Başlangıç: ${UI.fmtDate(pm.start_date)} · ` : ""}
                ${pm.expiry_date ? `Bitiş: ${UI.fmtDate(pm.expiry_date)}${isExpired?" (Süresi Dolmuş)":isExpiringSoon?" (30 gün içinde doluyor)":""}` : ""}
              </div>
            </div>
            <span class="badge" style="background:${PERMIT_STATUS_COLOR[pm.status]||'#95a5a6'}">${PERMIT_STATUS_LABEL[pm.status]||pm.status}</span>
          </div>`;
        }).join("")}
      </div>`}
      ${editor ? `<button class="btn btn-sm btn-primary" id="new-permit-btn-${projectId}">+ İzin / Ruhsat Ekle</button>` : ""}
    `;
    if (editor) {
      const btn = box.querySelector(`#new-permit-btn-${projectId}`);
      if (btn) btn.onclick = () => _openForm(projectId, box);
    }
  }

  function _openForm(projectId, box) {
    UI.openModal(`
      <h3>Yeni İzin / Ruhsat</h3>
      <form id="permit-form">
        <div class="form-row"><label>İzin Türü</label><input name="permit_type" placeholder="İnşaat Ruhsatı, Çevre İzni…" required /></div>
        <div class="form-row"><label>İzin No</label><input name="permit_number" /></div>
        <div class="form-row"><label>Veren Kurum</label><input name="issuing_authority" /></div>
        <div class="form-grid">
          <div class="form-row"><label>Başlangıç Tarihi</label><input type="date" name="start_date" /></div>
          <div class="form-row"><label>Bitiş Tarihi</label><input type="date" name="expiry_date" /></div>
        </div>
        <div class="form-row"><label>Durum</label>
          <select name="status">
            <option value="valid">Geçerli</option>
            <option value="pending">Bekliyor</option>
            <option value="expired">Süresi Dolmuş</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
        <div class="form-error" id="permit-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="permit-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("permit-cancel").onclick = () => UI.closeModal();
    document.getElementById("permit-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.post("/documents/permits/", {
          project_id: +projectId,
          permit_type: fd.get("permit_type"),
          permit_number: fd.get("permit_number") || "",
          issuing_authority: fd.get("issuing_authority") || "",
          start_date: fd.get("start_date") || null,
          expiry_date: fd.get("expiry_date") || null,
          status: fd.get("status"),
        });
        UI.toast("İzin kaydedildi", "success");
        UI.closeModal();
        render(projectId, box);
      } catch (err) { document.getElementById("permit-err").textContent = err.message; }
    };
  }

  return { render };
})();


// ===================== GÖRSELLER =====================
const Images = (() => {
  async function render(projectId, box) {
    const imgs = await API.get(`/projects/${projectId}/images`);
    const editor = Auth.isEditor();
    box.innerHTML = `
      <div class="gallery">${imgs.map((im) => `
        <div style="position:relative">
          <img src="${im.image}" alt="${UI.esc(im.caption)}" title="${UI.esc(im.caption)}" />
          ${editor ? `<button class="btn btn-sm btn-danger" style="position:absolute;top:3px;right:3px;padding:2px 6px" data-del-img="${im.id}">✕</button>` : ""}
        </div>`).join("") || `<p class="muted">Görsel yok.</p>`}</div>
      ${editor ? `<input type="file" id="img-upload-${projectId}" accept="image/*" style="margin-top:10px" />` : ""}
    `;
    if (editor) {
      const input = box.querySelector(`#img-upload-${projectId}`);
      input.onchange = async () => {
        if (!input.files.length) return;
        const fd = new FormData();
        fd.append("file", input.files[0]);
        try {
          await API.postForm(`/projects/${projectId}/images`, fd);
          UI.toast("Görsel yüklendi", "success");
          render(projectId, box);
        } catch (err) { UI.toast(err.message, "error"); }
      };
      box.querySelectorAll("[data-del-img]").forEach((el) => {
        el.onclick = async () => {
          await API.del(`/projects/${projectId}/images/${el.dataset.delImg}`);
          render(projectId, box);
        };
      });
    }
  }
  return { render };
})();

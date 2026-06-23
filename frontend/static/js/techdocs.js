const TechDocs = (() => {
  const CATEGORIES = {
    plc_scada: { label: "PLC/SCADA",        color: "#4f6ef7" },
    robot:     { label: "Robot Sistemleri",  color: "#e74c3c" },
    mes:       { label: "MES",               color: "#27ae60" },
    vizyon:    { label: "Vizyon Sistemi",    color: "#9b59b6" },
    elektrik:  { label: "Elektrik Altyapı", color: "#f39c12" },
    servo:     { label: "Servo/Hareket",     color: "#1abc9c" },
    genel:     { label: "Genel",             color: "#95a5a6" },
  };

  const EXT_ICON = {
    ".pdf": "📄", ".doc": "📝", ".docx": "📝",
    ".xls": "📊", ".xlsx": "📊",
    ".dwg": "📐", ".dxf": "📐",
    ".zip": "🗜️", ".rar": "🗜️",
    ".png": "🖼️", ".jpg": "🖼️", ".jpeg": "🖼️",
    ".mp4": "🎬", ".avi": "🎬",
  };

  let searchTimer;

  async function load() {
    const search   = document.getElementById("td-search").value.trim();
    const category = document.getElementById("td-category").value;
    const params   = new URLSearchParams();
    if (search)   params.set("search", search);
    if (category) params.set("category", category);

    const box = document.getElementById("techdocs-list");
    box.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    try {
      const items = await API.get(`/techdocs/?${params}`);
      renderList(items, box);
    } catch (e) {
      box.innerHTML = `<p class="muted">${UI.esc(e.message)}</p>`;
    }
  }

  function renderList(items, box) {
    if (!items.length) {
      box.innerHTML = `<p class="muted">Döküman bulunamadı.</p>`;
      return;
    }
    const editor = Auth.isEditor();
    box.innerHTML = items.map((d) => cardHtml(d, editor)).join("");
    if (editor) {
      box.querySelectorAll("[data-del-td]").forEach((el) =>
        el.onclick = async () => {
          if (!confirm("Bu dökümanı silmek istediğinize emin misiniz?")) return;
          try {
            await API.del(`/techdocs/${el.dataset.delTd}`);
            UI.toast("Döküman silindi", "success");
            load();
          } catch (e) { UI.toast(e.message, "error"); }
        }
      );
    }
  }

  function cardHtml(d, editor) {
    const cat   = CATEGORIES[d.category] || CATEGORIES.genel;
    const icon  = EXT_ICON[d.file_extension] || "📎";
    const size  = d.file_size_kb > 1024
      ? `${(d.file_size_kb / 1024).toFixed(1)} MB`
      : `${d.file_size_kb} KB`;
    return `
      <div class="td-card">
        <div class="td-icon">${icon}</div>
        <div class="td-body">
          <div class="td-title">
            <a href="${UI.esc(d.file)}" target="_blank" rel="noopener">${UI.esc(d.title)}</a>
          </div>
          ${d.description ? `<div class="td-desc muted">${UI.esc(d.description)}</div>` : ""}
          <div class="td-meta">
            <span class="badge" style="background:${cat.color}">${cat.label}</span>
            <span class="pill">${d.file_extension.toUpperCase().replace(".", "")}</span>
            <span class="muted">${size}</span>
            <span class="muted">👤 ${UI.esc(d.uploaded_by_username || "—")}</span>
            <span class="muted">${UI.fmtDate(d.uploaded_at)}</span>
          </div>
        </div>
        <div class="td-actions">
          <a href="${UI.esc(d.file)}" download class="btn btn-sm">⬇ İndir</a>
          ${editor ? `<button class="btn btn-sm btn-danger" data-del-td="${d.id}">🗑</button>` : ""}
        </div>
      </div>`;
  }

  function openUploadForm() {
    UI.openModal(`
      <h3>Teknik Döküman Yükle</h3>
      <form id="td-form" enctype="multipart/form-data">
        <div class="form-row"><label>Başlık</label><input name="title" placeholder="Otomatik dosya adından alınır" /></div>
        <div class="form-row"><label>Açıklama</label><textarea name="description" placeholder="Kısa açıklama…"></textarea></div>
        <div class="form-row"><label>Kategori</label>
          <select name="category">
            ${Object.entries(CATEGORIES).map(([k, v]) =>
              `<option value="${k}">${v.label}</option>`
            ).join("")}
          </select>
        </div>
        <div class="form-row"><label>Dosya</label>
          <div class="dropzone" id="td-dropzone">
            <span id="td-drop-label">Dosyayı sürükleyin veya tıklayın</span>
            <input type="file" name="file" id="td-file" style="display:none" required />
          </div>
        </div>
        <div class="form-error" id="td-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="td-cancel">İptal</button>
          <button type="submit" class="btn btn-primary" id="td-submit">Yükle</button>
        </div>
      </form>
    `);

    const dropzone = document.getElementById("td-dropzone");
    const fileInput = document.getElementById("td-file");

    dropzone.onclick = () => fileInput.click();
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add("dragover"); };
    dropzone.ondragleave = () => dropzone.classList.remove("dragover");
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        document.getElementById("td-drop-label").textContent = e.dataTransfer.files[0].name;
      }
    };
    fileInput.onchange = () => {
      if (fileInput.files.length)
        document.getElementById("td-drop-label").textContent = fileInput.files[0].name;
    };

    document.getElementById("td-cancel").onclick = () => UI.closeModal();
    document.getElementById("td-form").onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("td-submit");
      btn.disabled = true;
      btn.textContent = "Yükleniyor…";
      const fd = new FormData(e.target);
      try {
        await API.postForm("/techdocs/", fd);
        UI.toast("Döküman yüklendi", "success");
        UI.closeModal();
        load();
      } catch (err) {
        document.getElementById("td-error").textContent = err.message;
        btn.disabled = false;
        btn.textContent = "Yükle";
      }
    };
  }

  function bindEvents() {
    document.getElementById("td-upload-btn").onclick = () => openUploadForm();
    document.getElementById("td-category").onchange = () => load();
    document.getElementById("td-search").addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(load, 300);
    });
  }

  return { load, bindEvents };
})();

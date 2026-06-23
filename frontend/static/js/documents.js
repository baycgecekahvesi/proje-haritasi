// Döküman listesi + drag & drop yükleme + silme.
const Documents = (() => {
  const TYPES = {
    contract: "Sözleşme", report: "Rapor", drawing: "Çizim/Plan",
    photo: "Fotoğraf", other: "Diğer",
  };
  const ICONS = {
    ".pdf": "📕", ".doc": "📘", ".docx": "📘", ".xls": "📗", ".xlsx": "📗",
    ".png": "🖼️", ".jpg": "🖼️", ".jpeg": "🖼️", ".gif": "🖼️",
    ".zip": "🗜️", ".rar": "🗜️", ".dwg": "📐", ".dxf": "📐",
  };

  function icon(ext) { return ICONS[ext] || "📄"; }

  async function render(projectId, box) {
    const docs = await API.get(`/documents/${projectId}`);
    const editor = Auth.isEditor();

    box.innerHTML = `
      <div id="doc-rows">${docs.map((d) => rowHtml(d, editor)).join("") || `<p class="muted">Döküman yok.</p>`}</div>
      ${editor ? `
        <div class="dropzone" id="dropzone-${projectId}">
          📎 Dosyaları buraya sürükleyin ya da <u>seçmek için tıklayın</u>
          <input type="file" id="doc-input-${projectId}" hidden />
        </div>` : ""}
    `;

    if (editor) {
      const dz = box.querySelector(`#dropzone-${projectId}`);
      const input = box.querySelector(`#doc-input-${projectId}`);
      dz.onclick = () => input.click();
      input.onchange = () => input.files.length && upload(projectId, input.files[0], box);
      dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragover"); });
      dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
      dz.addEventListener("drop", (e) => {
        e.preventDefault();
        dz.classList.remove("dragover");
        if (e.dataTransfer.files.length) upload(projectId, e.dataTransfer.files[0], box);
      });

      box.querySelectorAll("[data-del-doc]").forEach((el) => {
        el.onclick = async () => {
          await API.del(`/documents/file/${el.dataset.delDoc}`);
          render(projectId, box);
        };
      });
    }
  }

  async function upload(projectId, file, box) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name);
    fd.append("doc_type", guessType(file.name));
    try {
      await API.postForm(`/documents/${projectId}`, fd);
      UI.toast("Dosya yüklendi", "success");
      render(projectId, box);
    } catch (err) { UI.toast(err.message, "error"); }
  }

  function guessType(name) {
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) return "photo";
    if ([".dwg", ".dxf"].includes(ext)) return "drawing";
    if (ext === ".pdf") return "report";
    return "other";
  }

  function rowHtml(d, editor) {
    return `
      <div class="row-item">
        <a href="${d.file}" target="_blank" rel="noopener" style="display:flex;gap:8px;align-items:center;text-decoration:none;color:inherit">
          <span style="font-size:20px">${icon(d.file_extension)}</span>
          <div>
            <strong>${UI.esc(d.title)}</strong>
            <div class="muted" style="font-size:12px">${TYPES[d.doc_type] || d.doc_type} · ${d.file_size_kb} KB</div>
          </div>
        </a>
        ${editor ? `<button class="btn btn-sm btn-ghost" data-del-doc="${d.id}">✕</button>` : ""}
      </div>`;
  }

  return { render };
})();

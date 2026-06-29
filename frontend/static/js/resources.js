// ===================== KAYNAKLAR =====================
const Resources = (() => {
  const TYPE_LABEL = { PERSONNEL: "Personel", EQUIPMENT: "Ekipman", MATERIAL: "Malzeme" };
  const TYPE_COLOR = { PERSONNEL: "#4f6ef7", EQUIPMENT: "#f39c12", MATERIAL: "#27ae60" };

  async function load() {
    const panel = document.getElementById("panel-resources");
    if (!panel) return;
    panel.innerHTML = `
      <div class="section-header">
        <h2>Kaynak Yönetimi</h2>
        ${Auth.isEditor() ? `<button class="btn btn-primary btn-sm" id="new-resource-btn">+ Yeni Kaynak</button>` : ""}
      </div>
      <div id="resources-list" class="project-grid">Yükleniyor…</div>
      <h3 style="margin:20px 0 8px">Kaynak Yük Özeti</h3>
      <div id="resource-workload">Yükleniyor…</div>
    `;
    if (Auth.isEditor()) {
      document.getElementById("new-resource-btn").onclick = () => openForm();
    }
    await renderList();
    await renderWorkload();
  }

  async function renderList() {
    const box = document.getElementById("resources-list");
    if (!box) return;
    const items = await API.get("/resources/");
    if (!items.length) { box.innerHTML = `<p class="muted">Henüz kaynak yok.</p>`; return; }
    box.innerHTML = items.map(r => `
      <div class="project-card">
        <div class="card-meta">
          <span class="badge" style="background:${TYPE_COLOR[r.resource_type] || "#95a5a6"}">${TYPE_LABEL[r.resource_type] || UI.esc(r.resource_type)}</span>
          ${r.is_active ? "" : `<span class="pill">Pasif</span>`}
        </div>
        <h4>${UI.esc(r.name)}</h4>
        <div class="muted">${UI.esc(r.unit)} · ${UI.fmtMoney(r.cost_per_unit)} TL/birim</div>
        <div class="muted">Günlük kapasite: ${r.capacity_per_day} ${UI.esc(r.unit)}</div>
        ${r.notes ? `<div class="muted" style="font-size:11px;margin-top:4px">${UI.esc(r.notes)}</div>` : ""}
        ${Auth.isEditor() ? `
        <div class="modal-actions" style="margin-top:8px;justify-content:flex-start">
          <button class="btn btn-sm" data-edit-res="${r.id}">Düzenle</button>
          ${Auth.isAdmin() ? `<button class="btn btn-sm btn-danger" data-del-res="${r.id}">Sil</button>` : ""}
        </div>` : ""}
      </div>
    `).join("");
    box.querySelectorAll("[data-edit-res]").forEach(el => el.onclick = async () => {
      const item = items.find(r => r.id === +el.dataset.editRes);
      if (item) openForm(item);
    });
    box.querySelectorAll("[data-del-res]").forEach(el => el.onclick = async () => {
      if (!confirm("Bu kaynağı silmek istiyor musunuz?")) return;
      await API.del(`/resources/${el.dataset.delRes}`);
      UI.toast("Kaynak silindi", "success");
      renderList();
    });
  }

  async function renderWorkload() {
    const box = document.getElementById("resource-workload");
    if (!box) return;
    try {
      const rows = await API.get("/resources/workload/summary");
      if (!rows.length) { box.innerHTML = `<p class="muted">Henüz kaynak ataması yok.</p>`; return; }
      box.innerHTML = `<table class="data-table">
        <thead><tr><th>Kaynak</th><th>Tür</th><th>Planlanan</th><th>Gerçekleşen</th><th>Birim</th></tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td>${UI.esc(r.resource_name)}</td>
            <td><span class="badge" style="background:${TYPE_COLOR[r.resource_type] || "#95a5a6"}">${TYPE_LABEL[r.resource_type] || UI.esc(r.resource_type)}</span></td>
            <td>${r.total_planned}</td>
            <td>${r.total_actual}</td>
            <td>${UI.esc(r.unit)}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;
    } catch (_) { box.innerHTML = `<p class="muted">Yük verisi alınamadı.</p>`; }
  }

  function openForm(res = null) {
    const isEdit = !!res;
    const v = (k, d = "") => res ? (res[k] != null ? res[k] : d) : d;
    UI.openModal(`
      <h3>${isEdit ? "Kaynağı Düzenle" : "Yeni Kaynak"}</h3>
      <form id="res-form">
        <div class="form-grid">
          <div class="form-row"><label>Adı</label><input name="name" required value="${UI.esc(v("name"))}" /></div>
          <div class="form-row"><label>Tür</label>
            <select name="resource_type">
              <option value="PERSONNEL" ${v("resource_type") === "PERSONNEL" ? "selected" : ""}>Personel</option>
              <option value="EQUIPMENT" ${v("resource_type") === "EQUIPMENT" ? "selected" : ""}>Ekipman</option>
              <option value="MATERIAL"  ${v("resource_type") === "MATERIAL"  ? "selected" : ""}>Malzeme</option>
            </select>
          </div>
          <div class="form-row"><label>Birim</label><input name="unit" value="${UI.esc(v("unit", "adet"))}" /></div>
          <div class="form-row"><label>Günlük Kapasite</label><input type="number" step="0.01" name="capacity_per_day" value="${v("capacity_per_day", "8")}" /></div>
          <div class="form-row"><label>Birim Maliyet (TL)</label><input type="number" step="0.01" name="cost_per_unit" value="${v("cost_per_unit", "0")}" /></div>
          <div class="form-row"><label>Durum</label>
            <select name="is_active">
              <option value="true"  ${v("is_active", true)  ? "selected" : ""}>Aktif</option>
              <option value="false" ${!v("is_active", true) ? "selected" : ""}>Pasif</option>
            </select>
          </div>
        </div>
        <div class="form-row"><label>Notlar</label><textarea name="notes">${UI.esc(v("notes"))}</textarea></div>
        <div class="form-error" id="res-error"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="res-cancel">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Oluştur"}</button>
        </div>
      </form>
    `);
    document.getElementById("res-cancel").onclick = () => UI.closeModal();
    document.getElementById("res-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        name:              fd.get("name"),
        resource_type:     fd.get("resource_type"),
        unit:              fd.get("unit"),
        capacity_per_day:  parseFloat(fd.get("capacity_per_day") || "8"),
        cost_per_unit:     parseFloat(fd.get("cost_per_unit") || "0"),
        is_active:         fd.get("is_active") === "true",
        notes:             fd.get("notes") || "",
      };
      try {
        if (isEdit) await API.patch(`/resources/${res.id}`, body);
        else        await API.post("/resources/", body);
        UI.toast(isEdit ? "Kaynak güncellendi" : "Kaynak oluşturuldu", "success");
        UI.closeModal();
        renderList();
        renderWorkload();
      } catch (err) {
        document.getElementById("res-error").textContent = err.message;
      }
    };
  }

  return { load };
})();

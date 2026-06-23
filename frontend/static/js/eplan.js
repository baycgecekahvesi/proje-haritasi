// ===================== E-PLAN DÖKÜMAN YÖNETİMİ =====================
const Eplan = (() => {

  const TIP_LABELS = {
    sema:          "Elektrik Şeması",
    panel_layout:  "Panel Layout",
    kablo_listesi: "Kablo Listesi",
    bom:           "BOM (Malzeme Listesi)",
    as_built:      "As-Built Şema",
    diger:         "Diğer",
  };

  const ONAY_META = {
    taslak:           { label: "Taslak",              renk: "#94a3b8" },
    ic_kontrol:       { label: "İç Kontrol",           renk: "#f59e0b" },
    musteri_inceleme: { label: "Müşteri İncelemesinde", renk: "#3b82f6" },
    onaylandi:        { label: "Onaylandı",            renk: "#10b981" },
    as_built:         { label: "As-Built",             renk: "#6366f1" },
    iptal:            { label: "İptal",                renk: "#ef4444" },
  };

  const TIP_IKONS = {
    sema: "⚡", panel_layout: "🗂️", kablo_listesi: "🔌",
    bom: "📦", as_built: "📐", diger: "📄",
  };

  let tümDokumanlar = [];

  async function load() {
    const panel = document.getElementById("panel-eplan");
    if (!panel) return;
    panel.innerHTML = `<div class="ep-layout">
      <div class="ep-header">
        <div>
          <h2 class="ep-title">📐 E-Plan Döküman Yönetimi</h2>
          <p class="ep-sub">Elektrik şemaları, panel layout, kablo listesi ve BOM — revizyon takibi ile.</p>
        </div>
        ${Auth.isEditor() ? `<button class="btn btn-primary" id="ep-yeni-btn">+ Yeni Döküman</button>` : ""}
      </div>
      <div class="ep-filtreler">
        <input type="search" id="ep-search" placeholder="Seri no veya başlık ara…" class="ep-fil-input" />
        <select id="ep-fil-tip" class="ep-fil-sel">
          <option value="">Tüm tipler</option>
          ${Object.entries(TIP_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
        </select>
        <select id="ep-fil-durum" class="ep-fil-sel">
          <option value="">Tüm durumlar</option>
          ${Object.entries(ONAY_META).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("")}
        </select>
      </div>
      <div id="ep-liste"></div>
    </div>`;

    if (Auth.isEditor()) {
      document.getElementById("ep-yeni-btn").onclick = () => openForm();
    }

    document.getElementById("ep-search").oninput = _render;
    document.getElementById("ep-fil-tip").onchange = _render;
    document.getElementById("ep-fil-durum").onchange = _render;

    await _fetch();
  }

  async function _fetch() {
    try {
      tümDokumanlar = await API.get("/eplan");
    } catch {
      tümDokumanlar = [];
    }
    _render();
  }

  function _filtrele() {
    const q = (document.getElementById("ep-search")?.value || "").toLowerCase();
    const tip = document.getElementById("ep-fil-tip")?.value || "";
    const durum = document.getElementById("ep-fil-durum")?.value || "";
    return tümDokumanlar.filter(d => {
      if (q && !d.seri_no.toLowerCase().includes(q) && !d.baslik.toLowerCase().includes(q)) return false;
      if (tip && d.dokuman_tipi !== tip) return false;
      if (durum && d.onay_durumu !== durum) return false;
      return true;
    });
  }

  function _grupla(liste) {
    const gruplar = {};
    for (const d of liste) {
      if (!gruplar[d.seri_no]) gruplar[d.seri_no] = [];
      gruplar[d.seri_no].push(d);
    }
    return gruplar;
  }

  function _render() {
    const liste = document.getElementById("ep-liste");
    if (!liste) return;
    const filtreli = _filtrele();
    if (!filtreli.length) {
      liste.innerHTML = `<p class="muted" style="padding:24px;text-align:center">Döküman bulunamadı.</p>`;
      return;
    }
    const gruplar = _grupla(filtreli);
    liste.innerHTML = Object.entries(gruplar).map(([seri, docs]) => _grupHtml(seri, docs)).join("");

    liste.querySelectorAll("[data-ep-id]").forEach(el => {
      el.addEventListener("click", () => openDetail(+el.dataset.epId));
    });
    if (Auth.isEditor()) {
      liste.querySelectorAll("[data-ep-durum-id]").forEach(el => {
        el.addEventListener("change", async () => {
          await API.patch(`/eplan/${el.dataset.epDurumId}`, { onay_durumu: el.value });
          UI.toast("Durum güncellendi", "success");
          await _fetch();
        });
      });
    }
  }

  function _grupHtml(seri, docs) {
    const son = docs[0];
    const m = ONAY_META[son.onay_durumu] || ONAY_META.taslak;
    const ikon = TIP_IKONS[son.dokuman_tipi] || "📄";
    return `
      <div class="ep-grup">
        <div class="ep-grup-head">
          <div class="ep-seri-wrap">
            <span class="ep-seri-no">${UI.esc(seri)}</span>
            <span class="ep-revs">${docs.length} revizyon</span>
          </div>
          <div class="ep-grup-baslik">${ikon} ${UI.esc(son.baslik)}</div>
          <span class="ep-badge" style="background:${m.renk}22;color:${m.renk}">${m.label}</span>
          ${son.proje_adi ? `<span class="ep-proje-pill">📋 ${UI.esc(son.proje_adi)}</span>` : ""}
        </div>
        <div class="ep-rev-list">
          ${docs.map(d => _revHtml(d)).join("")}
        </div>
      </div>`;
  }

  function _revHtml(d) {
    const m = ONAY_META[d.onay_durumu] || ONAY_META.taslak;
    const editor = Auth.isEditor();
    const durumSelect = editor ? `
      <select class="ep-durum-sel" data-ep-durum-id="${d.id}" style="accent-color:${m.renk}">
        ${Object.entries(ONAY_META).map(([k, v]) => `<option value="${k}" ${d.onay_durumu === k ? "selected" : ""}>${v.label}</option>`).join("")}
      </select>` :
      `<span class="ep-badge" style="background:${m.renk}22;color:${m.renk};font-size:11px">${m.label}</span>`;

    return `
      <div class="ep-rev-row" data-ep-id="${d.id}">
        <span class="ep-rev-no" style="color:${m.renk}">${UI.esc(d.revizyon_no)}</span>
        <span class="ep-tip-pill">${TIP_LABELS[d.dokuman_tipi] || d.dokuman_tipi}</span>
        <span class="ep-rev-meta">👤 ${UI.esc(d.yukleyen_username || "—")}</span>
        <span class="ep-rev-meta">📅 ${UI.fmtDate(d.yukleme_tarihi)}</span>
        ${durumSelect}
        ${d.dosya_url ? `<a href="${d.dosya_url}" target="_blank" class="btn btn-sm ep-dl-btn" title="İndir">⬇ ${d.dosya_uzanti.replace(".", "").toUpperCase()}</a>` : `<span class="ep-no-file">Dosya yok</span>`}
        <button class="btn btn-ghost btn-sm" data-ep-id="${d.id}">🔍</button>
      </div>`;
  }

  function openDetail(id) {
    const d = tümDokumanlar.find(x => x.id === id);
    if (!d) return;
    const m = ONAY_META[d.onay_durumu] || ONAY_META.taslak;
    const editor = Auth.isEditor();
    const isAdmin = Auth.isAdmin();
    UI.openModal(`
      <h3>${UI.esc(d.seri_no)} — ${UI.esc(d.baslik)}</h3>
      <div class="ep-detail-meta">
        <span class="ep-badge" style="background:${m.renk}22;color:${m.renk}">${m.label}</span>
        <span class="ep-tip-pill">${TIP_IKONS[d.dokuman_tipi]} ${TIP_LABELS[d.dokuman_tipi] || d.dokuman_tipi}</span>
        <span class="pill">${UI.esc(d.revizyon_no)}</span>
        ${d.proje_adi ? `<span class="pill">📋 ${UI.esc(d.proje_adi)}</span>` : ""}
      </div>
      ${d.aciklama ? `<p style="margin:12px 0;color:var(--text)">${UI.esc(d.aciklama)}</p>` : ""}
      <div class="ep-detail-grid">
        <div><span class="muted">Yükleyen</span><strong>${UI.esc(d.yukleyen_username || "—")}</strong></div>
        <div><span class="muted">Yükleme Tarihi</span><strong>${UI.fmtDate(d.yukleme_tarihi)}</strong></div>
        <div><span class="muted">Onaylayan</span><strong>${UI.esc(d.onaylayan_username || "—")}</strong></div>
        <div><span class="muted">Onay Tarihi</span><strong>${UI.fmtDate(d.onay_tarihi) || "—"}</strong></div>
      </div>
      ${d.notlar ? `<div class="ep-notlar"><strong>Notlar:</strong><p>${UI.esc(d.notlar)}</p></div>` : ""}
      <div class="modal-actions">
        ${d.dosya_url ? `<a href="${d.dosya_url}" target="_blank" class="btn btn-primary">⬇ Dosyayı İndir (${d.dosya_uzanti} · ${d.dosya_kb} KB)</a>` : ""}
        ${editor ? `<button class="btn" id="ep-yeni-rev-btn">📄 Yeni Revizyon Ekle</button>` : ""}
        ${isAdmin ? `<button class="btn btn-danger" id="ep-sil-btn">🗑️ Sil</button>` : ""}
      </div>
    `);
    if (editor) {
      document.getElementById("ep-yeni-rev-btn").onclick = () => {
        UI.closeModal();
        openForm(d);
      };
    }
    if (isAdmin) {
      document.getElementById("ep-sil-btn").onclick = async () => {
        if (!confirm("Bu döküman silinecek. Emin misiniz?")) return;
        try {
          await API.del(`/eplan/${d.id}`);
          UI.toast("Döküman silindi", "success");
          UI.closeModal();
          await _fetch();
        } catch (err) { UI.toast(err.message, "error"); }
      };
    }
  }

  function openForm(kopyala = null) {
    const sonRevNo = kopyala ? _sonrakiRevizyon(kopyala.revizyon_no) : "Rev.0";
    UI.openModal(`
      <h3>${kopyala ? "Yeni Revizyon Ekle" : "Yeni E-Plan Dökümanı"}</h3>
      <form id="ep-form" enctype="multipart/form-data">
        <div class="form-grid">
          <div class="form-row">
            <label>Seri No <small class="muted">(ör: EP-001)</small></label>
            <input name="seri_no" required value="${UI.esc(kopyala?.seri_no || "")}" ${kopyala ? "readonly" : ""} />
          </div>
          <div class="form-row">
            <label>Revizyon No</label>
            <input name="revizyon_no" required value="${UI.esc(sonRevNo)}" />
          </div>
          <div class="form-row" style="grid-column:span 2">
            <label>Başlık</label>
            <input name="baslik" required value="${UI.esc(kopyala?.baslik || "")}" />
          </div>
          <div class="form-row">
            <label>Döküman Tipi</label>
            <select name="dokuman_tipi">
              ${Object.entries(TIP_LABELS).map(([k, v]) => `<option value="${k}" ${(kopyala?.dokuman_tipi || "sema") === k ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </div>
          <div class="form-row">
            <label>Onay Durumu</label>
            <select name="onay_durumu">
              ${Object.entries(ONAY_META).map(([k, v]) => `<option value="${k}" ${(kopyala ? "taslak" : "taslak") === k ? "selected" : ""}>${v.label}</option>`).join("")}
            </select>
          </div>
          <div class="form-row" style="grid-column:span 2">
            <label>Açıklama</label>
            <textarea name="aciklama" rows="2">${UI.esc(kopyala?.aciklama || "")}</textarea>
          </div>
          <div class="form-row" style="grid-column:span 2">
            <label>Notlar</label>
            <textarea name="notlar" rows="2"></textarea>
          </div>
          <div class="form-row" style="grid-column:span 2">
            <label>Dosya <small class="muted">(PDF, DXF, XLS — opsiyonel)</small></label>
            <input type="file" name="dosya" accept=".pdf,.dxf,.dwg,.xls,.xlsx,.csv" />
          </div>
        </div>
        <div class="form-error" id="ep-form-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="ep-form-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("ep-form-iptal").onclick = () => UI.closeModal();
    document.getElementById("ep-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.postForm("/eplan", fd);
        UI.toast("Döküman kaydedildi", "success");
        UI.closeModal();
        await _fetch();
      } catch (err) {
        document.getElementById("ep-form-err").textContent = err.message;
      }
    };
  }

  function _sonrakiRevizyon(mevcut) {
    const m = mevcut.match(/(\d+)$/);
    if (m) return mevcut.replace(/\d+$/, String(+m[1] + 1));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const m2 = mevcut.match(/([A-Z])$/);
    if (m2) {
      const idx = chars.indexOf(m2[1]);
      return mevcut.replace(/[A-Z]$/, chars[idx + 1] || "Z");
    }
    return mevcut + ".1";
  }

  return { load };
})();

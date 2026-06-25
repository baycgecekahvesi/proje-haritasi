// ===================== I/O LİSTESİ YÖNETİMİ =====================
const IOList = (() => {

  const SINYAL = {
    DI:  { label: "DI",  ikon: "⬇️", renk: "#6366f1", bg: "#eef2ff" },
    DO:  { label: "DO",  ikon: "⬆️", renk: "#8b5cf6", bg: "#f5f3ff" },
    AI:  { label: "AI",  ikon: "📉", renk: "#0ea5e9", bg: "#f0f9ff" },
    AO:  { label: "AO",  ikon: "📈", renk: "#06b6d4", bg: "#ecfeff" },
    RTD: { label: "RTD", ikon: "🌡️", renk: "#f59e0b", bg: "#fffbeb" },
    TC:  { label: "TC",  ikon: "🔥", renk: "#ef4444", bg: "#fef2f2" },
    PI:  { label: "PI",  ikon: "🔢", renk: "#10b981", bg: "#f0fdf4" },
    COM: { label: "COM", ikon: "📡", renk: "#64748b", bg: "#f8fafc" },
  };

  const KABLO_DURUM = {
    bekliyor:  { label: "Bekliyor",   renk: "#94a3b8", bg: "#f8fafc" },
    cekildi:   { label: "Çekildi",    renk: "#f59e0b", bg: "#fffbeb" },
    baglandi:  { label: "Bağlandı",   renk: "#0ea5e9", bg: "#f0f9ff" },
    test_ok:   { label: "Test OK",    renk: "#16a34a", bg: "#f0fdf4" },
    test_hata: { label: "Test Hata",  renk: "#dc2626", bg: "#fef2f2" },
  };

  const DURUM = {
    taslak:    { label: "Taslak",     renk: "#94a3b8" },
    onaylandi: { label: "Onaylandı",  renk: "#16a34a" },
    revize:    { label: "Revize",     renk: "#f59e0b" },
    iptal:     { label: "İptal",      renk: "#ef4444" },
  };

  let items    = [];
  let projeler = [];

  async function load() {
    const panel = document.getElementById("panel-iolist");
    if (!panel) return;
    try { projeler = (await API.get("/projects/")).items || await API.get("/projects/"); } catch { projeler = []; }
    try { items = await API.get("/io"); } catch { items = []; }
    _render(panel);
  }

  function _render(panel) {
    const editor = Auth.isEditor();
    const projeOpts = `<option value="">Tüm projeler</option>` +
      projeler.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("");

    panel.innerHTML = `
      <div class="io-layout">
        <!-- BAŞLIK -->
        <div class="pl-header">
          <div>
            <h2 class="pl-title">🔌 I/O Listesi Yönetimi</h2>
            <p class="pl-sub">PLC sinyal noktaları, kablo takibi ve saha enstrümantasyonu.</p>
          </div>
          <div class="pl-header-right">
            <div class="io-ozet-bar" id="io-ozet-bar"></div>
            <button class="btn btn-ghost" id="io-export-btn">⬇ CSV İndir</button>
            ${editor ? `<button class="btn btn-primary" id="io-yeni-btn">+ Yeni Nokta</button>` : ""}
          </div>
        </div>

        <!-- SİNYAL TİPİ TABS -->
        <div class="pl-tur-tabs">
          <button class="pl-ttab active" data-sinyal="">Tümü</button>
          ${Object.entries(SINYAL).map(([k,s]) =>
            `<button class="pl-ttab" data-sinyal="${k}" style="--s-renk:${s.renk}">${s.ikon} ${s.label}</button>`
          ).join("")}
        </div>

        <!-- FİLTRELER -->
        <div class="pl-filter-bar">
          <select id="io-fil-proje" class="rk-fil">${projeOpts}</select>
          <select id="io-fil-kablo" class="rk-fil">
            <option value="">Tüm kablo durumları</option>
            ${Object.entries(KABLO_DURUM).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
          </select>
          <select id="io-fil-durum" class="rk-fil">
            <option value="">Tüm durumlar</option>
            ${Object.entries(DURUM).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
          </select>
          <input id="io-search" class="rk-fil" type="text" placeholder="🔍 Tag/açıklama ara…" style="min-width:180px" />
        </div>

        <div id="io-list-wrap" style="padding:0 24px 24px;overflow-x:auto"></div>
      </div>`;

    if (editor) document.getElementById("io-yeni-btn").onclick = () => openForm();

    async function exportCSV() {
      const token = localStorage.getItem("access_token");
      const projeId = document.getElementById("io-fil-proje")?.value || "";
      const sinyal_tipi = _aktifSinyal();
      let url = "/api/io/export";
      const params = [];
      if (projeId) params.push(`proje_id=${projeId}`);
      if (sinyal_tipi) params.push(`sinyal_tipi=${sinyal_tipi}`);
      if (params.length) url += "?" + params.join("&");

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { UI.toast("İndirme başarısız", "error"); return; }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "iolist.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    }
    document.getElementById("io-export-btn").addEventListener("click", exportCSV);

    panel.querySelectorAll(".pl-ttab").forEach(b => {
      b.addEventListener("click", () => {
        panel.querySelectorAll(".pl-ttab").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        _renderTable();
      });
    });
    ["io-fil-proje","io-fil-kablo","io-fil-durum"].forEach(id => {
      document.getElementById(id).addEventListener("change", _renderTable);
    });
    document.getElementById("io-search").addEventListener("input", _renderTable);

    _renderOzet();
    _renderTable();
  }

  function _aktifSinyal() {
    const b = document.querySelector(".pl-ttab.active");
    return b ? b.dataset.sinyal : "";
  }

  function _filtrele() {
    const sinyal   = _aktifSinyal();
    const projeId  = +document.getElementById("io-fil-proje")?.value || 0;
    const kablo    = document.getElementById("io-fil-kablo")?.value || "";
    const durum    = document.getElementById("io-fil-durum")?.value || "";
    const q        = (document.getElementById("io-search")?.value || "").toLowerCase();
    return items.filter(i => {
      if (sinyal  && i.sinyal_tipi !== sinyal)   return false;
      if (projeId && i.proje_id !== projeId)     return false;
      if (kablo   && i.kablo_durum !== kablo)    return false;
      if (durum   && i.durum !== durum)          return false;
      if (q && !(i.tag_no + " " + i.tanim + " " + i.alan_cihaz).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function _renderOzet() {
    const el = document.getElementById("io-ozet-bar");
    if (!el) return;
    const sayac = {};
    items.forEach(i => { sayac[i.sinyal_tipi] = (sayac[i.sinyal_tipi] || 0) + 1; });
    const testOk = items.filter(i => i.kablo_durum === "test_ok").length;
    el.innerHTML = Object.entries(sayac).map(([k, n]) => {
      const s = SINYAL[k] || { label: k, renk: "#64748b", bg: "#f8fafc", ikon: "•" };
      return `<span class="rk-chip" style="background:${s.bg};color:${s.renk};border-color:${s.renk}33">${s.ikon} ${s.label}: <strong>${n}</strong></span>`;
    }).join("") +
    `<span class="rk-chip" style="background:#f0fdf4;color:#16a34a;border-color:#16a34a33">✅ Test OK: <strong>${testOk}/${items.length}</strong></span>`;
  }

  function _renderTable() {
    const wrap = document.getElementById("io-list-wrap");
    if (!wrap) return;
    const liste = _filtrele();
    if (!liste.length) {
      wrap.innerHTML = `<p class="muted" style="padding:24px;text-align:center">I/O noktası bulunamadı.</p>`;
      return;
    }
    const editor = Auth.isEditor();
    wrap.innerHTML = `
      <table class="rk-tablo io-tablo">
        <thead><tr>
          <th>Tag No</th><th>Tanım</th><th>Sinyal</th>
          <th>Proses Değer</th><th>Rack/Slot/Kanal</th>
          <th>Panel</th><th>Kablo No</th>
          <th>Alan Cihazı</th><th>Kablo Durumu</th><th>Durum</th>
          ${editor ? "<th></th>" : ""}
        </tr></thead>
        <tbody>
          ${liste.map(i => _rowHtml(i, editor)).join("")}
        </tbody>
      </table>`;

    wrap.querySelectorAll("[data-io-id]").forEach(el =>
      el.addEventListener("click", () => openDetail(+el.dataset.ioId))
    );
    if (editor) {
      wrap.querySelectorAll("[data-io-del]").forEach(el =>
        el.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm(`"${el.dataset.ioTag}" silinecek. Emin misiniz?`)) return;
          await API.del(`/io/${el.dataset.ioDel}`);
          items = items.filter(i => i.id !== +el.dataset.ioDel);
          _renderOzet();
          _renderTable();
        })
      );
    }
  }

  function _rowHtml(i, editor) {
    const s  = SINYAL[i.sinyal_tipi] || SINYAL.COM;
    const kd = KABLO_DURUM[i.kablo_durum] || KABLO_DURUM.bekliyor;
    const d  = DURUM[i.durum] || DURUM.taslak;
    const adres = [i.plc_rack, i.plc_slot, i.plc_kanal].filter(Boolean).join(" / ") || "—";
    return `<tr class="rk-satir" data-io-id="${i.id}">
      <td><code class="io-tag" style="background:${s.bg};color:${s.renk}">${UI.esc(i.tag_no)}</code></td>
      <td class="rk-baslik-cell">
        <span class="rk-baslik">${UI.esc(i.tanim)}</span>
        <span class="rk-proje-lbl">${UI.esc(i.proje_adi)}</span>
      </td>
      <td><span class="rk-chip" style="background:${s.bg};color:${s.renk};border-color:${s.renk}33">${s.ikon} ${s.label}</span></td>
      <td><small class="muted">${UI.esc(i.proses_deger || "—")}</small></td>
      <td><code style="font-size:11px;color:var(--muted)">${adres}</code></td>
      <td><small>${UI.esc(i.panel_no || "—")}</small></td>
      <td><small>${UI.esc(i.kablo_no || "—")}</small></td>
      <td><small>${UI.esc(i.alan_cihaz || "—")}</small></td>
      <td><span class="rk-chip" style="background:${kd.bg};color:${kd.renk};border-color:${kd.renk}33">${kd.label}</span></td>
      <td><span style="color:${d.renk};font-size:12px;font-weight:600">${d.label}</span></td>
      ${editor ? `<td>
        <button class="btn btn-sm btn-ghost" data-io-del="${i.id}" data-io-tag="${UI.esc(i.tag_no)}" title="Sil">✕</button>
      </td>` : ""}
    </tr>`;
  }

  // ── Detay ────────────────────────────────────────────────────────────────────
  function openDetail(id) {
    const i = items.find(x => x.id === id);
    if (!i) return;
    const s  = SINYAL[i.sinyal_tipi] || SINYAL.COM;
    const kd = KABLO_DURUM[i.kablo_durum] || KABLO_DURUM.bekliyor;
    const d  = DURUM[i.durum] || DURUM.taslak;
    const editor = Auth.isEditor();
    UI.openModal(`
      <h3><code class="io-tag" style="background:${s.bg};color:${s.renk};font-size:16px;padding:4px 10px;border-radius:6px">${i.tag_no}</code></h3>
      <p style="margin:6px 0 12px;font-size:14px">${UI.esc(i.tanim)}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span class="rk-chip" style="background:${s.bg};color:${s.renk};border-color:${s.renk}33">${s.ikon} ${i.sinyal_tipi_display}</span>
        <span class="rk-chip" style="background:${kd.bg};color:${kd.renk};border-color:${kd.renk}33">${kd.label}</span>
        <span style="color:${d.renk};font-size:12px;font-weight:600;align-self:center">${d.label}</span>
        ${i.sil_seviye ? `<span class="rk-chip" style="background:#fef2f2;color:#dc2626;border-color:#dc262633">⚠️ ${i.sil_seviye}</span>` : ""}
      </div>
      <div class="rk-detail-grid" style="grid-template-columns:1fr 1fr 1fr">
        <div><span class="muted">Proje</span><strong>${UI.esc(i.proje_adi)}</strong></div>
        <div><span class="muted">Proses Değer</span><strong>${UI.esc(i.proses_deger || "—")}</strong></div>
        <div><span class="muted">Alan Cihazı</span><strong>${UI.esc(i.alan_cihaz || "—")}</strong></div>
        <div><span class="muted">Rack / Slot / Kanal</span>
          <strong>${[i.plc_rack, i.plc_slot, i.plc_kanal].filter(Boolean).join(" / ") || "—"}</strong></div>
        <div><span class="muted">Panel</span><strong>${UI.esc(i.panel_no || "—")}</strong></div>
        <div><span class="muted">Klemens</span><strong>${UI.esc(i.klemens_no || "—")}</strong></div>
        <div><span class="muted">Kablo No</span><strong>${UI.esc(i.kablo_no || "—")}</strong></div>
        <div><span class="muted">Son Güncelleme</span><strong>${UI.fmtDate(i.guncellendi)}</strong></div>
      </div>
      ${i.notlar ? `<div class="rk-detail-blok"><strong>Notlar</strong><p>${UI.esc(i.notlar)}</p></div>` : ""}
      ${editor ? `<div class="modal-actions">
        <button class="btn" id="io-kablo-btn">🔌 Kablo Durumunu Güncelle</button>
        <button class="btn" id="io-edit-btn">✏️ Düzenle</button>
      </div>` : ""}
    `);
    if (editor) {
      document.getElementById("io-edit-btn").onclick = () => { UI.closeModal(); openForm(i); };
      document.getElementById("io-kablo-btn").onclick = () => openKabloDurumForm(i);
    }
  }

  function openKabloDurumForm(i) {
    UI.openModal(`
      <h3>Kablo Durumu — ${i.tag_no}</h3>
      <form id="io-kablo-form">
        <div class="form-row"><label>Kablo Durumu</label>
          <select name="kablo_durum">
            ${Object.entries(KABLO_DURUM).map(([k,v]) =>
              `<option value="${k}" ${i.kablo_durum === k ? "selected" : ""}>${v.label}</option>`
            ).join("")}
          </select>
        </div>
        <div class="form-row"><label>Kablo No</label>
          <input name="kablo_no" value="${UI.esc(i.kablo_no)}" placeholder="KBL-001" />
        </div>
        <div class="form-row"><label>Klemens No</label>
          <input name="klemens_no" value="${UI.esc(i.klemens_no)}" placeholder="X1:1" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" id="iok-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `);
    document.getElementById("iok-iptal").onclick = () => UI.closeModal();
    document.getElementById("io-kablo-form").onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.patch(`/io/${i.id}`, {
        kablo_durum: fd.get("kablo_durum"),
        kablo_no:    fd.get("kablo_no"),
        klemens_no:  fd.get("klemens_no"),
      });
      UI.toast("Kablo durumu güncellendi", "success");
      UI.closeModal();
      items = await API.get("/io");
      _renderOzet();
      _renderTable();
    };
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  function openForm(item = null) {
    const isEdit = !!item;
    const v = (k, d = "") => item ? (item[k] ?? d) : d;
    const projeOpts = projeler.map(p =>
      `<option value="${p.id}" ${v("proje_id") === p.id ? "selected" : ""}>${UI.esc(p.name)}</option>`
    ).join("");

    UI.openModal(`
      <h3>${isEdit ? `Düzenle — ${item.tag_no}` : "Yeni I/O Noktası"}</h3>
      <form id="io-form">
        <div class="form-grid">
          <div class="form-row"><label>Proje</label>
            <select name="proje_id" required><option value="">— Seçin —</option>${projeOpts}</select>
          </div>
          <div class="form-row"><label>Tag No *</label>
            <input name="tag_no" required value="${UI.esc(v("tag_no"))}" placeholder="FIC-101" ${isEdit ? "readonly" : ""} />
          </div>
        </div>
        <div class="form-row"><label>Tanım *</label>
          <input name="tanim" required value="${UI.esc(v("tanim"))}" placeholder="Akış kontrol enstrümanı" />
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Sinyal Tipi</label>
            <select name="sinyal_tipi">
              ${Object.entries(SINYAL).map(([k,s]) =>
                `<option value="${k}" ${v("sinyal_tipi","DI") === k ? "selected" : ""}>${s.ikon} ${s.label} — ${k}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-row"><label>Proses Değer / Aralık</label>
            <input name="proses_deger" value="${UI.esc(v("proses_deger"))}" placeholder="4-20mA / 0-100 m³/h" />
          </div>
          <div class="form-row"><label>PLC Rack</label>
            <input name="plc_rack" value="${UI.esc(v("plc_rack"))}" placeholder="R1" />
          </div>
          <div class="form-row"><label>PLC Slot</label>
            <input name="plc_slot" value="${UI.esc(v("plc_slot"))}" placeholder="S3" />
          </div>
          <div class="form-row"><label>PLC Kanal</label>
            <input name="plc_kanal" value="${UI.esc(v("plc_kanal"))}" placeholder="CH01" />
          </div>
          <div class="form-row"><label>Panel No</label>
            <input name="panel_no" value="${UI.esc(v("panel_no"))}" placeholder="MCC-101" />
          </div>
          <div class="form-row"><label>Kablo No</label>
            <input name="kablo_no" value="${UI.esc(v("kablo_no"))}" placeholder="KBL-001" />
          </div>
          <div class="form-row"><label>Klemens No</label>
            <input name="klemens_no" value="${UI.esc(v("klemens_no"))}" placeholder="X1:1" />
          </div>
          <div class="form-row"><label>SIL Seviyesi</label>
            <input name="sil_seviye" value="${UI.esc(v("sil_seviye"))}" placeholder="SIL 2" />
          </div>
          ${isEdit ? `<div class="form-row"><label>Kablo Durumu</label>
            <select name="kablo_durum">
              ${Object.entries(KABLO_DURUM).map(([k,vv]) =>
                `<option value="${k}" ${v("kablo_durum","bekliyor") === k ? "selected" : ""}>${vv.label}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-row"><label>Onay Durumu</label>
            <select name="durum">
              ${Object.entries(DURUM).map(([k,vv]) =>
                `<option value="${k}" ${v("durum","taslak") === k ? "selected" : ""}>${vv.label}</option>`
              ).join("")}
            </select>
          </div>` : ""}
        </div>
        <div class="form-row"><label>Alan Cihazı</label>
          <input name="alan_cihaz" value="${UI.esc(v("alan_cihaz"))}" placeholder="Endress+Hauser Coriolis" />
        </div>
        <div class="form-row"><label>Notlar</label>
          <textarea name="notlar" rows="2">${UI.esc(v("notlar"))}</textarea>
        </div>
        <div class="form-error" id="io-form-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="io-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Ekle"}</button>
        </div>
      </form>
    `);
    document.getElementById("io-iptal").onclick = () => UI.closeModal();
    document.getElementById("io-form").onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        proje_id:     +fd.get("proje_id"),
        tag_no:        fd.get("tag_no"),
        tanim:         fd.get("tanim"),
        sinyal_tipi:   fd.get("sinyal_tipi"),
        proses_deger:  fd.get("proses_deger"),
        plc_rack:      fd.get("plc_rack"),
        plc_slot:      fd.get("plc_slot"),
        plc_kanal:     fd.get("plc_kanal"),
        panel_no:      fd.get("panel_no"),
        kablo_no:      fd.get("kablo_no"),
        klemens_no:    fd.get("klemens_no"),
        sil_seviye:    fd.get("sil_seviye"),
        alan_cihaz:    fd.get("alan_cihaz"),
        notlar:        fd.get("notlar"),
      };
      if (isEdit) {
        body.kablo_durum = fd.get("kablo_durum");
        body.durum       = fd.get("durum");
      }
      try {
        if (isEdit) await API.patch(`/io/${item.id}`, body);
        else        await API.post("/io", body);
        UI.toast(isEdit ? "I/O noktası güncellendi" : "I/O noktası eklendi", "success");
        UI.closeModal();
        items = await API.get("/io");
        _renderOzet();
        _renderTable();
      } catch (err) {
        document.getElementById("io-form-err").textContent = err.message;
      }
    };
  }

  return { load };
})();

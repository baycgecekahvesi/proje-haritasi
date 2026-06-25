// ===================== PUNCH LIST (FAT/SAT) =====================
const PunchList = (() => {

  const TUR = {
    fat:      { label: "FAT",         renk: "#6366f1", ikon: "🏭" },
    sat:      { label: "SAT",         renk: "#0ea5e9", ikon: "🏗️" },
    komisyon: { label: "Devreye Alma",renk: "#8b5cf6", ikon: "⚙️" },
    diger:    { label: "Diğer",       renk: "#94a3b8", ikon: "📌" },
  };
  const KATEGORI = {
    elektrik:  "#f59e0b", otomasyon: "#6366f1", mekanik: "#10b981",
    dokuman:   "#64748b", guvenlik:  "#dc2626", yazilim: "#0ea5e9", diger: "#94a3b8",
  };
  const ONCELIK = {
    A: { label: "Kritik", renk: "#dc2626", bg: "#fef2f2" },
    B: { label: "Önemli", renk: "#f59e0b", bg: "#fffbeb" },
    C: { label: "İstenen",renk: "#16a34a", bg: "#f0fdf4" },
  };
  const DURUM = {
    acik:    { label: "Açık",        renk: "#ef4444", bg: "#fef2f2" },
    devam:   { label: "Devam",       renk: "#f59e0b", bg: "#fffbeb" },
    kapandi: { label: "Kapandı",     renk: "#16a34a", bg: "#f0fdf4" },
    iptal:   { label: "İptal",       renk: "#94a3b8", bg: "#f8fafc" },
  };

  let items    = [];
  let projeler = [];

  async function load() {
    const panel = document.getElementById("panel-punchlist");
    if (!panel) return;
    try { projeler = (await API.get("/projects/")).items || await API.get("/projects/"); } catch { projeler = []; }
    try { items = await API.get("/punch"); } catch { items = []; }
    _render(panel);
  }

  function _render(panel) {
    const editor = Auth.isEditor();
    const projeOpts = `<option value="">Tüm projeler</option>` +
      projeler.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("");

    panel.innerHTML = `
      <div class="pl-layout">
        <!-- BAŞLIK -->
        <div class="pl-header">
          <div>
            <h2 class="pl-title">📋 Punch List (FAT / SAT)</h2>
            <p class="pl-sub">Kabul testi ve devreye alma sırasında açık maddeleri kayıt altına al.</p>
          </div>
          <div class="pl-header-right">
            <div class="pl-ozet-chips" id="pl-ozet-chips"></div>
            <button class="btn btn-ghost" id="pl-export-btn">⬇ CSV İndir</button>
            ${editor ? `<button class="btn btn-primary" id="pl-yeni-btn">+ Yeni Madde</button>` : ""}
          </div>
        </div>

        <!-- TUR SEKMELER -->
        <div class="pl-tur-tabs">
          <button class="pl-ttab active" data-tur="">Tümü</button>
          ${Object.entries(TUR).map(([k,v]) =>
            `<button class="pl-ttab" data-tur="${k}">${v.ikon} ${v.label}</button>`
          ).join("")}
        </div>

        <!-- FİLTRELER -->
        <div class="pl-filter-bar">
          <select id="pl-fil-proje" class="rk-fil">${projeOpts}</select>
          <select id="pl-fil-durum" class="rk-fil">
            <option value="">Tüm durumlar</option>
            ${Object.entries(DURUM).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
          </select>
          <select id="pl-fil-oncelik" class="rk-fil">
            <option value="">Tüm öncelikler</option>
            ${Object.entries(ONCELIK).map(([k,v]) => `<option value="${k}">🔴 ${v.label}</option>`).join("")}
          </select>
          <select id="pl-fil-kategori" class="rk-fil">
            <option value="">Tüm kategoriler</option>
            ${Object.keys(KATEGORI).map(k => `<option value="${k}">${k.charAt(0).toUpperCase()+k.slice(1)}</option>`).join("")}
          </select>
          <input id="pl-search" class="rk-fil" type="text" placeholder="🔍 Ara…" style="min-width:160px" />
        </div>

        <div id="pl-list-wrap" style="padding:0 24px 24px"></div>
      </div>`;

    if (editor) document.getElementById("pl-yeni-btn").onclick = () => openForm();

    async function exportCSV() {
      const token = localStorage.getItem("access_token");
      const projeId = document.getElementById("pl-fil-proje")?.value || "";
      const tur = _aktifTur();
      let url = "/api/punch/export";
      const params = [];
      if (projeId) params.push(`proje_id=${projeId}`);
      if (tur) params.push(`tur=${tur}`);
      if (params.length) url += "?" + params.join("&");

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { UI.toast("İndirme başarısız", "error"); return; }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "punchlist.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    }
    document.getElementById("pl-export-btn").addEventListener("click", exportCSV);

    panel.querySelectorAll(".pl-ttab").forEach(b => {
      b.addEventListener("click", () => {
        panel.querySelectorAll(".pl-ttab").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        _renderList();
      });
    });
    ["pl-fil-proje","pl-fil-durum","pl-fil-oncelik","pl-fil-kategori"].forEach(id => {
      document.getElementById(id).addEventListener("change", _renderList);
    });
    document.getElementById("pl-search").addEventListener("input", _renderList);

    _renderOzet();
    _renderList();
  }

  function _aktifTur() {
    const b = document.querySelector(".pl-ttab.active");
    return b ? b.dataset.tur : "";
  }

  function _filtrele() {
    const tur      = _aktifTur();
    const projeId  = +document.getElementById("pl-fil-proje")?.value || 0;
    const durum    = document.getElementById("pl-fil-durum")?.value || "";
    const oncelik  = document.getElementById("pl-fil-oncelik")?.value || "";
    const kategori = document.getElementById("pl-fil-kategori")?.value || "";
    const q        = (document.getElementById("pl-search")?.value || "").toLowerCase();
    return items.filter(i => {
      if (tur      && i.tur      !== tur)      return false;
      if (projeId  && i.proje_id !== projeId)  return false;
      if (durum    && i.durum    !== durum)     return false;
      if (oncelik  && i.oncelik  !== oncelik)  return false;
      if (kategori && i.kategori !== kategori) return false;
      if (q && !(`${i.no} ${i.baslik} ${i.proje_adi}`).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function _renderOzet() {
    const el = document.getElementById("pl-ozet-chips");
    if (!el) return;
    const aktif = items.filter(i => i.durum !== "kapandi" && i.durum !== "iptal");
    const kritik = aktif.filter(i => i.oncelik === "A").length;
    const total  = items.length;
    const acik   = items.filter(i => i.durum === "acik").length;
    const kapandi = items.filter(i => i.durum === "kapandi").length;
    el.innerHTML = `
      <span class="rk-chip" style="background:#fef2f2;color:#dc2626;border-color:#dc262633">Kritik Açık: <strong>${kritik}</strong></span>
      <span class="rk-chip" style="background:#eff6ff;color:#3b82f6;border-color:#3b82f633">Toplam: <strong>${total}</strong></span>
      <span class="rk-chip" style="background:#f0fdf4;color:#16a34a;border-color:#16a34a33">Kapandı: <strong>${kapandi}/${total}</strong></span>
    `;
  }

  function _renderList() {
    const wrap = document.getElementById("pl-list-wrap");
    if (!wrap) return;
    const liste = _filtrele();
    if (!liste.length) {
      wrap.innerHTML = `<p class="muted" style="padding:24px;text-align:center">Madde bulunamadı.</p>`;
      return;
    }
    const editor = Auth.isEditor();
    // Tur bazında gruplama
    const gruplar = {};
    liste.forEach(i => {
      if (!gruplar[i.tur]) gruplar[i.tur] = [];
      gruplar[i.tur].push(i);
    });

    wrap.innerHTML = Object.entries(gruplar).map(([tur, grp]) => {
      const t = TUR[tur] || TUR.diger;
      const acik   = grp.filter(i => i.durum === "acik").length;
      const kapandi = grp.filter(i => i.durum === "kapandi").length;
      return `
        <div class="pl-grup">
          <div class="pl-grup-header" style="border-left:4px solid ${t.renk}">
            <span class="pl-grup-title">${t.ikon} ${t.label}</span>
            <span class="muted" style="font-size:12px">${acik} açık &nbsp;·&nbsp; ${kapandi} kapandı &nbsp;·&nbsp; ${grp.length} toplam</span>
          </div>
          <table class="rk-tablo">
            <thead><tr>
              <th>No</th><th>Başlık</th><th>Kategori</th>
              <th>Öncelik</th><th>Durum</th>
              <th>Sorumlu</th><th>Hedef</th>
              ${editor ? "<th></th>" : ""}
            </tr></thead>
            <tbody>
              ${grp.map(i => _rowHtml(i, editor)).join("")}
            </tbody>
          </table>
        </div>`;
    }).join("");

    wrap.querySelectorAll("[data-pl-id]").forEach(el =>
      el.addEventListener("click", () => openDetail(+el.dataset.plId))
    );
    if (editor) {
      wrap.querySelectorAll("[data-pl-del]").forEach(el =>
        el.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Bu madde silinecek. Emin misiniz?")) return;
          await API.del(`/punch/${el.dataset.plDel}`);
          items = items.filter(i => i.id !== +el.dataset.plDel);
          _renderOzet();
          _renderList();
        })
      );
    }
  }

  function _rowHtml(i, editor) {
    const o = ONCELIK[i.oncelik] || ONCELIK.B;
    const d = DURUM[i.durum]     || DURUM.acik;
    const kRenk = KATEGORI[i.kategori] || "#94a3b8";
    return `<tr class="rk-satir" data-pl-id="${i.id}">
      <td><code style="font-size:11px;background:var(--bg);padding:2px 6px;border-radius:4px">${i.no}</code></td>
      <td class="rk-baslik-cell">
        <span class="rk-baslik">${UI.esc(i.baslik)}</span>
        <span class="rk-proje-lbl">${UI.esc(i.proje_adi)}</span>
      </td>
      <td><span class="rk-chip" style="background:${kRenk}18;color:${kRenk};border-color:${kRenk}33">${i.kategori_display}</span></td>
      <td><span class="rk-chip" style="background:${o.bg};color:${o.renk};border-color:${o.renk}33;font-weight:700">${i.oncelik}</span></td>
      <td><span class="rk-chip" style="background:${d.bg};color:${d.renk};border-color:${d.renk}33">${d.label}</span></td>
      <td>${UI.esc(i.sorumlu_username || "—")}</td>
      <td>${UI.fmtDate(i.hedef_tarih) || "—"}</td>
      ${editor ? `<td><button class="btn btn-sm btn-ghost" data-pl-del="${i.id}" title="Sil">✕</button></td>` : ""}
    </tr>`;
  }

  // ── Detay ────────────────────────────────────────────────────────────────────
  function openDetail(id) {
    const item = items.find(x => x.id === id);
    if (!item) return;
    const o = ONCELIK[item.oncelik] || ONCELIK.B;
    const d = DURUM[item.durum]     || DURUM.acik;
    const t = TUR[item.tur]         || TUR.diger;
    const editor = Auth.isEditor();
    UI.openModal(`
      <h3><code style="font-size:14px;background:var(--bg);padding:3px 8px;border-radius:5px">${item.no}</code>
        &nbsp;${UI.esc(item.baslik)}</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
        <span class="rk-chip" style="background:${t.renk}18;color:${t.renk};border-color:${t.renk}33">${t.ikon} ${t.label}</span>
        <span class="rk-chip" style="background:${o.bg};color:${o.renk};border-color:${o.renk}33">Öncelik ${item.oncelik} — ${o.label}</span>
        <span class="rk-chip" style="background:${d.bg};color:${d.renk};border-color:${d.renk}33">${d.label}</span>
      </div>
      <div class="rk-detail-grid">
        <div><span class="muted">Proje</span><strong>${UI.esc(item.proje_adi)}</strong></div>
        <div><span class="muted">Kategori</span><strong>${UI.esc(item.kategori_display)}</strong></div>
        <div><span class="muted">Sorumlu</span><strong>${UI.esc(item.sorumlu_username || "—")}</strong></div>
        <div><span class="muted">Hedef Tarih</span><strong>${UI.fmtDate(item.hedef_tarih) || "—"}</strong></div>
        <div><span class="muted">Tespit Tarihi</span><strong>${UI.fmtDate(item.tespit_tarihi) || "—"}</strong></div>
        <div><span class="muted">Kapanma</span><strong>${UI.fmtDate(item.kapanma_tarihi) || "—"}</strong></div>
      </div>
      ${item.aciklama ? `<div class="rk-detail-blok"><strong>Açıklama</strong><p>${UI.esc(item.aciklama)}</p></div>` : ""}
      ${item.kapatma_notu ? `<div class="rk-detail-blok" style="border-left-color:#16a34a"><strong>Kapatma Notu</strong><p>${UI.esc(item.kapatma_notu)}</p></div>` : ""}
      ${editor ? `<div class="modal-actions">
        <button class="btn" id="pl-kapat-btn">✅ Kapat</button>
        <button class="btn" id="pl-edit-btn">✏️ Düzenle</button>
      </div>` : ""}
    `);
    if (editor) {
      document.getElementById("pl-edit-btn").onclick  = () => { UI.closeModal(); openForm(item); };
      document.getElementById("pl-kapat-btn").onclick = () => openCloseForm(item);
    }
  }

  function openCloseForm(item) {
    UI.openModal(`
      <h3>Maddeyi Kapat — ${item.no}</h3>
      <form id="pl-kapat-form">
        <div class="form-row"><label>Kapatma Notu</label>
          <textarea name="kapatma_notu" rows="4" required placeholder="Yapılan işlemi açıklayın…">${UI.esc(item.kapatma_notu)}</textarea>
        </div>
        <div class="form-row"><label>Kapanma Tarihi</label>
          <input type="date" name="kapanma_tarihi" value="${item.kapanma_tarihi || new Date().toISOString().slice(0,10)}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" id="plk-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">Kapat</button>
        </div>
      </form>
    `);
    document.getElementById("plk-iptal").onclick = () => UI.closeModal();
    document.getElementById("pl-kapat-form").onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.patch(`/punch/${item.id}`, {
        durum: "kapandi",
        kapatma_notu:   fd.get("kapatma_notu"),
        kapanma_tarihi: fd.get("kapanma_tarihi") || null,
      });
      UI.toast("Madde kapatıldı", "success");
      UI.closeModal();
      items = await API.get("/punch");
      _renderOzet();
      _renderList();
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
      <h3>${isEdit ? `Düzenle — ${item.no}` : "Yeni Punch Maddesi"}</h3>
      <form id="pl-form">
        <div class="form-grid">
          <div class="form-row"><label>Proje</label>
            <select name="proje_id" required><option value="">— Seçin —</option>${projeOpts}</select>
          </div>
          <div class="form-row"><label>Tür</label>
            <select name="tur">
              ${Object.entries(TUR).map(([k,t]) =>
                `<option value="${k}" ${v("tur","fat") === k ? "selected" : ""}>${t.ikon} ${t.label}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div class="form-row"><label>Başlık</label>
          <input name="baslik" required value="${UI.esc(v("baslik"))}" />
        </div>
        <div class="form-row"><label>Açıklama</label>
          <textarea name="aciklama" rows="3">${UI.esc(v("aciklama"))}</textarea>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Kategori</label>
            <select name="kategori">
              ${Object.keys(KATEGORI).map(k =>
                `<option value="${k}" ${v("kategori","diger") === k ? "selected" : ""}>${k}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-row"><label>Öncelik</label>
            <select name="oncelik">
              ${Object.entries(ONCELIK).map(([k,l]) =>
                `<option value="${k}" ${v("oncelik","B") === k ? "selected" : ""}>${k} — ${l.label}</option>`
              ).join("")}
            </select>
          </div>
          ${isEdit ? `<div class="form-row"><label>Durum</label>
            <select name="durum">
              ${Object.entries(DURUM).map(([k,l]) =>
                `<option value="${k}" ${v("durum","acik") === k ? "selected" : ""}>${l.label}</option>`
              ).join("")}
            </select>
          </div>` : ""}
          <div class="form-row"><label>Tespit Tarihi</label>
            <input type="date" name="tespit_tarihi" value="${v("tespit_tarihi") || ""}" />
          </div>
          <div class="form-row"><label>Hedef Kapatma</label>
            <input type="date" name="hedef_tarih" value="${v("hedef_tarih") || ""}" />
          </div>
        </div>
        <div class="form-error" id="pl-form-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="pl-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Ekle"}</button>
        </div>
      </form>
    `);
    document.getElementById("pl-iptal").onclick = () => UI.closeModal();
    document.getElementById("pl-form").onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        proje_id:      +fd.get("proje_id"),
        tur:            fd.get("tur"),
        baslik:         fd.get("baslik"),
        aciklama:       fd.get("aciklama"),
        kategori:       fd.get("kategori"),
        oncelik:        fd.get("oncelik"),
        tespit_tarihi:  fd.get("tespit_tarihi") || null,
        hedef_tarih:    fd.get("hedef_tarih") || null,
      };
      if (isEdit) { body.durum = fd.get("durum"); }
      try {
        if (isEdit) await API.patch(`/punch/${item.id}`, body);
        else        await API.post("/punch", body);
        UI.toast(isEdit ? "Güncellendi" : "Madde eklendi", "success");
        UI.closeModal();
        items = await API.get("/punch");
        _renderOzet();
        _renderList();
      } catch (err) {
        document.getElementById("pl-form-err").textContent = err.message;
      }
    };
  }

  return { load };
})();

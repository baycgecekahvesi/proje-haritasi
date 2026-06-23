// ===================== RİSK KAYIT DEFTERİ & ISI HARİTASI =====================
const Risks = (() => {

  const KATEGORI = {
    teknik:   { label: "Teknik",     renk: "#6366f1" },
    mali:     { label: "Mali",       renk: "#f59e0b" },
    zaman:    { label: "Zaman",      renk: "#ef4444" },
    kaynak:   { label: "Kaynak",     renk: "#8b5cf6" },
    dis:      { label: "Dış Etken",  renk: "#0ea5e9" },
    guvenlik: { label: "Güvenlik",   renk: "#dc2626" },
  };

  const DURUM = {
    acik:      { label: "Açık",         renk: "#ef4444" },
    izleniyor: { label: "İzleniyor",    renk: "#f59e0b" },
    azaltildi: { label: "Azaltıldı",    renk: "#10b981" },
    kapandi:   { label: "Kapandı",      renk: "#94a3b8" },
    realize:   { label: "Gerçekleşti",  renk: "#dc2626" },
  };

  const SEVİYE = {
    kritik:  { label: "Kritik",   renk: "#dc2626", bg: "#fef2f2" },
    yuksek:  { label: "Yüksek",   renk: "#ea580c", bg: "#fff7ed" },
    orta:    { label: "Orta",     renk: "#ca8a04", bg: "#fefce8" },
    dusuk:   { label: "Düşük",    renk: "#16a34a", bg: "#f0fdf4" },
  };

  const OLASILIK_LBL = ["", "Çok Düşük", "Düşük", "Orta", "Yüksek", "Çok Yüksek"];
  const ETKİ_LBL     = ["", "Önemsiz", "Düşük", "Orta", "Yüksek", "Kritik"];

  let tümRiskler = [];
  let projeler   = [];
  let heatmapChart = null;

  // ── Load ────────────────────────────────────────────────────────────────────
  async function load() {
    const panel = document.getElementById("panel-risks");
    if (!panel) return;

    try { projeler = (await API.get("/projects/")).items || await API.get("/projects/"); } catch { projeler = []; }
    try { tümRiskler = await API.get("/risks"); } catch { tümRiskler = []; }

    _render(panel);
  }

  function _render(panel) {
    const editor = Auth.isEditor();
    const projeOpts = `<option value="">Tüm projeler</option>` +
      projeler.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("");

    panel.innerHTML = `
      <div class="rk-layout">

        <!-- BAŞLIK -->
        <div class="rk-header">
          <div>
            <h2 class="rk-title">⚠️ Risk Kayıt Defteri</h2>
            <p class="rk-sub">Proje risklerini olasılık × etki skoruyla kayıt altına al, izle ve azalt.</p>
          </div>
          <div class="rk-header-right">
            <div class="rk-ozet-chips" id="rk-ozet-chips"></div>
            ${editor ? `<button class="btn btn-primary" id="rk-yeni-btn">+ Yeni Risk</button>` : ""}
          </div>
        </div>

        <!-- GÖRÜNÜM SEÇICI -->
        <div class="rk-view-bar">
          <div class="rk-filtreler">
            <select id="rk-fil-proje" class="rk-fil">${projeOpts}</select>
            <select id="rk-fil-durum" class="rk-fil">
              <option value="">Tüm durumlar</option>
              ${Object.entries(DURUM).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
            </select>
            <select id="rk-fil-kategori" class="rk-fil">
              <option value="">Tüm kategoriler</option>
              ${Object.entries(KATEGORI).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
            </select>
            <select id="rk-fil-seviye" class="rk-fil">
              <option value="">Tüm seviyeler</option>
              ${Object.entries(SEVİYE).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("")}
            </select>
          </div>
          <div class="rk-vtabs">
            <button class="rk-vtab active" data-view="liste">📋 Liste</button>
            <button class="rk-vtab" data-view="heatmap">🔥 Isı Haritası</button>
          </div>
        </div>

        <div id="rk-view"></div>
      </div>`;

    if (editor) document.getElementById("rk-yeni-btn").onclick = () => openForm();

    ["rk-fil-proje","rk-fil-durum","rk-fil-kategori","rk-fil-seviye"].forEach(id => {
      document.getElementById(id).addEventListener("change", () => _switchView(_aktifView()));
    });

    panel.querySelectorAll(".rk-vtab").forEach(b => {
      b.addEventListener("click", () => {
        panel.querySelectorAll(".rk-vtab").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        _switchView(b.dataset.view);
      });
    });

    _renderOzet();
    _switchView("liste");
  }

  function _aktifView() {
    const btn = document.querySelector(".rk-vtab.active");
    return btn ? btn.dataset.view : "liste";
  }

  function _filtrele() {
    const projeId  = +document.getElementById("rk-fil-proje")?.value || 0;
    const durum    = document.getElementById("rk-fil-durum")?.value || "";
    const kategori = document.getElementById("rk-fil-kategori")?.value || "";
    const seviye   = document.getElementById("rk-fil-seviye")?.value || "";
    return tümRiskler.filter(r => {
      if (projeId  && r.proje_id !== projeId)     return false;
      if (durum    && r.durum    !== durum)        return false;
      if (kategori && r.kategori !== kategori)     return false;
      if (seviye   && r.seviye   !== seviye)       return false;
      return true;
    });
  }

  function _renderOzet() {
    const el = document.getElementById("rk-ozet-chips");
    if (!el) return;
    const aktif = tümRiskler.filter(r => r.durum !== "kapandi");
    const sayac = { kritik: 0, yuksek: 0, orta: 0, dusuk: 0 };
    aktif.forEach(r => { if (sayac[r.seviye] !== undefined) sayac[r.seviye]++; });
    el.innerHTML = Object.entries(sayac).map(([k, n]) =>
      `<span class="rk-chip" style="background:${SEVİYE[k].bg};color:${SEVİYE[k].renk};border-color:${SEVİYE[k].renk}44">
        ${SEVİYE[k].label}: <strong>${n}</strong>
      </span>`
    ).join("");
  }

  function _switchView(view) {
    const wrap = document.getElementById("rk-view");
    if (!wrap) return;
    if (view === "heatmap") _renderHeatmap(wrap);
    else                    _renderListe(wrap);
  }

  // ── Liste Görünümü ───────────────────────────────────────────────────────────
  function _renderListe(wrap) {
    const liste = _filtrele();
    if (!liste.length) {
      wrap.innerHTML = `<p class="muted" style="padding:32px;text-align:center">Risk bulunamadı. ${Auth.isEditor() ? "Yeni risk ekleyin." : ""}</p>`;
      return;
    }
    const editor = Auth.isEditor();
    wrap.innerHTML = `
      <div class="rk-tablo-wrap">
        <table class="rk-tablo">
          <thead><tr>
            <th>Risk</th><th>Kategori</th>
            <th title="Olasılık">O</th><th title="Etki">E</th>
            <th>Skor</th><th>Seviye</th>
            <th>Durum</th><th>Sorumlu</th><th>Hedef Tarih</th>
            ${editor ? "<th></th>" : ""}
          </tr></thead>
          <tbody>
            ${liste.map(r => _satırHtml(r, editor)).join("")}
          </tbody>
        </table>
      </div>`;

    wrap.querySelectorAll("[data-rk-id]").forEach(el =>
      el.addEventListener("click", () => openDetail(+el.dataset.rkId))
    );
    if (editor) {
      wrap.querySelectorAll("[data-rk-del]").forEach(el =>
        el.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Bu risk silinecek. Emin misiniz?")) return;
          await API.del(`/risks/${el.dataset.rkDel}`);
          tümRiskler = tümRiskler.filter(r => r.id !== +el.dataset.rkDel);
          _renderOzet();
          _renderListe(wrap);
        })
      );
    }
  }

  function _satırHtml(r, editor) {
    const s = SEVİYE[r.seviye] || SEVİYE.dusuk;
    const d = DURUM[r.durum]   || DURUM.acik;
    const k = KATEGORI[r.kategori] || KATEGORI.teknik;
    return `<tr class="rk-satir" data-rk-id="${r.id}">
      <td class="rk-baslik-cell">
        <span class="rk-baslik">${UI.esc(r.baslik)}</span>
        <span class="rk-proje-lbl">${UI.esc(r.proje_adi)}</span>
      </td>
      <td><span class="rk-chip" style="background:${k.renk}18;color:${k.renk};border-color:${k.renk}33">${k.label}</span></td>
      <td class="rk-num">${r.olasilik}</td>
      <td class="rk-num">${r.etki}</td>
      <td><span class="rk-skor" style="background:${s.bg};color:${s.renk}">${r.skor}</span></td>
      <td><span class="rk-chip" style="background:${s.bg};color:${s.renk};border-color:${s.renk}44">${s.label}</span></td>
      <td><span class="rk-chip" style="background:${d.renk}18;color:${d.renk};border-color:${d.renk}33">${d.label}</span></td>
      <td>${UI.esc(r.sorumlu_username || "—")}</td>
      <td>${UI.fmtDate(r.hedef_tarih) || "—"}</td>
      ${editor ? `<td><button class="btn btn-sm btn-ghost" data-rk-del="${r.id}" title="Sil">✕</button></td>` : ""}
    </tr>`;
  }

  // ── Isı Haritası ─────────────────────────────────────────────────────────────
  function _renderHeatmap(wrap) {
    wrap.innerHTML = `
      <div class="rk-hm-wrap">
        <div class="rk-hm-left">
          <div class="rk-hm-title">Risk Isı Haritası</div>
          <div class="rk-hm-sub">Her nokta bir riski temsil eder. X=Olasılık, Y=Etki (1–5)</div>
          <canvas id="rk-hm-canvas" width="420" height="380"></canvas>
        </div>
        <div class="rk-hm-right">
          <div class="rk-hm-legend">
            <div class="rk-hm-leg-title">Seviye</div>
            ${Object.entries(SEVİYE).map(([,v]) =>
              `<div class="rk-hm-leg-item">
                <span class="rk-hm-leg-dot" style="background:${v.renk}"></span>${v.label}
              </div>`
            ).join("")}
          </div>
          <div class="rk-hm-listesi" id="rk-hm-listesi">
            <div class="rk-hm-leg-title" style="margin-bottom:8px">Aktif Riskler</div>
            ${_filtrele().filter(r => r.durum !== "kapandi").map(r => {
              const s = SEVİYE[r.seviye] || SEVİYE.dusuk;
              return `<div class="rk-hm-item" data-rk-id="${r.id}" style="border-left:3px solid ${s.renk}">
                <span class="rk-baslik" style="font-size:12px">${UI.esc(r.baslik)}</span>
                <span class="rk-skor" style="background:${s.bg};color:${s.renk};font-size:11px">${r.skor}</span>
              </div>`;
            }).join("") || `<p class="muted" style="font-size:12px">Risk yok</p>`}
          </div>
        </div>
      </div>`;

    wrap.querySelectorAll("[data-rk-id]").forEach(el =>
      el.addEventListener("click", () => openDetail(+el.dataset.rkId))
    );

    _buildHeatmapChart();
  }

  function _buildHeatmapChart() {
    const canvas = document.getElementById("rk-hm-canvas");
    if (!canvas) return;
    if (heatmapChart) { heatmapChart.destroy(); heatmapChart = null; }

    const aktif = _filtrele().filter(r => r.durum !== "kapandi");

    // Arka plan renk bölgeleri (5×5 grid)
    const bgPlugin = {
      id: "hmBg",
      beforeDraw(chart) {
        const { ctx, chartArea: { left, top, right, bottom } } = chart;
        const w = (right - left) / 5, h = (bottom - top) / 5;
        const colors = [
          ["#d1fae5","#d1fae5","#fef9c3","#fed7aa","#fecaca"],
          ["#d1fae5","#fef9c3","#fef9c3","#fed7aa","#fecaca"],
          ["#fef9c3","#fef9c3","#fed7aa","#fecaca","#fecaca"],
          ["#fed7aa","#fed7aa","#fecaca","#fecaca","#fee2e2"],
          ["#fecaca","#fecaca","#fee2e2","#fee2e2","#fee2e2"],
        ];
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            ctx.fillStyle = colors[4 - row][col];
            ctx.fillRect(left + col * w, top + row * h, w, h);
          }
        }
      }
    };

    const datasets = aktif.map(r => {
      const s = SEVİYE[r.seviye] || SEVİYE.dusuk;
      return {
        label: r.baslik,
        data: [{ x: r.olasilik, y: r.etki, r: 10 + r.skor }],
        backgroundColor: s.renk + "cc",
        borderColor: s.renk,
        borderWidth: 2,
      };
    });

    heatmapChart = new Chart(canvas, {
      type: "bubble",
      plugins: [bgPlugin],
      data: { datasets },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const r = aktif[ctx.datasetIndex];
                return [`${r.baslik}`, `Olasılık: ${r.olasilik} (${OLASILIK_LBL[r.olasilik]})`,
                        `Etki: ${r.etki} (${ETKİ_LBL[r.etki]})`, `Skor: ${r.skor}`];
              }
            }
          }
        },
        scales: {
          x: {
            min: 0.5, max: 5.5, ticks: { stepSize: 1,
              callback: v => OLASILIK_LBL[v] || v },
            title: { display: true, text: "Olasılık →" }
          },
          y: {
            min: 0.5, max: 5.5, ticks: { stepSize: 1,
              callback: v => ETKİ_LBL[v] || v },
            title: { display: true, text: "Etki →" }
          }
        },
        onClick(e, els) {
          if (els.length) openDetail(aktif[els[0].datasetIndex].id);
        }
      }
    });
  }

  // ── Detay Modal ──────────────────────────────────────────────────────────────
  function openDetail(id) {
    const r = tümRiskler.find(x => x.id === id);
    if (!r) return;
    const s = SEVİYE[r.seviye] || SEVİYE.dusuk;
    const d = DURUM[r.durum]   || DURUM.acik;
    const k = KATEGORI[r.kategori] || KATEGORI.teknik;
    const editor = Auth.isEditor();
    UI.openModal(`
      <h3>${UI.esc(r.baslik)}</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
        <span class="rk-chip" style="background:${s.bg};color:${s.renk};border-color:${s.renk}44">Skor: ${r.skor} — ${s.label}</span>
        <span class="rk-chip" style="background:${k.renk}18;color:${k.renk};border-color:${k.renk}33">${k.label}</span>
        <span class="rk-chip" style="background:${d.renk}18;color:${d.renk};border-color:${d.renk}33">${d.label}</span>
        <span class="pill">📋 ${UI.esc(r.proje_adi)}</span>
      </div>
      <div class="rk-detail-grid">
        <div><span class="muted">Olasılık</span><strong>${r.olasilik}/5 — ${OLASILIK_LBL[r.olasilik]}</strong></div>
        <div><span class="muted">Etki</span><strong>${r.etki}/5 — ${ETKİ_LBL[r.etki]}</strong></div>
        <div><span class="muted">Sorumlu</span><strong>${UI.esc(r.sorumlu_username || "—")}</strong></div>
        <div><span class="muted">Hedef Tarih</span><strong>${UI.fmtDate(r.hedef_tarih) || "—"}</strong></div>
      </div>
      ${r.aciklama ? `<div class="rk-detail-blok"><strong>Risk Açıklaması</strong><p>${UI.esc(r.aciklama)}</p></div>` : ""}
      ${r.mitigasyon ? `<div class="rk-detail-blok" style="border-left-color:#10b981"><strong>Azaltma / Önlem Planı</strong><p>${UI.esc(r.mitigasyon)}</p></div>` : ""}
      ${editor ? `<div class="modal-actions">
        <button class="btn" id="rk-edit-btn">✏️ Düzenle</button>
      </div>` : ""}
    `);
    if (editor) document.getElementById("rk-edit-btn").onclick = () => { UI.closeModal(); openForm(r); };
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  function openForm(risk = null) {
    const isEdit = !!risk;
    const v = (k, d = "") => risk ? (risk[k] ?? d) : d;
    const projeOpts = projeler.map(p =>
      `<option value="${p.id}" ${v("proje_id") === p.id ? "selected" : ""}>${UI.esc(p.name)}</option>`
    ).join("");

    UI.openModal(`
      <h3>${isEdit ? "Riski Düzenle" : "Yeni Risk"}</h3>
      <form id="rk-form">
        <div class="form-row"><label>Proje</label>
          <select name="proje_id" required><option value="">— Seçin —</option>${projeOpts}</select>
        </div>
        <div class="form-row"><label>Risk Başlığı</label>
          <input name="baslik" required value="${UI.esc(v("baslik"))}" />
        </div>
        <div class="form-row"><label>Açıklama</label>
          <textarea name="aciklama" rows="2">${UI.esc(v("aciklama"))}</textarea>
        </div>
        <div class="form-grid">
          <div class="form-row"><label>Kategori</label>
            <select name="kategori">
              ${Object.entries(KATEGORI).map(([k,l]) =>
                `<option value="${k}" ${v("kategori","teknik") === k ? "selected" : ""}>${l.label}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-row"><label>Durum</label>
            <select name="durum">
              ${Object.entries(DURUM).map(([k,l]) =>
                `<option value="${k}" ${v("durum","acik") === k ? "selected" : ""}>${l.label}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-row"><label>Olasılık (1–5)</label>
            <input type="range" name="olasilik" min="1" max="5" value="${v("olasilik",3)}" id="rk-olas-range" />
            <small id="rk-olas-lbl" class="muted">${OLASILIK_LBL[v("olasilik",3)]}</small>
          </div>
          <div class="form-row"><label>Etki (1–5)</label>
            <input type="range" name="etki" min="1" max="5" value="${v("etki",3)}" id="rk-etki-range" />
            <small id="rk-etki-lbl" class="muted">${ETKİ_LBL[v("etki",3)]}</small>
          </div>
          <div class="form-row"><label>Hedef Tarih</label>
            <input type="date" name="hedef_tarih" value="${v("hedef_tarih") || ""}" />
          </div>
        </div>
        <div class="form-row"><label>Azaltma / Önlem Planı</label>
          <textarea name="mitigasyon" rows="3">${UI.esc(v("mitigasyon"))}</textarea>
        </div>
        <div class="form-error" id="rk-form-err"></div>
        <div class="modal-actions">
          <button type="button" class="btn" id="rk-iptal">İptal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Kaydet" : "Ekle"}</button>
        </div>
      </form>
    `);

    document.getElementById("rk-iptal").onclick = () => UI.closeModal();
    document.getElementById("rk-olas-range").oninput = e =>
      document.getElementById("rk-olas-lbl").textContent = OLASILIK_LBL[+e.target.value];
    document.getElementById("rk-etki-range").oninput = e =>
      document.getElementById("rk-etki-lbl").textContent = ETKİ_LBL[+e.target.value];

    document.getElementById("rk-form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        proje_id:     +fd.get("proje_id"),
        baslik:        fd.get("baslik"),
        aciklama:      fd.get("aciklama"),
        kategori:      fd.get("kategori"),
        durum:         fd.get("durum"),
        olasilik:     +fd.get("olasilik"),
        etki:         +fd.get("etki"),
        mitigasyon:    fd.get("mitigasyon"),
        hedef_tarih:   fd.get("hedef_tarih") || null,
      };
      try {
        if (isEdit) await API.patch(`/risks/${risk.id}`, body);
        else        await API.post("/risks", body);
        UI.toast(isEdit ? "Risk güncellendi" : "Risk eklendi", "success");
        UI.closeModal();
        tümRiskler = await API.get("/risks");
        _renderOzet();
        _switchView(_aktifView());
      } catch (err) {
        document.getElementById("rk-form-err").textContent = err.message;
      }
    };
  }

  return { load };
})();

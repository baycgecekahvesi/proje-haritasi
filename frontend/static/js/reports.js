// ===================== RAPORLAR =====================
const Reports = (() => {
  const charts = {};
  let activeTab = "genel";
  let scurveChart = null;

  const STATUS_COLOR = {
    aktif: "#4f6ef7", beklemede: "#f39c12",
    tamamlandi: "#27ae60", iptal: "#95a5a6",
  };

  // ─── Stat bar ────────────────────────────────────────
  async function renderStatBar() {
    const s = await API.get("/reports/summary");
    const bar = document.getElementById("stat-bar");
    bar.innerHTML = [
      ["Toplam Proje",   s.total_projects,     "accent-blue"],
      ["Aktif",          s.active_projects,     ""],
      ["Tamamlanan",     s.completed_projects,  "accent-green"],
      ["Geciken",        s.delayed_projects,    "accent-red"],
      ["Beklemede",      s.pending_projects,    ""],
      ["Ort. İlerleme",  `%${s.avg_progress}`,  ""],
    ].map(([label, num, cls]) => `
      <div class="stat-card ${cls}">
        <div class="num">${num}</div>
        <div class="label">${label}</div>
      </div>`).join("");
  }

  // ─── Ana render ──────────────────────────────────────
  async function renderCharts() {
    const panel = document.getElementById("panel-reports");
    panel.innerHTML = `
      <div class="rp-layout">
        <div class="rp-tabs">
          <button class="rp-tab ${activeTab==="genel"?"active":""}"    data-rp="genel">📊 Genel Bakış</button>
          <button class="rp-tab ${activeTab==="butce"?"active":""}"    data-rp="butce">💰 Bütçe</button>
          <button class="rp-tab ${activeTab==="zaman"?"active":""}"    data-rp="zaman">📅 Zaman & Gecikmeler</button>
          <button class="rp-tab ${activeTab==="gantt"?"active":""}"    data-rp="gantt">📐 Gantt</button>
          <button class="rp-tab ${activeTab==="scurve"?"active":""}"  data-rp="scurve">📈 S-Eğrisi</button>
        </div>
        <div class="rp-export-bar">
          <button class="btn btn-sm" id="rp-export-excel">⬇️ Excel İndir</button>
          <button class="btn btn-sm" id="rp-export-pdf">⬇️ PDF İndir</button>
        </div>
        <div id="rp-body" class="rp-body"></div>
      </div>`;

    panel.querySelectorAll(".rp-tab").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.rp;
        panel.querySelectorAll(".rp-tab").forEach(b => b.classList.toggle("active", b.dataset.rp === activeTab));
        _loadTab();
      };
    });

    document.getElementById("rp-export-excel").addEventListener("click", () => {
      _downloadFile("/api/reports/export/excel", "projeler-ozet.xlsx", API.getToken());
    });

    document.getElementById("rp-export-pdf").addEventListener("click", () => {
      _downloadFile("/api/reports/export/pdf", "projeler-ozet.pdf", API.getToken());
    });

    _loadTab();
  }

  function _loadTab() {
    _destroyAll();
    if (activeTab === "genel")  _renderGenel();
    if (activeTab === "butce")  _renderButce();
    if (activeTab === "zaman")  _renderZaman();
    if (activeTab === "gantt")  _renderGantt();
    if (activeTab === "scurve") _renderSCurve();
  }

  function _destroyAll() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(_) {} });
    Object.keys(charts).forEach(k => delete charts[k]);
  }

  // ══════════════════════════════════════════════════════
  // GENEL BAKIŞ
  // ══════════════════════════════════════════════════════
  async function _renderGenel() {
    document.getElementById("rp-body").innerHTML = `
      <div class="rp-grid">
        <div class="rp-card"><h3>Durum Dağılımı</h3><div class="rp-chart-wrap"><canvas id="ch-status"></canvas></div></div>
        <div class="rp-card"><h3>İlerleme Dağılımı</h3><div class="rp-chart-wrap"><canvas id="ch-progress"></canvas></div></div>
        <div class="rp-card wide"><h3>İl Bazlı Proje Sayısı</h3><div class="rp-chart-wrap tall"><canvas id="ch-province"></canvas></div></div>
        <div class="rp-card wide"><h3>Aylık Aktivite (Son 12 Ay)</h3><div class="rp-chart-wrap"><canvas id="ch-monthly"></canvas></div></div>
      </div>`;

    const [distData, buckets, provinceData, monthly] = await Promise.all([
      API.get("/reports/status-distribution"),
      API.get("/reports/progress-buckets"),
      API.get("/reports/by-province"),
      API.get("/reports/monthly-activity"),
    ]);

    charts.status = new Chart(document.getElementById("ch-status"), {
      type: "doughnut",
      data: {
        labels: distData.map(d => `${d.label} (%${d.pct})`),
        datasets: [{ data: distData.map(d => d.count), backgroundColor: distData.map(d => STATUS_COLOR[d.status] || "#95a5a6"), borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} proje` } },
        },
      },
    });

    charts.progress = new Chart(document.getElementById("ch-progress"), {
      type: "bar",
      data: {
        labels: buckets.map(b => b.label),
        datasets: [{ label: "Proje Sayısı", data: buckets.map(b => b.count), backgroundColor: ["#e74c3c","#f39c12","#f1c40f","#2ecc71","#27ae60"], borderRadius: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    const topProv = provinceData.slice(0, 15);
    charts.province = new Chart(document.getElementById("ch-province"), {
      type: "bar",
      data: {
        labels: topProv.map(d => d.province),
        datasets: [
          { label: "Proje Sayısı", data: topProv.map(d => d.project_count), backgroundColor: "#4f6ef7", borderRadius: 4, yAxisID: "y" },
          { label: "Ort. İlerleme (%)", data: topProv.map(d => d.avg_progress), backgroundColor: "rgba(39,174,96,.25)", borderColor: "#27ae60", borderWidth: 2, type: "line", yAxisID: "y2", tension: 0.3, pointRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: {
          y:  { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Proje Sayısı", font: { size: 11 } } },
          y2: { beginAtZero: true, max: 100, position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "İlerleme %", font: { size: 11 } } },
        },
      },
    });

    charts.monthly = new Chart(document.getElementById("ch-monthly"), {
      type: "bar",
      data: {
        labels: monthly.map(m => m.month),
        datasets: [
          { label: "Başlanan",    data: monthly.map(m => m.started),   backgroundColor: "#4f6ef7", borderRadius: 4 },
          { label: "Tamamlanan",  data: monthly.map(m => m.completed), backgroundColor: "#27ae60", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { maxRotation: 45, font: { size: 10 } } } },
      },
    });
  }

  // ══════════════════════════════════════════════════════
  // BÜTÇE
  // ══════════════════════════════════════════════════════
  async function _renderButce() {
    document.getElementById("rp-body").innerHTML = `
      <div class="rp-grid">
        <div class="rp-card"><h3>Genel Bütçe Kullanımı</h3><div class="rp-chart-wrap"><canvas id="ch-budget"></canvas></div></div>
        <div class="rp-card">
          <h3>Bütçe Özeti</h3>
          <div id="budget-kpi" class="rp-kpi-list"></div>
        </div>
        <div class="rp-card wide"><h3>İl Bazlı Bütçe (Planlanan vs Harcanan)</h3><div class="rp-chart-wrap tall"><canvas id="ch-bud-prov"></canvas></div></div>
        <div class="rp-card wide">
          <h3>⚠️ Bütçe Aşan Projeler</h3>
          <div id="over-budget-list"></div>
        </div>
      </div>`;

    const [bud, byProv] = await Promise.all([
      API.get("/reports/budget-overview"),
      API.get("/reports/budget-by-province"),
    ]);

    // Genel pasta
    const spent = Number(bud.total_spent);
    const remaining = Math.max(Number(bud.total_remaining), 0);
    charts.budget = new Chart(document.getElementById("ch-budget"), {
      type: "doughnut",
      data: {
        labels: ["Harcanan", "Kalan"],
        datasets: [{ data: [spent, remaining], backgroundColor: ["#e74c3c", "#27ae60"], borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${UI.fmtMoney(c.raw)} ₺ (%${bud.usage_percent})` } },
        },
      },
    });

    // KPI listesi
    document.getElementById("budget-kpi").innerHTML = [
      ["Toplam Planlanan",  `${UI.fmtMoney(bud.total_planned)} ₺`,   ""],
      ["Toplam Harcanan",   `${UI.fmtMoney(bud.total_spent)} ₺`,     "accent-red"],
      ["Kalan Bütçe",       `${UI.fmtMoney(bud.total_remaining)} ₺`, "accent-green"],
      ["Kullanım Oranı",    `%${bud.usage_percent}`,                  bud.usage_percent > 90 ? "accent-red" : ""],
      ["Bütçe Aşan Proje",  `${bud.over_budget_count} proje`,        bud.over_budget_count ? "accent-red" : "accent-green"],
    ].map(([label, val, cls]) => `
      <div class="rp-kpi-row ${cls}">
        <span>${label}</span><strong>${val}</strong>
      </div>`).join("");

    // İl bazlı stacked bar
    const top = byProv.slice(0, 12);
    charts.budProv = new Chart(document.getElementById("ch-bud-prov"), {
      type: "bar",
      data: {
        labels: top.map(r => r.province),
        datasets: [
          { label: "Harcanan",   data: top.map(r => Number(r.spent)),   backgroundColor: "#e74c3c", borderRadius: 4 },
          { label: "Planlanan",  data: top.map(r => Number(r.planned)), backgroundColor: "rgba(79,110,247,.3)", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: { y: { beginAtZero: true, title: { display: true, text: "₺", font: { size: 11 } } }, x: { ticks: { maxRotation: 45, font: { size: 10 } } } },
      },
    });

    // Bütçe aşan tablo
    const box = document.getElementById("over-budget-list");
    if (!bud.over_budget_projects.length) {
      box.innerHTML = `<p class="muted" style="padding:16px">Bütçe aşan proje bulunmuyor. ✅</p>`;
    } else {
      box.innerHTML = `<table class="rp-table">
        <thead><tr><th>Proje</th><th>Planlanan</th><th>Harcanan</th><th>Aşım</th><th>Aşım %</th></tr></thead>
        <tbody>${bud.over_budget_projects.map(p => {
          const pct = p.planned_amount > 0 ? (Number(p.overage) / Number(p.planned_amount) * 100).toFixed(1) : "—";
          return `<tr>
            <td>${UI.esc(p.project_name)}</td>
            <td>${UI.fmtMoney(p.planned_amount)} ${p.currency}</td>
            <td>${UI.fmtMoney(p.spent)} ${p.currency}</td>
            <td style="color:#e74c3c;font-weight:600">+${UI.fmtMoney(p.overage)} ${p.currency}</td>
            <td><span class="rp-badge danger">%${pct}</span></td>
          </tr>`;
        }).join("")}</tbody>
      </table>`;
    }
  }

  // ══════════════════════════════════════════════════════
  // ZAMAN & GECİKMELER
  // ══════════════════════════════════════════════════════
  async function _renderZaman() {
    document.getElementById("rp-body").innerHTML = `
      <div class="rp-grid">
        <div class="rp-card wide">
          <h3>Geciken Projeler</h3>
          <div id="rp-timeline"></div>
        </div>
        <div class="rp-card wide">
          <h3>Tüm Projeler — Durum & İlerleme</h3>
          <div id="rp-all-progress"></div>
        </div>
      </div>`;

    const [items, all] = await Promise.all([
      API.get("/reports/timeline"),
      API.get("/reports/by-province"),
    ]);

    // Geciken projeler
    const tlBox = document.getElementById("rp-timeline");
    if (!items.length) {
      tlBox.innerHTML = `<p class="muted" style="padding:16px 0">Geciken proje yok. 🎉</p>`;
    } else {
      tlBox.innerHTML = `<table class="rp-table">
        <thead><tr><th>Proje</th><th>İl</th><th>Durum</th><th>Planlanan Bitiş</th><th>Gecikme</th><th>İlerleme</th></tr></thead>
        <tbody>${items.map(t => `<tr>
          <td>${UI.esc(t.project_name)}</td>
          <td><span class="pill">${UI.esc(t.province)}</span></td>
          <td><span class="badge" style="background:${STATUS_COLOR[t.status]||"#aaa"}">${UI.esc(t.status_display)}</span></td>
          <td>${UI.fmtDate(t.planned_end)}</td>
          <td><span class="rp-badge danger">${t.delay_days ? t.delay_days + " gün" : "Gecikmede"}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="rp-prog-wrap"><div class="rp-prog-bar" style="width:${t.progress}%"></div></div>
              <span style="font-size:12px;width:32px">%${t.progress}</span>
            </div>
          </td>
        </tr>`).join("")}</tbody>
      </table>`;
    }

    // Tüm il ilerleme tablosu
    const allBox = document.getElementById("rp-all-progress");
    allBox.innerHTML = `<table class="rp-table">
      <thead><tr><th>İl</th><th>Proje Sayısı</th><th>Ort. İlerleme</th><th></th></tr></thead>
      <tbody>${all.map(r => `<tr>
        <td>${UI.esc(r.province)}</td>
        <td>${r.project_count}</td>
        <td>%${r.avg_progress}</td>
        <td style="width:200px">
          <div class="rp-prog-wrap">
            <div class="rp-prog-bar" style="width:${r.avg_progress}%;background:${r.avg_progress >= 75 ? "#27ae60" : r.avg_progress >= 40 ? "#f39c12" : "#e74c3c"}"></div>
          </div>
        </td>
      </tr>`).join("")}</tbody>
    </table>`;
  }

  // ══════════════════════════════════════════════════════
  // GANTT
  // ══════════════════════════════════════════════════════
  async function _renderGantt() {
    const box = document.getElementById("rp-body");
    box.innerHTML = `
      <div class="rp-grid">
        <div class="rp-card wide">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="margin:0">Gantt Şeması — Proje Takvimi</h3>
            <button class="btn btn-ghost btn-sm" onclick="Reports.renderCharts()">↻ Yenile</button>
          </div>
          <div id="gantt-container" class="gantt-wrap"></div>
        </div>
      </div>`;
    await _drawGantt();
  }

  async function _drawGantt() {
    const container = document.getElementById("gantt-container");
    container.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let items = [];
    try { items = await API.get("/reports/gantt"); } catch (_) {}
    if (!items.length) { container.innerHTML = `<p class="muted">Tarih girilmiş proje bulunmuyor.</p>`; return; }

    const allDates = items.flatMap(p => [
      p.planned_start && new Date(p.planned_start),
      p.planned_end   && new Date(p.planned_end),
    ]).filter(Boolean);
    const minMs  = Math.min(...allDates.map(d => d.getTime()));
    const maxMs  = Math.max(...allDates.map(d => d.getTime()));
    const rangeMs = maxMs - minMs || 1;
    const today   = Date.now();

    const pct = ds => (((new Date(ds).getTime() - minMs) / rangeMs) * 100).toFixed(2);
    const wPct = (s, e) => (((new Date(e) - new Date(s)) / rangeMs) * 100).toFixed(2);

    // Ay ekseni
    const ticks = [];
    const cur = new Date(new Date(minMs).getFullYear(), new Date(minMs).getMonth(), 1);
    while (cur.getTime() <= maxMs) {
      ticks.push({ left: pct(cur.toISOString()), label: cur.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }) });
      cur.setMonth(cur.getMonth() + 1);
    }
    // Bugün çizgisi
    const todayPct = Math.max(0, Math.min(100, ((today - minMs) / rangeMs) * 100)).toFixed(2);

    const rowsHtml = items.map(p => {
      const color = p.is_delayed ? "#e74c3c" : (STATUS_COLOR[p.status] || "#95a5a6");
      return `
        <div class="gantt-row">
          <div class="gantt-label" title="${UI.esc(p.project_name)}">${UI.esc(p.project_name)}</div>
          <div class="gantt-track">
            <div class="gantt-bar" style="left:${pct(p.planned_start)}%;width:${wPct(p.planned_start,p.planned_end)}%;background:${color}"
                 title="${UI.esc(p.project_name)} · ${p.province} · %${p.progress}">
              <div class="gantt-progress" style="width:${p.progress}%"></div>
            </div>
            ${p.actual_start && p.actual_end ? `<div class="gantt-actual" style="left:${pct(p.actual_start)}%;width:${wPct(p.actual_start,p.actual_end)}%"></div>` : ""}
          </div>
          <div class="gantt-pct">%${p.progress}</div>
        </div>`;
    }).join("");

    container.innerHTML = `
      <div class="gantt-axis">${ticks.map(t => `<span class="gantt-tick" style="left:${t.left}%">${t.label}</span>`).join("")}</div>
      <div class="gantt-today" style="left:${todayPct}%" title="Bugün"></div>
      ${rowsHtml}
      <div class="rp-gantt-legend">
        <span><i style="background:#4f6ef7"></i> Aktif</span>
        <span><i style="background:#f39c12"></i> Beklemede</span>
        <span><i style="background:#27ae60"></i> Tamamlandı</span>
        <span><i style="background:#e74c3c"></i> Gecikmeli</span>
        <span><i style="background:rgba(0,0,0,.15);border:1px dashed #999"></i> Gerçekleşen</span>
      </div>`;
  }

  // ══════════════════════════════════════════════════════
  // S-EĞRİSİ
  // ══════════════════════════════════════════════════════
  async function _renderSCurve() {
    const body = document.getElementById("rp-body");
    // Proje seçici
    let projects = [];
    try { const d = await API.get("/projects/?page=1"); projects = d.items || d; } catch { projects = []; }

    body.innerHTML = `
      <div class="rp-card wide">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <h3 style="margin:0">S-Eğrisi — Planlanan vs Gerçekleşen</h3>
          <select id="sc-project-sel" style="flex:1;max-width:300px">
            <option value="">— Proje seçin —</option>
            ${projects.map(p => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join("")}
          </select>
        </div>
        <div class="rp-chart-wrap tall"><canvas id="ch-scurve"></canvas></div>
        <p id="sc-msg" class="muted" style="text-align:center;margin-top:8px">Proje seçin</p>
      </div>
    `;

    document.getElementById("sc-project-sel").onchange = async (e) => {
      const pid = e.target.value;
      if (!pid) return;
      const msg = document.getElementById("sc-msg");
      msg.textContent = "Yükleniyor…";
      try {
        const data = await API.get(`/reports/projects/${pid}/s-curve`);
        if (!data.length) { msg.textContent = "Bu proje için tarih verisi yok."; return; }
        msg.textContent = "";
        if (charts.scurve) { charts.scurve.destroy(); delete charts.scurve; }
        charts.scurve = new Chart(document.getElementById("ch-scurve"), {
          type: "line",
          data: {
            labels: data.map(d => d.week),
            datasets: [
              { label: "Planlanan %", data: data.map(d => d.planned_pct), borderColor: "#4f6ef7", backgroundColor: "rgba(79,110,247,.1)", tension: 0.4, fill: true, pointRadius: 3 },
              { label: "Gerçekleşen %", data: data.map(d => d.actual_pct), borderColor: "#27ae60", backgroundColor: "rgba(39,174,96,.1)", tension: 0.4, fill: true, pointRadius: 3, spanGaps: false },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } } },
            scales: {
              y: { beginAtZero: true, max: 100, title: { display: true, text: "İlerleme (%)" } },
              x: { ticks: { maxRotation: 45, font: { size: 10 } } },
            },
          },
        });
      } catch (err) { msg.textContent = `Hata: ${UI.esc(err.message)}`; }
    };
  }

  async function _downloadFile(url, filename, token) {
    try {
      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) { UI.toast("İndirme başarısız", "error"); return; }
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (_) { UI.toast("İndirme hatası", "error"); }
  }

  return { renderStatBar, renderCharts };
})();

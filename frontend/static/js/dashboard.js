// ===================== KPI DASHBOARD =====================
const Dashboard = (() => {
  let charts = {};

  async function load() {
    const panel = document.getElementById("panel-dashboard");
    if (!panel) return;

    panel.innerHTML = `<div class="db-wrap"><p class="muted">Yükleniyor…</p></div>`;

    let kpi;
    try {
      kpi = await API.get("/reports/dashboard/kpi");
    } catch (err) {
      panel.innerHTML = `<p class="muted" style="padding:24px">KPI verisi alınamadı: ${UI.esc(err.message)}</p>`;
      return;
    }

    // Destroy old charts
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(_) {} });
    charts = {};

    const usagePct = kpi.butce_kullanim_orani || 0;
    const usageColor = usagePct > 90 ? "#e74c3c" : usagePct > 70 ? "#f39c12" : "#27ae60";

    panel.innerHTML = `
      <div class="db-wrap">
        <h2 class="db-title">KPI Dashboard</h2>

        <!-- KPI Kartları -->
        <div class="db-kpi-grid">
          ${_kpiCard("Toplam Proje",      kpi.toplam_proje,            "accent-blue", "📋")}
          ${_kpiCard("Aktif",             kpi.aktif_proje,             "",            "▶️")}
          ${_kpiCard("Tamamlanan",        kpi.tamamlanan_proje,        "accent-green","✅")}
          ${_kpiCard("Geciken",           kpi.geciken_proje,           "accent-red",  "⚠️")}
          ${_kpiCard("Ort. İlerleme",     `%${kpi.ort_ilerleme}`,      "",            "📈")}
          ${_kpiCard("Kritik Risk",       kpi.kritik_riskler,          kpi.kritik_riskler > 0 ? "accent-red" : "","🔴")}
          ${_kpiCard("Bu Ay Görev",       kpi.bu_ay_tamamlanan_gorev,  "accent-green","✅")}
          ${_kpiCard("Ort. Gecikme",      `${kpi.ortalama_gecikme_gun} gün`, kpi.ortalama_gecikme_gun > 0 ? "accent-red" : "", "📅")}
        </div>

        <!-- Bütçe özeti -->
        <div class="db-budget-row">
          <div class="db-budget-card">
            <div class="db-budget-label">Toplam Bütçe</div>
            <div class="db-budget-val">${UI.fmtMoney(kpi.toplam_butce)} ₺</div>
          </div>
          <div class="db-budget-card">
            <div class="db-budget-label">Harcanan</div>
            <div class="db-budget-val" style="color:${usageColor}">${UI.fmtMoney(kpi.toplam_harcama)} ₺</div>
          </div>
          <div class="db-budget-card">
            <div class="db-budget-label">Kalan</div>
            <div class="db-budget-val">${UI.fmtMoney(kpi.toplam_kalan)} ₺</div>
          </div>
          <div class="db-budget-card db-budget-pct">
            <div class="db-budget-label">Kullanım</div>
            <div class="db-budget-val" style="color:${usageColor}">%${usagePct}</div>
            <div class="progress" style="margin-top:6px"><span style="width:${Math.min(usagePct,100)}%;background:${usageColor}"></span></div>
          </div>
        </div>

        <!-- Grafikler -->
        <div class="rp-grid" style="margin-top:20px">
          <div class="rp-card"><h3>Proje Durumları</h3><div class="rp-chart-wrap"><canvas id="db-ch-status"></canvas></div></div>
          <div class="rp-card wide"><h3>İl Bazlı Performans (Top 10)</h3><div class="rp-chart-wrap tall"><canvas id="db-ch-province"></canvas></div></div>
        </div>
      </div>
    `;

    // Durum doughnut
    const statusData = [
      { label: "Aktif",      val: kpi.aktif_proje,       color: "#4f6ef7" },
      { label: "Tamamlanan", val: kpi.tamamlanan_proje,  color: "#27ae60" },
      { label: "Geciken",    val: kpi.geciken_proje,      color: "#e74c3c" },
      { label: "Bekleyen",   val: kpi.bekleyen_proje,     color: "#f39c12" },
    ].filter(d => d.val > 0);

    charts.status = new Chart(document.getElementById("db-ch-status"), {
      type: "doughnut",
      data: {
        labels: statusData.map(d => d.label),
        datasets: [{ data: statusData.map(d => d.val), backgroundColor: statusData.map(d => d.color), borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "right", labels: { font: { size: 11 }, boxWidth: 12 } } },
      },
    });

    // İl bazlı bar
    const il = (kpi.il_bazli_performans || []).slice(0, 10);
    charts.province = new Chart(document.getElementById("db-ch-province"), {
      type: "bar",
      data: {
        labels: il.map(r => r.province),
        datasets: [
          { label: "Proje", data: il.map(r => r.proje_sayisi), backgroundColor: "#4f6ef7", borderRadius: 4, yAxisID: "y" },
          { label: "Geciken", data: il.map(r => r.geciken_sayisi), backgroundColor: "#e74c3c", borderRadius: 4, yAxisID: "y" },
          { label: "Ort. İlerleme %", data: il.map(r => r.ort_ilerleme), type: "line", borderColor: "#27ae60", backgroundColor: "rgba(39,174,96,.15)", tension: 0.3, pointRadius: 4, yAxisID: "y2" },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: {
          y:  { beginAtZero: true, ticks: { precision: 0 } },
          y2: { beginAtZero: true, max: 100, position: "right", grid: { drawOnChartArea: false } },
        },
      },
    });
  }

  function _kpiCard(label, value, cls, icon) {
    return `<div class="stat-card ${cls}"><div class="num">${icon} ${value}</div><div class="label">${label}</div></div>`;
  }

  return { load };
})();

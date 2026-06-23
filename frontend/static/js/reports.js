// Raporlar: özet kartları (stat bar), il bazlı bar grafiği, bütçe pasta grafiği, geciken projeler.
const Reports = (() => {
  let provinceChart = null;
  let budgetChart = null;

  async function renderStatBar() {
    const s = await API.get("/reports/summary");
    const bar = document.getElementById("stat-bar");
    bar.innerHTML = [
      ["Toplam Proje", s.total_projects, "accent-blue"],
      ["Aktif", s.active_projects, ""],
      ["Tamamlanan", s.completed_projects, "accent-green"],
      ["Geciken", s.delayed_projects, "accent-red"],
      ["Ort. İlerleme", `%${s.avg_progress}`, ""],
    ].map(([label, num, cls]) => `
      <div class="stat-card ${cls}">
        <div class="num">${num}</div>
        <div class="label">${label}</div>
      </div>`).join("");
  }

  async function renderCharts() {
    await renderProvinceChart();
    await renderBudgetChart();
    await renderTimeline();
    await renderGantt();
  }

  async function renderProvinceChart() {
    const data = await API.get("/reports/by-province");
    const ctx = document.getElementById("chart-province");
    if (provinceChart) provinceChart.destroy();
    provinceChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.province),
        datasets: [{
          label: "Proje Sayısı",
          data: data.map((d) => d.project_count),
          backgroundColor: "#4f6ef7",
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  async function renderBudgetChart() {
    const b = await API.get("/reports/budget-overview");
    const ctx = document.getElementById("chart-budget");
    if (budgetChart) budgetChart.destroy();
    const spent = Number(b.total_spent);
    const remaining = Math.max(Number(b.total_remaining), 0);
    budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Harcanan", "Kalan"],
        datasets: [{
          data: [spent, remaining],
          backgroundColor: ["#e74c3c", "#27ae60"],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (c) => `${c.label}: ${UI.fmtMoney(c.raw)} (%${b.usage_percent} kullanım)`,
            },
          },
        },
      },
    });
  }

  async function renderTimeline() {
    const items = await API.get("/reports/timeline");
    const box = document.getElementById("timeline-list");
    if (!items.length) {
      box.innerHTML = `<p class="muted">Geciken proje yok. 🎉</p>`;
      return;
    }
    box.innerHTML = items.map((t) => `
      <div class="timeline-row">
        <div>
          <strong>${UI.esc(t.project_name)}</strong>
          <span class="pill">📍 ${UI.esc(t.province)}</span>
          <div class="muted" style="font-size:12px">
            Planlanan bitiş: ${UI.fmtDate(t.planned_end)}${t.actual_end ? " · Gerçek: " + UI.fmtDate(t.actual_end) : ""}
          </div>
        </div>
        <div class="delay-flag">${t.delay_days ? t.delay_days + " gün gecikme" : "Gecikmede"}</div>
      </div>`).join("");
  }

  async function renderGantt() {
    const box = document.getElementById("gantt-container");
    box.innerHTML = `<p class="muted">Yükleniyor…</p>`;
    let items = [];
    try { items = await API.get("/reports/gantt"); } catch (e) { /* yoksay */ }
    if (!items.length) {
      box.innerHTML = `<p class="muted">Tarih girilmiş proje bulunmuyor.</p>`;
      return;
    }

    const STATUS_COLOR = {
      aktif: "#4f6ef7", beklemede: "#f39c12",
      tamamlandi: "#27ae60", iptal: "#95a5a6",
    };

    const allDates = items.flatMap((p) => [
      p.planned_start && new Date(p.planned_start),
      p.planned_end && new Date(p.planned_end),
    ]).filter(Boolean);
    const minMs = Math.min(...allDates.map((d) => d.getTime()));
    const maxMs = Math.max(...allDates.map((d) => d.getTime()));
    const rangeMs = maxMs - minMs || 1;

    function pct(dateStr) {
      return (((new Date(dateStr).getTime() - minMs) / rangeMs) * 100).toFixed(2);
    }
    function wPct(start, end) {
      return (((new Date(end) - new Date(start)) / rangeMs) * 100).toFixed(2);
    }

    // Ay ekseni
    const ticks = [];
    const cur = new Date(new Date(minMs).getFullYear(), new Date(minMs).getMonth(), 1);
    while (cur.getTime() <= maxMs) {
      ticks.push({
        left: pct(cur.toISOString()),
        label: cur.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    const axisHtml = `<div class="gantt-axis">${
      ticks.map((t) => `<span class="gantt-tick" style="left:${t.left}%">${t.label}</span>`).join("")
    }</div>`;

    const rowsHtml = items.map((p) => {
      const color = p.is_delayed ? "#e74c3c" : (STATUS_COLOR[p.status] || "#95a5a6");
      const l = pct(p.planned_start);
      const w = wPct(p.planned_start, p.planned_end);
      const tooltip = `${p.project_name} · ${p.province} · %${p.progress}`;
      return `
        <div class="gantt-row">
          <div class="gantt-label" title="${UI.esc(p.project_name)}">${UI.esc(p.project_name)}</div>
          <div class="gantt-track">
            <div class="gantt-bar" style="left:${l}%;width:${w}%;background:${color}" title="${UI.esc(tooltip)}">
              <div class="gantt-progress" style="width:${p.progress}%"></div>
            </div>
          </div>
        </div>`;
    }).join("");

    box.innerHTML = axisHtml + rowsHtml;
  }

  return { renderStatBar, renderCharts };
})();

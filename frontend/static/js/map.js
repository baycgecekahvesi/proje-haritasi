// Türkiye coğrafi il haritası.
// static/img/turkiye.svg dosyasındaki <g data-iladi="..."> grupları
// /api/projects/map verisiyle boyanır. İl adları backend ile birebir eşleşir.
const MapView = (() => {
  const EMPTY = "#dde4f5";
  const SVG_URL = "/static/img/turkiye.svg";

  let onSelectCb = null;
  let selectedTile = null;
  let loaded = false;
  let tooltip = null;

  async function ensureSvg() {
    if (loaded) return true;
    const container = document.getElementById("map-container");
    try {
      const res = await fetch(SVG_URL);
      if (!res.ok) throw new Error("harita yüklenemedi");
      container.innerHTML = await res.text();
    } catch (e) {
      container.innerHTML = `<p class="muted">Harita yüklenemedi.</p>`;
      return false;
    }

    ensureTooltip();
    container.querySelectorAll("svg [data-iladi]").forEach((g) => {
      const name = g.getAttribute("data-iladi");
      g.addEventListener("click", () => selectProvince(name, g));
      g.addEventListener("mouseenter", (e) => showTooltip(g, e));
      g.addEventListener("mousemove", moveTooltip);
      g.addEventListener("mouseleave", hideTooltip);
    });
    loaded = true;
    return true;
  }

  function ensureTooltip() {
    if (tooltip) return;
    tooltip = document.createElement("div");
    tooltip.id = "map-tooltip";
    tooltip.className = "map-tooltip";
    document.body.appendChild(tooltip);
  }

  function paintGroup(g, color, isEmpty) {
    g.querySelectorAll("path, polygon").forEach((el) => {
      el.style.fill = color;
    });
    g.classList.toggle("has-project", !isEmpty);
  }

function selectProvince(name, g) {
    if (selectedTile) selectedTile.classList.remove("selected");
    selectedTile = g;
    g.classList.add("selected");
    onSelectCb && onSelectCb(name);
  }

  async function render() {
    const ok = await ensureSvg();
    if (!ok) return;

    let data = [];
    try { data = await API.get("/projects/map"); } catch (e) { /* yoksay */ }
    const map = {};
    data.forEach((d) => (map[d.province] = d));

    document.querySelectorAll("#map-container svg [data-iladi]").forEach((g) => {
      const name = g.getAttribute("data-iladi");
      const info = map[name];
      if (info && info.project_count > 0) {
        paintGroup(g, info.color, false);
        g.dataset.count = info.project_count;
        g.dataset.avg = info.avg_progress;
        g.dataset.delay = info.has_delay ? "1" : "0";
      } else {
        paintGroup(g, EMPTY, true);
        delete g.dataset.count;
      }
    });

    // Seçili il vurgusunu koru
    if (selectedTile && !selectedTile.classList.contains("selected")) {
      selectedTile.classList.add("selected");
    }
  }

  // ---------------- Tooltip ----------------
  function showTooltip(g, e) {
    const name = g.getAttribute("data-iladi");
    const count = g.dataset.count ? +g.dataset.count : 0;
    let body;
    if (count > 0) {
      const delay = g.dataset.delay === "1"
        ? `<div class="tt-row" style="color:#e74c3c">⚠️ Gecikmeli proje var</div>` : "";
      body = `<div class="tt-row">${count} proje · ort. %${g.dataset.avg || 0}</div>${delay}`;
    } else {
      body = `<div class="tt-row muted">Proje bulunmuyor</div>`;
    }
    tooltip.innerHTML = `<div class="tt-il">${UI.esc(name)}</div>${body}`;
    tooltip.classList.add("visible");
    moveTooltip(e);
  }

  function moveTooltip(e) {
    if (!tooltip) return;
    tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 230) + "px";
    tooltip.style.top = e.clientY - 8 + "px";
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove("visible");
  }

  function onSelect(cb) { onSelectCb = cb; }

  return { render, onSelect };
})();

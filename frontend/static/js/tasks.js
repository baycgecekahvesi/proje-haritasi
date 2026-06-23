// ===================== GÖREV TAKİP =====================
const GorevTakip = (() => {
  let gorevler = [];
  let aktifGorunum = "kanban";
  let aktifRol = "HEPSI";
  let aktifFaz = "HEPSI";
  let aramaMetni = "";
  let secilenGorev = null;
  let kritikYolSet = new Set();

  const ROLLER = [
    { id: "ELK",   adi: "Elektrik/Otomasyon", renk: "#10B981", ikon: "⚡" },
    { id: "PLC",   adi: "PLC Programcısı",    renk: "#3B82F6", ikon: "🔷" },
    { id: "SCADA", adi: "SCADA Mühendisi",    renk: "#8B5CF6", ikon: "🖥️" },
    { id: "SAHA",  adi: "Saha Teknisyeni",    renk: "#F59E0B", ikon: "🔧" },
    { id: "PM",    adi: "Proje Müdürü",       renk: "#EF4444", ikon: "📋" },
  ];
  const DURUMLAR = [
    { id: "Planlandı",    renk: "#4B5563", bg: "#1F2937" },
    { id: "Devam Ediyor", renk: "#3B82F6", bg: "#1E3A5F" },
    { id: "İncelemede",   renk: "#8B5CF6", bg: "#2D1B69" },
    { id: "Tamamlandı",   renk: "#10B981", bg: "#064E3B" },
    { id: "Engellendi",   renk: "#EF4444", bg: "#450A0A" },
  ];
  const FAZLAR = ["Başlangıç","Planlama","Tasarım","Tedarik","Geliştirme","Entegrasyon","Test","Devreye Alma","Kabul","Kapanış"];

  function rolRenk(id) { return ROLLER.find(r => r.id === id)?.renk || "#6B7280"; }
  function durumRenk(d) { return DURUMLAR.find(x => x.id === d)?.renk || "#4B5563"; }

  function filtrele() {
    const meUser = Auth.getUser();
    return gorevler.filter(g => {
      if (aktifRol === "BENIM") {
        if (!meUser || g.atanan_id !== meUser.id) return false;
      } else if (aktifRol !== "HEPSI" && g.rol !== aktifRol) {
        return false;
      }
      if (aktifFaz !== "HEPSI" && g.faz !== aktifFaz) return false;
      if (aramaMetni) {
        const q = aramaMetni.toLowerCase();
        if (!g.gorev_adi.toLowerCase().includes(q) && !g.gorev_id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  function hesaplaKritikYol() {
    const gecikme = {};
    gorevler.forEach(g => { gecikme[g.gorev_id] = g.baslangic_gun + g.gun; });
    const maxBitis = Math.max(...Object.values(gecikme));
    const kritik = new Set();
    const byId = Object.fromEntries(gorevler.map(g => [g.gorev_id, g]));
    function izle(id) {
      kritik.add(id);
      const g = byId[id];
      if (!g || !g.onk.length) return;
      const enGec = Math.max(...g.onk.map(o => gecikme[o] || 0));
      g.onk.filter(o => gecikme[o] === enGec).forEach(o => izle(o));
    }
    gorevler.filter(g => gecikme[g.gorev_id] === maxBitis).forEach(g => izle(g.gorev_id));
    kritikYolSet = kritik;
  }

  async function load() {
    const panel = document.getElementById("panel-tasks");
    if (!panel) return;
    try {
      gorevler = await API.get("/skills/tasks");
      hesaplaKritikYol();
      render();
    } catch (err) {
      document.getElementById("tasks-panel-body").innerHTML =
        `<p class="muted" style="padding:24px">${UI.esc(err.message)}</p>`;
    }
  }

  function render() {
    renderStats();
    renderToolbar();
    renderGorunum();
  }

  // --- İstatistik şeridi ---
  function renderStats() {
    const el = document.getElementById("tasks-stats");
    if (!el) return;
    const toplam = gorevler.length;
    const tam = gorevler.filter(g => g.durum === "Tamamlandı").length;
    const dev = gorevler.filter(g => g.durum === "Devam Ediyor").length;
    const eng = gorevler.filter(g => g.durum === "Engellendi").length;
    const pct = toplam > 0 ? Math.round((tam / toplam) * 100) : 0;
    el.innerHTML = `
      <div class="tk-stat" style="--c:#94A3B8"><span>${toplam}</span><small>Toplam</small></div>
      <div class="tk-stat" style="--c:#10B981"><span>${tam}</span><small>Tamamlandı</small></div>
      <div class="tk-stat" style="--c:#3B82F6"><span>${dev}</span><small>Devam</small></div>
      <div class="tk-stat" style="--c:#EF4444"><span>${eng}</span><small>Engel</small></div>
      <div class="tk-stat" style="--c:#F59E0B">
        <span>${pct}%</span>
        <div class="tk-prog-wrap"><div class="tk-prog-fill" style="width:${pct}%"></div></div>
        <small>İlerleme</small>
      </div>`;
  }

  // --- Araç çubuğu ---
  function renderToolbar() {
    const el = document.getElementById("tasks-toolbar");
    if (!el) return;
    el.innerHTML = `
      <div class="tk-view-switch">
        ${[["kanban","🗂 Kanban"],["gantt","📊 Gantt"],["liste","☰ Liste"]].map(([v,l]) =>
          `<button class="tk-view-btn${aktifGorunum===v?" active":""}" data-view="${v}">${l}</button>`
        ).join("")}
      </div>
      <div class="tk-filters">
        <button class="tk-rol-btn${aktifRol==="HEPSI"?" active":""}" data-rol="HEPSI">Tüm Roller</button>
        <button class="tk-rol-btn${aktifRol==="BENIM"?" active":""}" data-rol="BENIM" style="${aktifRol==="BENIM"?"border-color:#F59E0B;color:#F59E0B;background:#F59E0B22":""}">👤 Benim</button>
        ${ROLLER.map(r => `
          <button class="tk-rol-btn${aktifRol===r.id?" active":""}" data-rol="${r.id}"
            style="${aktifRol===r.id?`border-color:${r.renk};color:${r.renk};background:${r.renk}22`:""}">${r.ikon} ${r.adi.split("/")[0]}</button>`
        ).join("")}
        <select id="tk-faz-sel" class="tk-select">
          <option value="HEPSI">Tüm Fazlar</option>
          ${FAZLAR.map(f => `<option value="${UI.esc(f)}"${aktifFaz===f?" selected":""}>${UI.esc(f)}</option>`).join("")}
        </select>
        <input id="tk-arama" class="tk-search" placeholder="Görev ara…" value="${UI.esc(aramaMetni)}" />
        <span class="tk-count-lbl">${filtrele().length} görev</span>
        ${Auth.isEditor() ? `<button id="tk-ekle-btn" class="btn btn-primary btn-sm" style="margin-left:8px">+ Yeni Görev</button>` : ""}
        <button id="tk-ajan-btn" class="btn btn-sm" style="margin-left:${Auth.isEditor() ? "8px" : "auto"}">🤖 Ajan Raporu</button>
      </div>`;

    el.querySelectorAll(".tk-view-btn").forEach(b =>
      b.onclick = () => { aktifGorunum = b.dataset.view; render(); });
    el.querySelectorAll(".tk-rol-btn").forEach(b =>
      b.onclick = () => { aktifRol = b.dataset.rol; render(); });
    document.getElementById("tk-faz-sel").onchange = e => { aktifFaz = e.target.value; render(); };
    let st;
    document.getElementById("tk-arama").oninput = e => {
      clearTimeout(st);
      st = setTimeout(() => { aramaMetni = e.target.value; render(); }, 250);
    };
    document.getElementById("tk-ajan-btn").onclick = () => openAjanModal();
    if (Auth.isEditor()) {
      const ekleBtn = document.getElementById("tk-ekle-btn");
      if (ekleBtn) ekleBtn.onclick = () => openCreateModal();
    }
  }

  // --- Görünüm render ---
  function renderGorunum() {
    const body = document.getElementById("tasks-panel-body");
    if (!body) return;
    const f = filtrele();
    if (aktifGorunum === "kanban") body.innerHTML = kanbanHtml(f);
    else if (aktifGorunum === "gantt") body.innerHTML = ganttHtml(f);
    else body.innerHTML = listeHtml(f);

    body.querySelectorAll("[data-gid]").forEach(el =>
      el.addEventListener("click", () => {
        const g = gorevler.find(x => x.gorev_id === el.dataset.gid);
        if (g) openDetail(g);
      }));

    body.querySelectorAll("[data-dot-id]").forEach(el =>
      el.addEventListener("click", e => {
        e.stopPropagation();
        updateTask(el.dataset.dotId, { durum: el.dataset.durum });
      }));
  }

  // --- Kanban ---
  function kanbanHtml(filtreli) {
    return `<div class="tk-kanban">${
      DURUMLAR.map(d => {
        const kolGorevler = filtreli.filter(g => g.durum === d.id);
        return `
          <div class="tk-kol">
            <div class="tk-kol-hdr" style="background:${d.bg};border-color:${d.renk}44">
              <span style="color:${d.renk};font-weight:700;font-size:12px">${d.id}</span>
              <span class="tk-badge" style="background:${d.renk}33;color:${d.renk}">${kolGorevler.length}</span>
            </div>
            ${kolGorevler.map(g => kartHtml(g)).join("")}
          </div>`;
      }).join("")
    }</div>`;
  }

  function kartHtml(g) {
    const r = rolRenk(g.rol);
    const rol = ROLLER.find(x => x.id === g.rol);
    
    // Atanan kişi avatarı
    const initials = g.atanan_adi ? g.atanan_adi.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "";
    const avatar = initials 
      ? `<span class="tk-avatar" title="Atanan: ${UI.esc(g.atanan_adi)}">${initials}</span>` 
      : `<span class="tk-avatar empty" title="Atama Yok">👤</span>`;

    return `
      <div class="tk-kart" data-gid="${UI.esc(g.gorev_id)}" style="border-left:3px solid ${r}">
        <div class="tk-kart-top">
          <span class="tk-kid" style="color:${r}">${UI.esc(g.gorev_id)}</span>
          <span class="tk-gno">G${g.baslangic_gun + 1}</span>
        </div>
        <div class="tk-kadi">${UI.esc(g.gorev_adi)}</div>
        <div class="tk-kmeta"><span>${rol?.ikon || ""} ${UI.esc(g.faz)}</span><span>${g.gun}g</span></div>
        ${g.tamamlanma > 0 ? `<div class="tk-mini-bar"><div style="width:${g.tamamlanma}%;background:${r}"></div></div>` : ""}
        <div class="tk-kart-footer">
          ${avatar}
          <div class="tk-dots">
            ${DURUMLAR.map(dd => `
              <button class="tk-dot${g.durum===dd.id?" active":""}" data-dot-id="${UI.esc(g.gorev_id)}" data-durum="${dd.id}"
                title="Durum: ${dd.id}"
                style="--d-color:${dd.renk}; background:${g.durum===dd.id?dd.renk:"transparent"}; border-color:${g.durum===dd.id?dd.renk:"var(--border)"}">
              </button>`).join("")}
          </div>
        </div>
      </div>`;
  }

  // --- Gantt ---
  function ganttHtml(filtreli) {
    const HC = 18, ROL_W = 200;
    const maxGun = Math.max(...gorevler.map(g => g.baslangic_gun + g.gun));
    const haftalar = Math.ceil(maxGun / 5);

    const gruplar = {};
    filtreli.forEach(g => { if (!gruplar[g.rol]) gruplar[g.rol] = []; gruplar[g.rol].push(g); });
    const grupList = ROLLER.filter(r => gruplar[r.id]).map(r => ({
      rol: r,
      gvler: gruplar[r.id].sort((a, b) => a.baslangic_gun - b.baslangic_gun),
    }));

    const hdr = `
      <div style="display:flex;position:sticky;top:0;background:var(--bg);z-index:10;border-bottom:1px solid var(--border)">
        <div style="min-width:${ROL_W}px;border-right:1px solid var(--border);padding:8px 12px;font-size:11px;color:var(--muted);font-weight:700">GÖREV</div>
        <div style="display:flex;flex:1">
          ${Array.from({length: haftalar}).map((_,hi) => `
            <div style="min-width:${5*HC}px;border-right:1px solid var(--border);padding:4px 0;text-align:center;font-size:10px;color:var(--muted)">
              H${hi+1}
              <div style="display:flex">
                ${[1,2,3,4,5].map(d => `<div style="width:${HC}px;border-right:1px solid var(--bg);font-size:9px;color:var(--text);text-align:center;padding-top:2px">${hi*5+d}</div>`).join("")}
              </div>
            </div>`).join("")}
        </div>
      </div>`;

    const rows = grupList.map(({ rol, gvler }) => `
      <div style="display:flex;background:var(--bg);border-bottom:1px solid var(--border)">
        <div style="min-width:${ROL_W}px;padding:6px 12px;display:flex;align-items:center;gap:6px">
          <span style="font-size:14px">${rol.ikon}</span>
          <span style="font-size:11px;font-weight:700;color:${rol.renk}">${UI.esc(rol.adi)}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--muted)">${gvler.length}g</span>
        </div>
        <div style="flex:1;min-width:${maxGun*HC}px;background:${rol.renk}08;border-left:1px solid var(--border)"></div>
      </div>
      ${gvler.map(g => {
        const r = rolRenk(g.rol);
        const isK = kritikYolSet.has(g.gorev_id);
        const barBg = isK ? `linear-gradient(90deg,${r},#EF4444)`
          : g.durum === "Tamamlandı" ? "#10B981"
          : g.durum === "Engellendi" ? "#EF444488"
          : r + "CC";
        return `
          <div class="tk-gantt-row" data-gid="${UI.esc(g.gorev_id)}" style="display:flex;border-bottom:1px solid var(--border);cursor:pointer;background:var(--surface)">
            <div style="min-width:${ROL_W}px;padding:5px 12px 5px 20px;border-right:1px solid var(--border);display:flex;align-items:center;gap:6px">
              <span style="font-size:9px;color:${r};font-family:monospace;font-weight:700;min-width:70px">${UI.esc(g.gorev_id)}</span>
              <span style="font-size:11px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${UI.esc(g.gorev_adi)}</span>
              ${g.durum === "Tamamlandı" ? `<span style="margin-left:auto;font-size:10px;color:#10B981">✓</span>` : ""}
              ${g.durum === "Engellendi" ? `<span style="margin-left:auto;font-size:10px;color:#EF4444">!</span>` : ""}
            </div>
            <div style="flex:1;min-width:${maxGun*HC}px;position:relative;height:30px">
              ${Array.from({length:maxGun}).map((_,i) => `<div style="position:absolute;left:${i*HC}px;top:0;width:${HC}px;height:100%;border-right:${(i+1)%5===0?"1px solid var(--border)":"1px solid var(--bg)"}"></div>`).join("")}
              <div style="position:absolute;left:${g.baslangic_gun*HC+2}px;top:5px;height:20px;width:${Math.max(g.gun*HC-4,4)}px;border-radius:4px;background:${barBg};${isK?"box-shadow:0 0 6px #EF444466;":""}display:flex;align-items:center;padding-left:4px;overflow:hidden">
                <span style="font-size:9px;color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${UI.esc(g.gorev_adi)}</span>
              </div>
              ${g.tamamlanma > 0 && g.durum !== "Tamamlandı" ? `<div style="position:absolute;left:${g.baslangic_gun*HC+2}px;top:5px;height:20px;width:${(g.gun*HC-4)*g.tamamlanma/100}px;border-radius:4px;background:rgba(255,255,255,0.4)"></div>` : ""}
            </div>
          </div>`;
      }).join("")}
    `).join("");

    const legend = `
      <div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-top:1px solid var(--border)">
        <div style="width:30px;height:6px;background:linear-gradient(90deg,#3B82F6,#EF4444);border-radius:3px"></div>
        <span style="font-size:10px;color:var(--muted)">Kritik yol (${kritikYolSet.size} görev) — Gecikme proje bitiş tarihini etkiler</span>
      </div>`;

    return `<div style="overflow-x:auto;background:var(--surface);border-radius:10px;border:1px solid var(--border)">${hdr}${rows}${legend}</div>`;
  }

  // --- Liste ---
  function listeHtml(filtreli) {
    const byFaz = {};
    filtreli.forEach(g => { if (!byFaz[g.faz]) byFaz[g.faz] = []; byFaz[g.faz].push(g); });
    const sirali = FAZLAR.filter(f => byFaz[f]);
    if (!sirali.length) return `<p class="muted" style="padding:24px">Görev bulunamadı.</p>`;

    return sirali.map(faz => {
      const gvler = byFaz[faz];
      return `
        <div style="margin-bottom:16px">
          <div class="tk-faz-hdr">${UI.esc(faz.toUpperCase())} — ${gvler.length} GÖREV</div>
          ${gvler.map(g => {
            const r = rolRenk(g.rol);
            const rol = ROLLER.find(x => x.id === g.rol);
            const dr = durumRenk(g.durum);
            return `
              <div class="tk-liste-row" data-gid="${UI.esc(g.gorev_id)}" style="border-left:3px solid ${r}">
                <span class="tk-lkid" style="color:${r}">${UI.esc(g.gorev_id)}</span>
                <span class="tk-ladi">${UI.esc(g.gorev_adi)}</span>
                <span class="tk-lrol">${rol?.ikon || ""} ${(rol?.adi || g.rol).split("/")[0]}</span>
                <span class="tk-lsure">${g.gun}g / G${g.baslangic_gun + 1}</span>
                <span class="tk-ldurum" style="border-color:${dr}44;color:${dr}">${UI.esc(g.durum)}</span>
                ${g.tamamlanma > 0 ? `<div class="tk-mini-bar" style="width:60px"><div style="width:${g.tamamlanma}%;background:${r}"></div></div>` : ""}
              </div>`;
          }).join("")}
        </div>`;
    }).join("");
  }

  // --- Detay modal ---
  function openDetail(g) {
    secilenGorev = { ...g };
    const r = rolRenk(g.rol);
    const rol = ROLLER.find(x => x.id === g.rol);
    const bs = g.baslangic_gun;
    const BASE = new Date("2026-07-01");
    const basD = new Date(BASE); basD.setDate(basD.getDate() + bs);
    const bitD = new Date(BASE); bitD.setDate(bitD.getDate() + bs + g.gun);
    const fmt = d => d.toLocaleDateString("tr-TR", {day:"2-digit", month:"short"});
    const onkGorevler = (g.onk || []).map(id => gorevler.find(x => x.gorev_id === id)).filter(Boolean);

    UI.openModal(`
      <div style="max-width:400px">
        <div style="padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:14px">
          <span style="font-size:10px;color:${r};font-family:monospace;font-weight:700">${UI.esc(g.gorev_id)}</span>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-top:4px;line-height:1.4">${UI.esc(g.gorev_adi)}</div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <span style="font-size:10px;color:${r};background:${r}22;border-radius:4px;padding:2px 8px">${rol?.ikon||""} ${UI.esc(rol?.adi||g.rol)}</span>
            <span style="font-size:10px;color:var(--muted);background:var(--bg);border-radius:4px;padding:2px 8px">${UI.esc(g.faz)}</span>
          </div>
        </div>

        <div style="background:var(--bg);border-radius:8px;padding:12px;border:1px solid var(--border);margin-bottom:12px">
          <div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:8px">ZAMAN</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div><div style="font-size:9px;color:var(--muted)">Başlangıç</div><div style="font-size:11px;color:var(--text);font-weight:600">Gün ${bs+1} (${fmt(basD)})</div></div>
            <div><div style="font-size:9px;color:var(--muted)">Bitiş</div><div style="font-size:11px;color:var(--text);font-weight:600">Gün ${bs+g.gun} (${fmt(bitD)})</div></div>
            <div><div style="font-size:9px;color:var(--muted)">Süre</div><div style="font-size:11px;color:var(--text);font-weight:600">${g.gun} gün</div></div>
            <div><div style="font-size:9px;color:var(--muted)">Teslim</div><div style="font-size:11px;color:var(--text);font-weight:600">${UI.esc(g.teslim||"—")}</div></div>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:8px">DURUM</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" id="tk-durum-btns">
            ${DURUMLAR.map(d => `
              <button class="tk-det-durum" data-durum="${d.id}"
                style="padding:4px 12px;border-radius:20px;border:1px solid ${secilenGorev.durum===d.id?d.renk:"var(--border)"};
                  background:${secilenGorev.durum===d.id?d.renk+"22":"transparent"};
                  color:${secilenGorev.durum===d.id?d.renk:"var(--muted)"};cursor:pointer;font-size:11px;font-weight:600">
                ${d.id}
              </button>`).join("")}
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:10px;color:var(--muted);font-weight:700">TAMAMLANMA</div>
            <div id="tk-pct-lbl" style="font-size:11px;color:${r};font-weight:700">${g.tamamlanma}%</div>
          </div>
          <input type="range" id="tk-pct" min="0" max="100" step="5" value="${g.tamamlanma}" style="width:100%;accent-color:${r}" />
          <div style="height:6px;background:var(--border);border-radius:3px;margin-top:6px">
            <div id="tk-pct-bar" style="height:100%;width:${g.tamamlanma}%;background:linear-gradient(90deg,${r},${r}88);border-radius:3px;transition:width .3s"></div>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:8px">NOT / ENGEL</div>
          <textarea id="tk-not" rows="3" placeholder="Görev notu veya engel açıklaması…"
            style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:10px;font-size:12px;resize:vertical;outline:none;font-family:inherit;box-sizing:border-box">${UI.esc(g.not_metni||"")}</textarea>
        </div>

        ${g.atanan_adi ? `
          <div style="background:var(--bg);border-radius:8px;padding:10px 12px;border:1px solid var(--border);margin-bottom:12px;display:flex;align-items:center;gap:8px">
            <span style="font-size:14px">👤</span>
            <div>
              <div style="font-size:9px;color:var(--muted);font-weight:700">ATANAN KİŞİ</div>
              <div style="font-size:12px;color:var(--text);font-weight:600">${UI.esc(g.atanan_adi)}</div>
            </div>
          </div>` : ""}

        ${onkGorevler.length ? `
          <div style="margin-bottom:12px">
            <div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:8px">ÖNKOŞULLAR</div>
            ${onkGorevler.map(og => {
              const ork = rolRenk(og.rol);
              const tam = og.durum === "Tamamlandı";
              return `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg);border-radius:8px;border:1px solid ${tam?"#10B98133":"var(--border)"};margin-bottom:4px">
                  <span>${tam?"✅":"⏳"}</span>
                  <div style="flex:1">
                    <div style="font-size:9px;color:${ork};font-family:monospace">${UI.esc(og.gorev_id)}</div>
                    <div style="font-size:11px;color:var(--text)">${UI.esc(og.gorev_adi)}</div>
                  </div>
                  <span style="font-size:9px;color:${durumRenk(og.durum)}">${UI.esc(og.durum)}</span>
                </div>`;
            }).join("")}
          </div>` : ""}

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;border-top:1px solid var(--border);padding-top:12px">
          <div>
            <button id="tk-sil" class="btn btn-danger btn-sm">Görev Sil</button>
          </div>
          <div>
            <button id="tk-kaydet" class="btn btn-primary">Kaydet</button>
          </div>
        </div>
      </div>`);

    document.querySelector(".modal").style.maxWidth = "460px";

    // Range live
    const rng = document.getElementById("tk-pct");
    rng.oninput = () => {
      document.getElementById("tk-pct-lbl").textContent = rng.value + "%";
      document.getElementById("tk-pct-bar").style.width = rng.value + "%";
    };

    // Durum butonları
    document.querySelectorAll(".tk-det-durum").forEach(btn => {
      btn.onclick = () => {
        secilenGorev.durum = btn.dataset.durum;
        document.querySelectorAll(".tk-det-durum").forEach(b => {
          const d = DURUMLAR.find(x => x.id === b.dataset.durum);
          const sel = b.dataset.durum === secilenGorev.durum;
          b.style.borderColor = sel ? d.renk : "#1E2433";
          b.style.background  = sel ? d.renk + "22" : "transparent";
          b.style.color       = sel ? d.renk : "#64748B";
        });
      };
    });

    // Sil
    document.getElementById("tk-sil").onclick = () => {
      const silDiv = document.getElementById("tk-sil-onay");
      if (silDiv) { silDiv.remove(); return; }
      const onay = document.createElement("div");
      onay.id = "tk-sil-onay";
      onay.style.cssText = "margin-top:10px;padding:10px;background:#FEF2F2;border:1px solid #EF444444;border-radius:8px;display:flex;align-items:center;gap:8px;font-size:12px";
      onay.innerHTML = `
        <span style="flex:1;color:#991B1B">Bu görevi kalıcı olarak silmek istiyor musunuz?</span>
        <button id="tk-sil-evet" class="btn btn-danger btn-sm">Evet, Sil</button>
        <button id="tk-sil-hayir" class="btn btn-sm">Vazgeç</button>`;
      document.getElementById("tk-sil").parentElement.appendChild(onay);
      document.getElementById("tk-sil-hayir").onclick = () => onay.remove();
      document.getElementById("tk-sil-evet").onclick = async () => {
        try {
          await API.del(`/skills/tasks/${encodeURIComponent(g.gorev_id)}`);
          const idx = gorevler.findIndex(x => x.gorev_id === g.gorev_id);
          if (idx !== -1) gorevler.splice(idx, 1);
          hesaplaKritikYol();
          render();
          UI.toast("Görev silindi", "success");
          document.querySelector(".modal").style.maxWidth = "";
          UI.closeModal();
        } catch (err) {
          UI.toast(err.message, "error");
        }
      };
    };

    // Kaydet
    document.getElementById("tk-kaydet").onclick = async () => {
      const payload = {
        durum: secilenGorev.durum,
        tamamlanma: parseInt(document.getElementById("tk-pct").value),
        not_metni: document.getElementById("tk-not").value,
      };
      await updateTask(g.gorev_id, payload);
      UI.closeModal();
    };

    document.getElementById("modal-close").addEventListener("click", () => {
      const m = document.querySelector(".modal");
      if (m) m.style.maxWidth = "";
    }, { once: true });
  }

  // --- PATCH ---
  async function updateTask(gorevId, data) {
    try {
      const updated = await API.patch(`/skills/tasks/${gorevId}`, data);
      const idx = gorevler.findIndex(g => g.gorev_id === gorevId);
      if (idx !== -1) gorevler[idx] = { ...gorevler[idx], ...updated };
      render();
      UI.toast("Görev güncellendi", "success");
    } catch (err) {
      UI.toast(err.message, "error");
    }
  }

  // --- Ajan Raporu Modal ---
  async function openAjanModal() {
    UI.openModal(`<p class="muted" style="padding:24px;text-align:center">Ajanlar çalışıyor…</p>`);
    document.querySelector(".modal").style.maxWidth = "760px";

    try {
      const rapor = await API.get("/skills/agents/report");
      const pm = rapor.pm;
      const risk = rapor.risk;

      const tipIkon = { baslat: "▶️", engel: "🔴", uyari: "⚠️" };
      const riskIkon = { kritik: "🔴", yuksek: "🟠", orta: "🟡", bilgi: "ℹ️" };
      const riskRenk = { kritik: "#EF4444", yuksek: "#F59E0B", orta: "#8B5CF6", bilgi: "#64748B" };

      document.getElementById("modal-body").innerHTML = `
        <h3 style="margin-bottom:16px">🤖 Ajan Raporu</h3>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          <div class="tk-detail-card" style="text-align:center">
            <div style="font-size:26px;font-weight:800;color:#3B82F6">${pm.istatistik.genel_pct}%</div>
            <div class="tk-detail-lbl">GENEL İLERLEME</div>
          </div>
          <div class="tk-detail-card" style="text-align:center">
            <div style="font-size:26px;font-weight:800;color:#10B981">${pm.istatistik.tamamlanan}</div>
            <div class="tk-detail-lbl">TAMAMLANDI</div>
          </div>
          <div class="tk-detail-card" style="text-align:center">
            <div style="font-size:20px;font-weight:800;color:${risk.risk_skoru >= 10 ? "#EF4444" : "#F59E0B"}">${UI.esc(risk.risk_seviyesi)}</div>
            <div class="tk-detail-lbl">RİSK SEVİYESİ</div>
          </div>
        </div>

        <div style="margin-bottom:20px">
          <div style="font-weight:700;margin-bottom:8px">📋 ${UI.esc(pm.baslik)}</div>
          <p style="font-size:12.5px;color:var(--muted);margin-bottom:10px">${UI.esc(pm.aciklama)}</p>
          ${pm.maddeler.length ? pm.maddeler.map(m => `
            <div style="display:flex;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);margin-bottom:5px;font-size:12.5px">
              <span>${tipIkon[m.tip] || "•"}</span>
              <div>
                <div>${UI.esc(m.mesaj)}</div>
                ${m.gorev_id ? `<div style="font-size:10px;color:var(--muted);font-family:monospace;margin-top:2px">${UI.esc(m.gorev_id)}</div>` : ""}
              </div>
            </div>`).join("") : `<p class="muted" style="font-size:12.5px">Aksiyon gerektiren madde yok 🎉</p>`}
        </div>

        <div style="margin-bottom:20px">
          <div style="font-weight:700;margin-bottom:10px">📊 Faz İlerlemesi</div>
          ${pm.faz_ozet.map(f => `
            <div style="display:flex;align-items:center;gap:10px;font-size:12px;margin-bottom:5px">
              <span style="min-width:130px;color:var(--muted)">${UI.esc(f.faz)}</span>
              <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${f.pct}%;background:${f.pct === 100 ? "#10B981" : "var(--primary)"};transition:width .3s"></div>
              </div>
              <span style="min-width:65px;text-align:right;color:${f.pct === 100 ? "#10B981" : "var(--text)"}">${f.tamamlanan}/${f.toplam} (%${f.pct})</span>
            </div>`).join("")}
        </div>

        <div style="margin-bottom:16px">
          <div style="font-weight:700;margin-bottom:8px">🛡️ ${UI.esc(risk.baslik)}</div>
          <p style="font-size:12.5px;color:var(--muted);margin-bottom:10px">${UI.esc(risk.aciklama)}</p>
          ${risk.riskler.map(r => `
            <div style="display:flex;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid ${riskRenk[r.seviye]}33;background:${riskRenk[r.seviye]}0A;margin-bottom:5px;font-size:12.5px">
              <span>${riskIkon[r.seviye] || "•"}</span>
              <div>
                <div>${UI.esc(r.mesaj)}</div>
                ${r.gorev_id ? `<div style="font-size:10px;color:var(--muted);font-family:monospace;margin-top:2px">${UI.esc(r.gorev_id)}</div>` : ""}
              </div>
            </div>`).join("")}
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <span style="font-size:12px;padding:4px 12px;border-radius:6px;border:1px solid ${risk.fat_hazir ? "#10B98133" : "#F59E0B33"};color:${risk.fat_hazir ? "#10B981" : "#F59E0B"}">
              ${risk.fat_hazir ? "✓ FAT Hazır" : "⏳ FAT Bekleniyor"}
            </span>
            <span style="font-size:12px;padding:4px 12px;border-radius:6px;border:1px solid ${risk.sat_hazir ? "#10B98133" : "#F59E0B33"};color:${risk.sat_hazir ? "#10B981" : "#F59E0B"}">
              ${risk.sat_hazir ? "✓ SAT Hazır" : "⏳ SAT Bekleniyor"}
            </span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" id="tk-ajan-kapat">Kapat</button>
        </div>`;

      document.getElementById("tk-ajan-kapat").onclick = () => {
        document.querySelector(".modal").style.maxWidth = "";
        UI.closeModal();
      };
      document.getElementById("modal-close").addEventListener("click", () => {
        const m = document.querySelector(".modal");
        if (m) m.style.maxWidth = "";
      }, { once: true });

    } catch (err) {
      document.getElementById("modal-body").innerHTML =
        `<p class="muted" style="padding:20px">${UI.esc(err.message)}</p>`;
    }
  }

  // --- Yeni Görev Ekleme Modalı ---
  function openCreateModal() {
    const onkOptions = gorevler.map(g => `
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:normal;cursor:pointer;margin-bottom:4px">
        <input type="checkbox" class="tk-onk-cb" value="${g.gorev_id}" style="width:auto;margin:0" />
        <span style="font-family:monospace;font-weight:bold;color:${rolRenk(g.rol)}">[${g.gorev_id}]</span> ${UI.esc(g.gorev_adi)}
      </label>
    `).join("");

    UI.openModal(`
      <div style="max-width:500px">
        <h3 style="margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px">➕ Yeni Görev Ekle</h3>
        <form id="tk-ekle-form">
          <div class="form-row">
            <label style="font-weight:600;font-size:13px;margin-bottom:4px">Görev Adı *</label>
            <input type="text" id="tk-ekle-adi" placeholder="Örn: PLC Kod Bloklarının Hazırlanması" required />
          </div>
          <div class="form-grid" style="margin-bottom:12px">
            <div class="form-row" style="margin-bottom:0">
              <label style="font-weight:600;font-size:13px;margin-bottom:4px">Rol *</label>
              <select id="tk-ekle-rol" required>
                ${ROLLER.map(r => `<option value="${r.id}">${r.ikon} ${r.adi.split("/")[0]}</option>`).join("")}
              </select>
            </div>
            <div class="form-row" style="margin-bottom:0">
              <label style="font-weight:600;font-size:13px;margin-bottom:4px">Atanan Kişi</label>
              <select id="tk-ekle-atanan">
                <option value="">— Seçiniz —</option>
              </select>
              <div id="tk-ekle-atanan-loading" style="font-size:11px;color:var(--muted);margin-top:4px;display:none">Yükleniyor…</div>
            </div>
          </div>
          <div class="form-grid" style="margin-bottom:12px">
            <div class="form-row" style="margin-bottom:0">
              <label style="font-weight:600;font-size:13px;margin-bottom:4px">Faz *</label>
              <select id="tk-ekle-faz" required>
                ${FAZLAR.map(f => `<option value="${UI.esc(f)}">${UI.esc(f)}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="form-grid" style="margin-bottom:12px">
            <div class="form-row" style="margin-bottom:0">
              <label style="font-weight:600;font-size:13px;margin-bottom:4px">Süre (Gün) *</label>
              <input type="number" id="tk-ekle-gun" min="1" value="3" required />
            </div>
            <div class="form-row" style="margin-bottom:0">
              <label style="font-weight:600;font-size:13px;margin-bottom:4px">Başlangıç Günü</label>
              <input type="number" id="tk-ekle-baslangic" min="0" value="0" />
            </div>
          </div>
          <div class="form-row">
            <label style="font-weight:600;font-size:13px;margin-bottom:4px">Teslimat / Çıktı</label>
            <input type="text" id="tk-ekle-teslim" placeholder="Örn: E-Plan Projesi" />
          </div>
          <div class="form-row">
            <label style="font-weight:600;font-size:13px;margin-bottom:4px">Önkoşul Görevler</label>
            <div style="max-height:120px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--bg)">
              ${onkOptions || '<p class="muted" style="font-size:12px">Henüz görev yok</p>'}
            </div>
          </div>
          <div class="form-row">
            <label style="font-weight:600;font-size:13px;margin-bottom:4px">Durum *</label>
            <select id="tk-ekle-durum" required>
              ${DURUMLAR.map(d => `<option value="${d.id}">${d.id}</option>`).join("")}
            </select>
          </div>
          <div class="form-row">
            <label style="font-weight:600;font-size:13px;margin-bottom:4px">Not / Engel Açıklaması</label>
            <textarea id="tk-ekle-not" rows="2" placeholder="Görev notu veya engel açıklaması..."></textarea>
          </div>
          <div class="modal-actions" style="margin-top:20px;border-top:1px solid var(--border);padding-top:12px">
            <button type="button" class="btn" id="tk-ekle-iptal">Vazgeç</button>
            <button type="submit" class="btn btn-primary">Ekle</button>
          </div>
        </form>
      </div>
    `);

    document.querySelector(".modal").style.maxWidth = "520px";

    // Rol seçilince o roldeki kullanıcıları getir
    async function rolKullanicilariYukle(rolId) {
      const sel = document.getElementById("tk-ekle-atanan");
      const lbl = document.getElementById("tk-ekle-atanan-loading");
      sel.innerHTML = `<option value="">— Seçiniz —</option>`;
      if (!rolId) return;
      lbl.style.display = "block";
      try {
        const kullanicilar = await API.get(`/auth/users/by-role/${encodeURIComponent(rolId)}`);
        lbl.style.display = "none";
        if (!kullanicilar.length) {
          sel.innerHTML = `<option value="">Bu rolde kullanıcı yok</option>`;
          return;
        }
        sel.innerHTML = `<option value="">— Seçiniz —</option>` +
          kullanicilar.map(u => {
            const ad = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
            return `<option value="${u.id}">${UI.esc(ad)} (${UI.esc(u.username)})</option>`;
          }).join("");
      } catch {
        lbl.style.display = "none";
        sel.innerHTML = `<option value="">Yüklenemedi</option>`;
      }
    }

    const rolSel = document.getElementById("tk-ekle-rol");
    rolSel.addEventListener("change", () => rolKullanicilariYukle(rolSel.value));
    rolKullanicilariYukle(rolSel.value);

    document.getElementById("tk-ekle-iptal").onclick = () => {
      document.querySelector(".modal").style.maxWidth = "";
      UI.closeModal();
    };

    document.getElementById("modal-close").addEventListener("click", () => {
      const m = document.querySelector(".modal");
      if (m) m.style.maxWidth = "";
    }, { once: true });

    document.getElementById("tk-ekle-form").onsubmit = async (e) => {
      e.preventDefault();

      const selectedOnk = [];
      document.querySelectorAll(".tk-onk-cb:checked").forEach(cb => {
        selectedOnk.push(cb.value);
      });

      const atananVal = document.getElementById("tk-ekle-atanan").value;
      const payload = {
        rol: document.getElementById("tk-ekle-rol").value,
        gorev_adi: document.getElementById("tk-ekle-adi").value.trim(),
        faz: document.getElementById("tk-ekle-faz").value,
        gun: parseInt(document.getElementById("tk-ekle-gun").value) || 1,
        onk: selectedOnk,
        teslim: document.getElementById("tk-ekle-teslim").value.trim(),
        baslangic_gun: parseInt(document.getElementById("tk-ekle-baslangic").value) || 0,
        durum: document.getElementById("tk-ekle-durum").value,
        tamamlanma: 0,
        not_metni: document.getElementById("tk-ekle-not").value.trim(),
        atanan_id: atananVal ? parseInt(atananVal) : null,
      };

      try {
        const addedTask = await API.post("/skills/tasks", payload);
        gorevler.push(addedTask);
        hesaplaKritikYol();
        render();
        UI.toast("Yeni görev başarıyla eklendi", "success");
        document.querySelector(".modal").style.maxWidth = "";
        UI.closeModal();
      } catch (err) {
        UI.toast(err.message, "error");
      }
    };
  }

  return { load };
})();

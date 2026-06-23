// ===================== MÜHENDİSLİK HESAPLAMALARI =====================
const Calculations = (() => {
  let activeTab = "cable";
  let activeMotorMode = "torque";

  // IEC 60364-5-52 Tip C akım taşıma kapasiteleri (A)
  const AKIM_KAPASITESI = {
    Cu: { 1.5:18, 2.5:25, 4:34, 6:44, 10:61, 16:82, 25:108, 35:135, 50:168, 70:207, 95:250, 120:292, 150:335, 185:382, 240:453 },
    Al: { 1.5:13, 2.5:19, 4:26, 6:34, 10:47, 16:63, 25:83, 35:102, 50:127, 70:157, 95:190, 120:222, 150:253, 185:288, 240:342 }
  };
  const KESITLER = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

  // IEC 60947-4 Motor koruma şalterleri standart değerleri (A)
  const MMS_DEGERLERI = [0.1,0.16,0.25,0.4,0.63,1,1.6,2.5,4,6.3,10,16,25,32,40,50,63,80,100,125,160,200,250];
  // Standart sigorta değerleri (A)
  const SIGORTA_SERISI = [2,4,6,10,13,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630];

  function bindEvents() {
    document.querySelectorAll(".calc-tab-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".calc-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.calcTab;
        render();
      };
    });
  }

  function load() { bindEvents(); render(); }

  function render() {
    const container = document.getElementById("calculations-container");
    if (!container) return;
    const map = {
      cable:       renderCableLayout,
      motor:       renderMotorLayout,
      breaker:     renderBreakerLayout,
      transformer: renderTransformerLayout,
      pneumatic:   renderPneumaticLayout,
      signal:      renderSignalLayout,
      powerfactor: renderPowerFactorLayout,
    };
    (map[activeTab] || renderCableLayout)(container);
  }

  // ─────────────────────────────────────────────
  // YARDIMCI: sonuç kartı HTML'i
  // ─────────────────────────────────────────────
  function resultPanel(mainLabel, mainVal, mainUnit, badgeClass, badgeText, infoHtml, rowsHtml) {
    const colors = { success:"#137333", warning:"#B06000", danger:"#C5221F", info:"var(--primary)" };
    const bgColors = { success:"#E6F4EA", warning:"#FEF7E0", danger:"#FCE8E6", info:"#EEF2FF" };
    const c = colors[badgeClass] || colors.info;
    const bg = bgColors[badgeClass] || bgColors.info;
    return `
      <div class="calc-result-panel">
        <div class="calc-result-hdr">${mainLabel}</div>
        <div class="calc-main-val" style="color:${c}">${mainVal} <small>${mainUnit}</small></div>
        ${badgeText ? `<div><span class="calc-badge ${badgeClass}">${badgeText}</span></div>` : ""}
        ${infoHtml ? `<div class="calc-info-card" style="border-left-color:${c};background:${bg};color:${c}">${infoHtml}</div>` : ""}
        ${rowsHtml ? `<div class="calc-data-list">${rowsHtml}</div>` : ""}
      </div>`;
  }

  function dataRow(label, val, highlight) {
    return `<div class="calc-data-row" ${highlight ? 'style="background:rgba(79,110,247,.08);padding:8px;border-radius:6px"' : ""}>
      <span ${highlight ? 'style="color:var(--primary);font-weight:bold"' : ""}>${label}</span>
      <span ${highlight ? 'style="color:var(--primary);font-weight:bold"' : ""}>${val}</span>
    </div>`;
  }

  // ═══════════════════════════════════════════════════
  // 1. KABLO GERİLİM DÜŞÜMÜ
  // ═══════════════════════════════════════════════════
  function renderCableLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>⚡ Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Bağlantı Tipi</label>
              <select id="cb-phase">
                <option value="3">3 Fazlı AC (380 V)</option>
                <option value="1">1 Fazlı AC (220 V)</option>
              </select></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Kurulu Güç (kW)</label><input type="number" id="cb-power" value="15" min="0.1" step="0.1"/></div>
              <div class="calc-row"><label>Kablo Uzunluğu (m)</label><input type="number" id="cb-length" value="80" min="1"/></div>
            </div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>İletken Malzeme</label>
                <select id="cb-conductor"><option value="Cu">Bakır (Cu)</option><option value="Al">Alüminyum (Al)</option></select></div>
              <div class="calc-row"><label>Kablo Kesiti (mm²)</label>
                <select id="cb-section">${KESITLER.map(k=>`<option value="${k}" ${k===6?"selected":""}>${k} mm²</option>`).join("")}</select></div>
            </div>
            <div class="calc-row"><label>Güç Faktörü (cos φ)</label><input type="number" id="cb-cos" value="0.85" min="0.5" max="1" step="0.01"/></div>
          </div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="cb-results"></div></div>
      </div>`;
    ["cb-phase","cb-power","cb-length","cb-conductor","cb-section","cb-cos"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcCable);
      document.getElementById(id).addEventListener("change", calcCable);
    });
    calcCable();
  }

  function calcCable() {
    const phase = parseInt(document.getElementById("cb-phase").value);
    const power = parseFloat(document.getElementById("cb-power").value) || 0;
    const length = parseFloat(document.getElementById("cb-length").value) || 0;
    const conductor = document.getElementById("cb-conductor").value;
    const section = parseFloat(document.getElementById("cb-section").value);
    const cos = parseFloat(document.getElementById("cb-cos").value) || 0.85;
    const k = conductor === "Cu" ? 56 : 35;
    const U = phase === 3 ? 380 : 220;
    const current = phase === 3
      ? (power * 1000) / (Math.sqrt(3) * U * cos)
      : (power * 1000) / (U * cos);
    const pctDrop = phase === 3
      ? (100 * length * power * 1000) / (k * section * U * U)
      : (200 * length * power * 1000) / (k * section * U * U);
    const nomCap = AKIM_KAPASITESI[conductor][section] || 0;
    const exceeded = current > nomCap;
    const cls = (pctDrop > 5 || exceeded) ? "danger" : pctDrop > 3 ? "warning" : "success";
    const lbl = cls === "success" ? "Güvenli" : cls === "warning" ? "Kritik Sınırda" : "Limit Aşımı";
    const info = exceeded
      ? `Kablo kapasitesi (${nomCap} A) yetersiz! Mevcut akım: ${current.toFixed(1)} A — yangın riski.`
      : cls === "success"
        ? `Gerilim düşümü standart sınır (%3.0) altındadır. Seçilen kesit uygundur.`
        : cls === "warning"
          ? `%3 sınırı aşıldı, %5 motor kalkış limitine yakın. Daha büyük kesit önerilir.`
          : `Gerilim düşümü (%${pctDrop.toFixed(2)}) izin verilen %5 limitini aşıyor!`;

    let recSec = "Bulunamadı";
    for (const sec of KESITLER) {
      if (current > (AKIM_KAPASITESI[conductor][sec] || 0)) continue;
      const drop = phase === 3
        ? (100 * length * power * 1000) / (k * sec * U * U)
        : (200 * length * power * 1000) / (k * sec * U * U);
      if (drop <= 3.0) { recSec = `${sec} mm²`; break; }
    }
    const box = document.getElementById("cb-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Gerilim Düşümü Oranı", `% ${pctDrop.toFixed(2)}`, "", cls, lbl, info,
      dataRow("Çekilen Akım", `${current.toFixed(1)} A`, false) +
      dataRow("Kablo Kapasitesi", `${nomCap} A`, false) +
      dataRow("Maks. İzin Verilen", "% 3.0", false) +
      dataRow("Önerilen Min. Kesit", recSec, true)
    );
  }

  // ═══════════════════════════════════════════════════
  // 2. MOTOR GÜÇ & TORK
  // ═══════════════════════════════════════════════════
  function renderMotorLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>⚙️ Motor Parametreleri</h3>
          <div class="calc-tab-nav" style="margin-bottom:18px">
            <button class="calc-mode-btn ${activeMotorMode==="torque"?"active":""}" data-mode="torque">Nm → kW</button>
            <button class="calc-mode-btn ${activeMotorMode==="power"?"active":""}" data-mode="power" style="margin-left:4px">kW → Nm</button>
            <button class="calc-mode-btn ${activeMotorMode==="conveyor"?"active":""}" data-mode="conveyor" style="margin-left:4px">Konveyör Gücü</button>
          </div>
          <div id="motor-inputs" class="calc-grid"></div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="motor-results"></div></div>
      </div>`;
    document.querySelectorAll(".calc-mode-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".calc-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeMotorMode = btn.dataset.mode;
        renderMotorInputs();
      };
    });
    renderMotorInputs();
  }

  function renderMotorInputs() {
    const box = document.getElementById("motor-inputs");
    if (!box) return;
    if (activeMotorMode === "torque") {
      box.innerHTML = `
        <div class="calc-row"><label>Mil Torku (Nm)</label><input type="number" id="m-torque" value="50" min="0.1" step="0.1"/></div>
        <div class="calc-row"><label>Motor Devri (RPM)</label><input type="number" id="m-speed" value="1450" min="10"/></div>`;
      ["m-torque","m-speed"].forEach(id => document.getElementById(id).addEventListener("input", calcMotorTorqueToPower));
      calcMotorTorqueToPower();
    } else if (activeMotorMode === "power") {
      box.innerHTML = `
        <div class="calc-row"><label>Nominal Güç (kW)</label><input type="number" id="m-power" value="15" min="0.1" step="0.1"/></div>
        <div class="calc-row"><label>Motor Devri (RPM)</label><input type="number" id="m-speed" value="1450" min="10"/></div>`;
      ["m-power","m-speed"].forEach(id => document.getElementById(id).addEventListener("input", calcMotorPowerToTorque));
      calcMotorPowerToTorque();
    } else {
      box.innerHTML = `
        <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="calc-row"><label>Yük Kütlesi (kg)</label><input type="number" id="mc-weight" value="250" min="1"/></div>
          <div class="calc-row"><label>Konveyör Hızı (m/s)</label><input type="number" id="mc-speed" value="0.5" min="0.05" step="0.05"/></div>
        </div>
        <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="calc-row"><label>Sürtünme Katsayısı (μ)</label><input type="number" id="mc-friction" value="0.15" min="0.01" step="0.01"/></div>
          <div class="calc-row"><label>Eğim Açısı (°)</label><input type="number" id="mc-angle" value="0" min="0" max="85"/></div>
        </div>
        <div class="calc-row"><label>Mekanik Verimlilik (η)</label><input type="number" id="mc-efficiency" value="0.8" min="0.1" max="1" step="0.05"/></div>`;
      ["mc-weight","mc-speed","mc-friction","mc-angle","mc-efficiency"].forEach(id =>
        document.getElementById(id).addEventListener("input", calcConveyorPower));
      calcConveyorPower();
    }
  }

  function calcMotorTorqueToPower() {
    const torque = parseFloat(document.getElementById("m-torque").value) || 0;
    const speed  = parseFloat(document.getElementById("m-speed").value)  || 1;
    const kw = (torque * speed) / 9550;
    const hp = kw * 1.341;
    const box = document.getElementById("motor-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Gereken Motor Gücü", kw.toFixed(2), "kW", "info", "",
      `<strong>P = (T × n) / 9550</strong><br>${torque} Nm torkta ${speed} RPM için en az <strong>${kw.toFixed(2)} kW</strong> motor.`,
      dataRow("Beygir Gücü", `${hp.toFixed(2)} HP`, false)
    );
  }

  function calcMotorPowerToTorque() {
    const power = parseFloat(document.getElementById("m-power").value) || 0;
    const speed = parseFloat(document.getElementById("m-speed").value) || 1;
    const torque = (9550 * power) / speed;
    const box = document.getElementById("motor-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Nominal Şaft Torku", torque.toFixed(1), "Nm", "info", "",
      `<strong>T = (9550 × P) / n</strong><br>${power} kW, ${speed} RPM → şaftta <strong>${torque.toFixed(1)} Nm</strong> sürekli tork.`,
      ""
    );
  }

  function calcConveyorPower() {
    const weight = parseFloat(document.getElementById("mc-weight").value) || 0;
    const speed  = parseFloat(document.getElementById("mc-speed").value)  || 0;
    const friction   = parseFloat(document.getElementById("mc-friction").value)   || 0;
    const angle      = parseFloat(document.getElementById("mc-angle").value)      || 0;
    const efficiency = parseFloat(document.getElementById("mc-efficiency").value) || 0.8;
    const g = 9.81;
    const rad = angle * Math.PI / 180;
    const Fg = weight * g * Math.sin(rad);
    const Ff = weight * g * Math.cos(rad) * friction;
    const Fn = Fg + Ff;
    const kw = (Fn * speed) / (efficiency * 1000);
    const hp = kw * 1.341;
    const box = document.getElementById("motor-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Gereken Konveyör Gücü", kw.toFixed(2), "kW", "info", "",
      `${weight} kg yükü ${angle}° eğimde μ=${friction} sürtünme katsayısıyla ${speed} m/s hızla hareket ettirmek için <strong>${kw.toFixed(2)} kW</strong> motor.`,
      dataRow("Sürtünme Kuvveti", `${Ff.toFixed(1)} N`, false) +
      dataRow("Eğim Kuvveti", `${Fg.toFixed(1)} N`, false) +
      dataRow("Toplam Kuvvet", `${Fn.toFixed(1)} N`, false) +
      dataRow("Beygir Gücü", `${hp.toFixed(2)} HP`, false)
    );
  }

  // ═══════════════════════════════════════════════════
  // 3. SİGORTA & KESİCİ SEÇİMİ
  // ═══════════════════════════════════════════════════
  function renderBreakerLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>🔌 Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Bağlantı Tipi</label>
              <select id="br-phase">
                <option value="3">3 Fazlı (380 V)</option>
                <option value="1">1 Fazlı (220 V)</option>
              </select></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Motor Gücü (kW)</label><input type="number" id="br-power" value="11" min="0.1" step="0.1"/></div>
              <div class="calc-row"><label>Güç Faktörü (cos φ)</label><input type="number" id="br-cos" value="0.85" min="0.5" max="1" step="0.01"/></div>
            </div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Motor Verimi (η)</label><input type="number" id="br-eta" value="0.92" min="0.5" max="1" step="0.01"/></div>
              <div class="calc-row"><label>Kalkış Akım Çarpanı (Ia/In)</label><input type="number" id="br-ia" value="6" min="3" max="12" step="0.5"/></div>
            </div>
            <div class="calc-row"><label>Sigorta Tipi</label>
              <select id="br-fusetype">
                <option value="gG">gG — Genel Amaçlı (Kablo & Motor Koruması)</option>
                <option value="aM">aM — Motor Koruması (Yalnız Kısa Devre)</option>
              </select></div>
          </div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="br-results"></div></div>
      </div>`;
    ["br-phase","br-power","br-cos","br-eta","br-ia","br-fusetype"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcBreaker);
      document.getElementById(id).addEventListener("change", calcBreaker);
    });
    calcBreaker();
  }

  function calcBreaker() {
    const phase = parseInt(document.getElementById("br-phase").value);
    const power = parseFloat(document.getElementById("br-power").value) || 0;
    const cos   = parseFloat(document.getElementById("br-cos").value)   || 0.85;
    const eta   = parseFloat(document.getElementById("br-eta").value)   || 0.92;
    const iaRatio = parseFloat(document.getElementById("br-ia").value)  || 6;
    const fuseType = document.getElementById("br-fusetype").value;
    const U = phase === 3 ? 380 : 220;

    // Nominal akım
    const In = phase === 3
      ? (power * 1000) / (Math.sqrt(3) * U * cos * eta)
      : (power * 1000) / (U * cos * eta);
    const Ia = In * iaRatio;

    // Sigorta: gG 1.25*In; aM kalkış akımına dayanıklı → 2.5*In tipik seçim
    const fuseMult = fuseType === "gG" ? 1.25 : 2.0;
    const fuseMin = In * fuseMult;
    const fuseVal = SIGORTA_SERISI.find(v => v >= fuseMin) || SIGORTA_SERISI[SIGORTA_SERISI.length-1];

    // Motor koruma şalterleri (MMS) — In'e en yakın standart değer
    const mmsVal = MMS_DEGERLERI.find(v => v >= In) || MMS_DEGERLERI[MMS_DEGERLERI.length-1];

    // Önerilen kablo kesiti (havada bakır)
    const recSec = KESITLER.find(s => (AKIM_KAPASITESI.Cu[s]||0) >= In * 1.25) || 240;

    const box = document.getElementById("br-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Nominal Motor Akımı", In.toFixed(2), "A", "info", "",
      `IEC 60947-4 uyarınca hesaplanmış motor akımı. Kalkış akımı (${iaRatio}×In) = <strong>${Ia.toFixed(1)} A</strong>.`,
      dataRow("Kalkış Akımı (Ia)", `${Ia.toFixed(1)} A`, false) +
      dataRow(`Sigorta (${fuseType}) — Min. ${fuseMin.toFixed(1)} A`, `▶ ${fuseVal} A seç`, true) +
      dataRow("Motor Koruma Şalteri (MMS)", `▶ ${mmsVal} A ayarla`, true) +
      dataRow("Önerilen Min. Kablo Kesiti", `${recSec} mm² Cu`, false)
    );
  }

  // ═══════════════════════════════════════════════════
  // 4. TRANSFORMATÖR YÜK HESABI
  // ═══════════════════════════════════════════════════
  function renderTransformerLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>🏭 Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Toplam Kurulu Güç (kW)</label><input type="number" id="tr-pkw" value="120" min="1" step="1"/></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Eş Zamanlılık Katsayısı (Ks)</label><input type="number" id="tr-ks" value="0.75" min="0.1" max="1" step="0.05"/></div>
              <div class="calc-row"><label>Talep Katsayısı (Kd)</label><input type="number" id="tr-kd" value="0.85" min="0.1" max="1" step="0.05"/></div>
            </div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Ortalama Güç Faktörü (cos φ)</label><input type="number" id="tr-cos" value="0.85" min="0.5" max="1" step="0.01"/></div>
              <div class="calc-row"><label>Trafo Yükleme Oranı (%)</label><input type="number" id="tr-load" value="80" min="50" max="100" step="5"/></div>
            </div>
          </div>
          <p class="muted" style="font-size:12px;margin-top:8px">Ks: aynı anda çalışan yük oranı. Kd: nominal gücün kullanım oranı.</p>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="tr-results"></div></div>
      </div>`;
    ["tr-pkw","tr-ks","tr-kd","tr-cos","tr-load"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcTransformer);
    });
    calcTransformer();
  }

  function calcTransformer() {
    const pkw  = parseFloat(document.getElementById("tr-pkw").value)  || 0;
    const ks   = parseFloat(document.getElementById("tr-ks").value)   || 0.75;
    const kd   = parseFloat(document.getElementById("tr-kd").value)   || 0.85;
    const cos  = parseFloat(document.getElementById("tr-cos").value)  || 0.85;
    const load = parseFloat(document.getElementById("tr-load").value) || 80;

    const activeKw  = pkw * ks * kd;                // Talep edilen aktif güç
    const sin_phi   = Math.sqrt(1 - cos * cos);
    const reactKvar = activeKw * (sin_phi / cos);   // Reaktif güç
    const apparentKva = activeKw / cos;             // Görünen güç (S = P/cosφ)
    const minTrafoKva = apparentKva / (load / 100); // %80 yükte gereken trafo kapasitesi

    // Standart trafo kapasiteleri (kVA)
    const TRAFO_SERISI = [25,50,100,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500];
    const secTrafo = TRAFO_SERISI.find(v => v >= minTrafoKva) || TRAFO_SERISI[TRAFO_SERISI.length-1];

    const box = document.getElementById("tr-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Gereken Min. Trafo Kapasitesi", minTrafoKva.toFixed(0), "kVA", "info", "",
      `%${load} yükleme oranında <strong>${minTrafoKva.toFixed(0)} kVA</strong> görünen güç kapasitesi gerekli.`,
      dataRow("Talep Aktif Güç (P)", `${activeKw.toFixed(1)} kW`, false) +
      dataRow("Reaktif Güç (Q)", `${reactKvar.toFixed(1)} kVAR`, false) +
      dataRow("Görünen Güç (S)", `${apparentKva.toFixed(1)} kVA`, false) +
      dataRow(`Standart Trafo Seçimi (%${load} yük)`, `▶ ${secTrafo} kVA`, true)
    );
  }

  // ═══════════════════════════════════════════════════
  // 5. PNÖMATİK SİLİNDİR KUVVETİ
  // ═══════════════════════════════════════════════════
  function renderPneumaticLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>💨 Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Silindir Tipi</label>
              <select id="pn-type">
                <option value="double">Çift Etkili</option>
                <option value="single">Tek Etkili</option>
              </select></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Piston Çapı — D (mm)</label><input type="number" id="pn-d" value="80" min="8" step="1"/></div>
              <div class="calc-row"><label>Şaft Çapı — d (mm)</label><input type="number" id="pn-d2" value="20" min="4" step="1"/></div>
            </div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Çalışma Basıncı (bar)</label><input type="number" id="pn-p" value="6" min="1" max="16" step="0.5"/></div>
              <div class="calc-row"><label>Mekanik Verim (η)</label><input type="number" id="pn-eta" value="0.9" min="0.5" max="1" step="0.01"/></div>
            </div>
            <div class="calc-row"><label>Strok / Kursu (mm)</label><input type="number" id="pn-stroke" value="150" min="10" step="10"/></div>
          </div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="pn-results"></div></div>
      </div>`;
    ["pn-type","pn-d","pn-d2","pn-p","pn-eta","pn-stroke"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcPneumatic);
      document.getElementById(id).addEventListener("change", calcPneumatic);
    });
    calcPneumatic();
  }

  function calcPneumatic() {
    const type   = document.getElementById("pn-type").value;
    const D      = parseFloat(document.getElementById("pn-d").value)      || 80;
    const d      = parseFloat(document.getElementById("pn-d2").value)     || 20;
    const p      = parseFloat(document.getElementById("pn-p").value)      || 6;
    const eta    = parseFloat(document.getElementById("pn-eta").value)    || 0.9;
    const stroke = parseFloat(document.getElementById("pn-stroke").value) || 150;

    const pPa = p * 1e5; // bar → Pa
    const A1  = Math.PI * (D / 1000) ** 2 / 4; // Piston alanı (m²)
    const A2  = Math.PI * ((D / 1000) ** 2 - (d / 1000) ** 2) / 4; // Geri çekme alanı

    const F_ileri  = A1 * pPa * eta;
    const F_geri   = type === "double" ? A2 * pPa * eta : 0;

    // Hava tüketimi (litre/strok)
    const V1 = A1 * (stroke / 1000) * 1000; // litre
    const V2 = type === "double" ? A2 * (stroke / 1000) * 1000 : 0;
    const Vtotal = (V1 + V2) * (p + 1); // atmosfere normalize (basınçta hava)

    const box = document.getElementById("pn-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "İleri Yön Kuvveti (İtme)", (F_ileri / 1000).toFixed(2), "kN",
      "info", "",
      `Piston alanı A₁ = ${(A1 * 1e4).toFixed(2)} cm² · ${p} bar basınçta η=${eta} verimle <strong>${(F_ileri/1000).toFixed(2)} kN (${(F_ileri/9.81).toFixed(0)} kgf)</strong> itme kuvveti.`,
      dataRow("İtme Kuvveti", `${(F_ileri/1000).toFixed(2)} kN  (${(F_ileri/9.81).toFixed(0)} kgf)`, true) +
      (type === "double"
        ? dataRow("Geri Çekme Kuvveti", `${(F_geri/1000).toFixed(2)} kN  (${(F_geri/9.81).toFixed(0)} kgf)`, false)
        : dataRow("Geri Çekme", "Yay (kuvvet yok)", false)) +
      dataRow("Piston Alanı A₁", `${(A1*1e4).toFixed(2)} cm²`, false) +
      (type === "double" ? dataRow("Geri Çekme Alanı A₂", `${(A2*1e4).toFixed(2)} cm²`, false) : "") +
      dataRow("Strok Hava Tüketimi", `${Vtotal.toFixed(2)} L/strok (norm)`, false)
    );
  }

  // ═══════════════════════════════════════════════════
  // 6. 4–20 mA SİNYAL ÖLÇEKLEMESİ
  // ═══════════════════════════════════════════════════
  function renderSignalLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>📡 Sinyal Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Hesaplama Yönü</label>
              <select id="sg-dir">
                <option value="ma2val">mA → Ölçüm Değeri</option>
                <option value="val2ma">Ölçüm Değeri → mA</option>
              </select></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Ölçüm Aralığı Alt (PV_min)</label><input type="number" id="sg-min" value="0" step="any"/></div>
              <div class="calc-row"><label>Ölçüm Aralığı Üst (PV_max)</label><input type="number" id="sg-max" value="100" step="any"/></div>
            </div>
            <div class="calc-row"><label>Ölçüm Birimi</label>
              <select id="sg-unit">
                <option>°C</option><option>bar</option><option>Pa</option><option>m³/h</option>
                <option>L/min</option><option>mm</option><option>m/s</option><option>%</option><option>rpm</option>
              </select></div>
            <div class="calc-row"><label id="sg-input-lbl">Mevcut Akım (mA)</label>
              <input type="number" id="sg-value" value="12" step="any"/></div>
          </div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="sg-results"></div></div>
      </div>`;
    ["sg-dir","sg-min","sg-max","sg-unit","sg-value"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcSignal);
      document.getElementById(id).addEventListener("change", calcSignal);
    });
    document.getElementById("sg-dir").addEventListener("change", () => {
      const dir = document.getElementById("sg-dir").value;
      document.getElementById("sg-input-lbl").textContent = dir === "ma2val" ? "Mevcut Akım (mA)" : "Ölçüm Değeri";
      document.getElementById("sg-value").value = dir === "ma2val" ? "12" : "50";
      calcSignal();
    });
    calcSignal();
  }

  function calcSignal() {
    const dir   = document.getElementById("sg-dir").value;
    const pvMin = parseFloat(document.getElementById("sg-min").value)   || 0;
    const pvMax = parseFloat(document.getElementById("sg-max").value)   || 100;
    const unit  = document.getElementById("sg-unit").value;
    const val   = parseFloat(document.getElementById("sg-value").value) || 0;

    const MA_MIN = 4, MA_MAX = 20, MA_SPAN = 16;
    const PV_SPAN = pvMax - pvMin;

    let pv, ma, pct;
    if (dir === "ma2val") {
      ma  = val;
      pct = ((ma - MA_MIN) / MA_SPAN) * 100;
      pv  = pvMin + (pct / 100) * PV_SPAN;
    } else {
      pv  = val;
      pct = ((pv - pvMin) / PV_SPAN) * 100;
      ma  = MA_MIN + (pct / 100) * MA_SPAN;
    }

    const okMa  = ma >= MA_MIN && ma <= MA_MAX;
    const okPct = pct >= 0 && pct <= 100;
    const cls   = (okMa && okPct) ? "success" : "danger";
    const lbl   = (okMa && okPct) ? "Geçerli Aralık" : "Aralık Dışı!";

    const box = document.getElementById("sg-results");
    if (!box) return;

    if (dir === "ma2val") {
      box.innerHTML = resultPanel(
        "Ölçüm Değeri", pv.toFixed(3), unit, cls, lbl,
        `4 mA = ${pvMin} ${unit}, 20 mA = ${pvMax} ${unit} → <strong>${ma.toFixed(3)} mA</strong> sinyali <strong>${pv.toFixed(3)} ${unit}</strong> değerine karşılık gelir.`,
        dataRow("Akım Değeri", `${ma.toFixed(3)} mA`, false) +
        dataRow("Span Yüzdesi", `% ${pct.toFixed(2)}`, false) +
        dataRow("Ham ADC (0–65535)", Math.round((pct/100)*65535).toString(), false)
      );
    } else {
      box.innerHTML = resultPanel(
        "Çıkış Akımı", ma.toFixed(3), "mA", cls, lbl,
        `${pvMin}–${pvMax} ${unit} aralığında <strong>${pv.toFixed(3)} ${unit}</strong> değeri → <strong>${ma.toFixed(3)} mA</strong> sinyal çıkışı.`,
        dataRow("Ölçüm Değeri", `${pv.toFixed(3)} ${unit}`, false) +
        dataRow("Span Yüzdesi", `% ${pct.toFixed(2)}`, false) +
        dataRow("PLC Ölçekleme (0–27648)", Math.round((pct/100)*27648).toString(), false)
      );
    }
  }

  // ═══════════════════════════════════════════════════
  // 7. GÜÇ FAKTÖRÜ DÜZELTMESİ (KONDANSATÖr)
  // ═══════════════════════════════════════════════════
  function renderPowerFactorLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>⚡ Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row"><label>Aktif Güç (kW)</label><input type="number" id="pf-kw" value="80" min="1" step="1"/></div>
            <div class="calc-grid" style="grid-template-columns:1fr 1fr;gap:12px">
              <div class="calc-row"><label>Mevcut cos φ₁</label><input type="number" id="pf-cos1" value="0.72" min="0.3" max="0.99" step="0.01"/></div>
              <div class="calc-row"><label>Hedef cos φ₂</label><input type="number" id="pf-cos2" value="0.95" min="0.5" max="1" step="0.01"/></div>
            </div>
            <div class="calc-row"><label>Şebeke Gerilimi (V)</label>
              <select id="pf-volt">
                <option value="380">380 V (3 Faz)</option>
                <option value="400">400 V (3 Faz)</option>
                <option value="6300">6.3 kV (Orta Gerilim)</option>
              </select></div>
          </div>
        </div>
        <div class="calc-card"><h3>📊 Sonuçlar</h3><div id="pf-results"></div></div>
      </div>`;
    ["pf-kw","pf-cos1","pf-cos2","pf-volt"].forEach(id => {
      document.getElementById(id).addEventListener("input", calcPowerFactor);
      document.getElementById(id).addEventListener("change", calcPowerFactor);
    });
    calcPowerFactor();
  }

  function calcPowerFactor() {
    const kw   = parseFloat(document.getElementById("pf-kw").value)   || 0;
    const cos1 = parseFloat(document.getElementById("pf-cos1").value) || 0.72;
    const cos2 = parseFloat(document.getElementById("pf-cos2").value) || 0.95;

    const tan1 = Math.tan(Math.acos(cos1));
    const tan2 = Math.tan(Math.acos(cos2));
    const Qc   = kw * (tan1 - tan2);  // kVAR

    const S1 = kw / cos1;
    const S2 = kw / cos2;
    const I_azalma_pct = ((S1 - S2) / S1 * 100);

    // Kayıp azalma (iletim kayıpları P_loss ~ I² ~ S²)
    const kayip_azalma = (1 - (S2 / S1) ** 2) * 100;

    const cls = Qc > 0 ? "success" : "warning";
    const lbl = Qc > 0 ? "Kompanzasyon Gerekli" : "Hedef Zaten Sağlanıyor";

    const box = document.getElementById("pf-results");
    if (!box) return;
    box.innerHTML = resultPanel(
      "Gereken Kondansatör Gücü", Qc.toFixed(1), "kVAR", cls, lbl,
      `cos φ'yi <strong>${cos1} → ${cos2}</strong>'ye yükseltmek için <strong>${Qc.toFixed(1)} kVAR</strong> kapasitif kompanzasyon uygulanmalıdır.`,
      dataRow("Mevcut Görünen Güç S₁", `${S1.toFixed(1)} kVA`, false) +
      dataRow("Hedef Görünen Güç S₂", `${S2.toFixed(1)} kVA`, false) +
      dataRow("Akım Azalması", `% ${I_azalma_pct.toFixed(1)}`, false) +
      dataRow("İletim Kaybı Azalması", `% ${kayip_azalma.toFixed(1)}`, false) +
      dataRow("Kondansatör Gücü", `▶ ${Qc.toFixed(1)} kVAR`, true)
    );
  }

  return { load };
})();

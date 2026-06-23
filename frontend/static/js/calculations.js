// ===================== MÜHENDİSLİK HESAPLAMALARI =====================
const Calculations = (() => {
  let activeTab = "cable"; // "cable" veya "motor"
  let activeMotorMode = "torque"; // "torque", "power", "conveyor"

  // Akım taşıma kapasiteleri (IEC 60364-5-52, Havada Serbest Boru Dışı Döşeme Tipi C)
  const AKIM_KAPASITESI = {
    Cu: { // Bakır
      1.5: 18, 2.5: 25, 4: 34, 6: 44, 10: 61, 16: 82, 25: 108, 35: 135,
      50: 168, 70: 207, 95: 250, 120: 292, 150: 335, 185: 382, 240: 453
    },
    Al: { // Alüminyum
      1.5: 13, 2.5: 19, 4: 26, 6: 34, 10: 47, 16: 63, 25: 83, 35: 102,
      50: 127, 70: 157, 95: 190, 120: 222, 150: 253, 185: 288, 240: 342
    }
  };

  const KESITLER = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

  function bindEvents() {
    // Sekme Butonları
    document.querySelectorAll(".calc-tab-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".calc-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.calcTab;
        render();
      };
    });
  }

  function load() {
    bindEvents();
    render();
  }

  function render() {
    const container = document.getElementById("calculations-container");
    if (!container) return;

    if (activeTab === "cable") {
      renderCableLayout(container);
    } else if (activeTab === "motor") {
      renderMotorLayout(container);
    } else if (activeTab === "pm-agent") {
      renderPmAgent(container);
    } else {
      renderRiskAgent(container);
    }
  }

  // ===================== KABLO HESABI YERLEŞİMİ =====================
  function renderCableLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>⚡ Giriş Parametreleri</h3>
          <div class="calc-grid">
            <div class="calc-row">
              <label>Bağlantı Tipi (Gerilim)</label>
              <select id="cb-phase">
                <option value="3">3 Fazlı Alternatif Akım (380 V)</option>
                <option value="1">1 Fazlı Alternatif Akım (220 V)</option>
              </select>
            </div>
            <div class="calc-grid" style="grid-template-columns: 1fr 1fr; gap:12px;">
              <div class="calc-row">
                <label>Kurulu Güç (kW)</label>
                <input type="number" id="cb-power" value="15" min="0.1" step="0.1" />
              </div>
              <div class="calc-row">
                <label>Kablo Uzunluğu (Metre)</label>
                <input type="number" id="cb-length" value="80" min="1" />
              </div>
            </div>
            <div class="calc-grid" style="grid-template-columns: 1fr 1fr; gap:12px;">
              <div class="calc-row">
                <label>Kablo İletkeni</label>
                <select id="cb-conductor">
                  <option value="Cu">Bakır (Cu)</option>
                  <option value="Al">Alüminyum (Al)</option>
                </select>
              </div>
              <div class="calc-row">
                <label>Kablo Kesiti (mm²)</label>
                <select id="cb-section">
                  ${KESITLER.map(k => `<option value="${k}" ${k === 6 ? "selected" : ""}>${k} mm²</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="calc-row">
              <label>Güç Faktörü (cos φ)</label>
              <input type="number" id="cb-cos" value="0.85" min="0.5" max="1" step="0.01" />
            </div>
          </div>
        </div>

        <div class="calc-card">
          <h3>📊 Hesaplama Sonuçları</h3>
          <div id="cb-results"></div>
        </div>
      </div>
    `;

    // Dynamic inputs binding
    const inputs = ["cb-phase", "cb-power", "cb-length", "cb-conductor", "cb-section", "cb-cos"];
    inputs.forEach(id => {
      document.getElementById(id).addEventListener("input", calcCable);
      document.getElementById(id).addEventListener("change", calcCable);
    });

    // Run first calculation
    calcCable();
  }

  // ===================== KABLO HESAPLAMA MOTORU =====================
  function calcCable() {
    const phase = parseInt(document.getElementById("cb-phase").value);
    const power = parseFloat(document.getElementById("cb-power").value) || 0;
    const length = parseFloat(document.getElementById("cb-length").value) || 0;
    const conductor = document.getElementById("cb-conductor").value;
    const section = parseFloat(document.getElementById("cb-section").value);
    const cos = parseFloat(document.getElementById("cb-cos").value) || 0.85;

    // k katsayısı (iletkenlik)
    const k = conductor === "Cu" ? 56 : 35; 
    
    // Gerilim ve Akım hesabı
    let U = phase === 3 ? 380 : 220;
    let current = 0;
    let pctDrop = 0;

    if (phase === 3) {
      // 3 Faz Akım: I = P / (1.732 * U * cos φ)
      current = (power * 1000) / (Math.sqrt(3) * U * cos);
      // 3 Faz Gerilim Düşümü formülü: e = (100 * L * P) / (k * S * U^2)  [P Watts]
      pctDrop = (100 * length * (power * 1000)) / (k * section * (U * U));
    } else {
      // 1 Faz Akım: I = P / (U * cos φ)
      current = (power * 1000) / (U * cos);
      // 1 Faz Gerilim Düşümü formülü: e = (200 * L * P) / (k * S * U^2) [P Watts]
      pctDrop = (200 * length * (power * 1000)) / (k * section * (U * U));
    }

    // Akım Taşıma kapasitesi kontrolü
    const nominalCapacity = AKIM_KAPASITESI[conductor][section] || 0;
    const currentExceeded = current > nominalCapacity;

    // Limit analizi (Standart sınır %3'tür)
    let statusClass = "success";
    let statusLabel = "Güvenli (Sınır Altı)";
    let explanation = `Hesaplanan gerilim düşümü standart sınırların (%3.0) altındadır. Seçilen kablo kesiti uygundur.`;

    if (pctDrop > 3.0 && pctDrop <= 5.0) {
      statusClass = "warning";
      statusLabel = "Kritik Sınırda";
      explanation = `Gerilim düşümü standart sınırları (%3) aşmış ancak motor kalkış sınırına (%5) yakındır. Daha kalın bir kablo kesiti seçilmesi önerilir.`;
    } else if (pctDrop > 5.0 || currentExceeded) {
      statusClass = "danger";
      statusLabel = "Yetersiz / Limit Aşımı";
      explanation = currentExceeded 
        ? `Seçilen kablonun akım taşıma kapasitesi (${nominalCapacity} A), sistemin çekeceği akımı (${current.toFixed(1)} A) taşımak için yetersizdir! Yangın riski oluşturur.`
        : `Gerilim düşümü (%${pctDrop.toFixed(2)}) izin verilen maksimum limitlerin (%5.0) üzerindedir! Kablo şaftında aşırı ısınma ve cihazlarda arıza oluşabilir.`;
    }

    // Önerilen Minimum Kesit Hesabı
    let recommendedSection = "Bulunamadı";
    for (let sec of KESITLER) {
      let cap = AKIM_KAPASITESI[conductor][sec] || 0;
      if (current <= cap) {
        let testDrop = 0;
        if (phase === 3) {
          testDrop = (100 * length * (power * 1000)) / (k * sec * (U * U));
        } else {
          testDrop = (200 * length * (power * 1000)) / (k * sec * (U * U));
        }
        if (testDrop <= 3.0) {
          recommendedSection = `${sec} mm²`;
          break;
        }
      }
    }

    const resultBox = document.getElementById("cb-results");
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="calc-result-panel">
        <div class="calc-result-hdr">Gerilim Düşümü Oranı</div>
        <div class="calc-main-val" style="color: ${statusClass === "success" ? "#137333" : (statusClass === "warning" ? "#B06000" : "#C5221F")}">
          % ${pctDrop.toFixed(2)}
        </div>
        
        <div>
          <span class="calc-badge ${statusClass}">${statusLabel}</span>
        </div>

        <div class="calc-info-card" style="border-left-color: ${statusClass === "success" ? "#27ae60" : (statusClass === "warning" ? "#f39c12" : "#e74c3c")}; background: ${statusClass === "success" ? "#E6F4EA" : (statusClass === "warning" ? "#FEF7E0" : "#FCE8E6")}; color: ${statusClass === "success" ? "#137333" : (statusClass === "warning" ? "#B06000" : "#C5221F")}">
          ${explanation}
        </div>

        <div class="calc-data-list">
          <div class="calc-data-row">
            <span>Çekilen Yük Akımı:</span>
            <span style="${currentExceeded ? "color:#C5221F; font-weight:bold" : ""}">${current.toFixed(1)} A</span>
          </div>
          <div class="calc-data-row">
            <span>Seçilen Kesit Kapasitesi:</span>
            <span>${nominalCapacity} A (Havada)</span>
          </div>
          <div class="calc-data-row">
            <span>Maks. İzin Verilen Kayıp:</span>
            <span>% 3.0</span>
          </div>
          <div class="calc-data-row" style="background: rgba(79, 110, 247, 0.08); padding: 8px; border-radius: 6px;">
            <span style="color: var(--primary); font-weight:bold">Önerilen Minimum Kesit:</span>
            <span style="color: var(--primary); font-weight:bold">${recommendedSection}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ===================== MOTOR HESABI YERLEŞİMİ =====================
  function renderMotorLayout(container) {
    container.innerHTML = `
      <div class="calc-layout">
        <div class="calc-card">
          <h3>⚙️ Motor Giriş Parametreleri</h3>
          
          <div class="calc-tab-nav" style="margin-bottom: 18px;">
            <button class="calc-mode-btn ${activeMotorMode === "torque" ? "active" : ""}" data-mode="torque" style="padding:6px 12px; font-size:12px; border:none; border-radius:6px; cursor:pointer;">Nm → kW Hesabı</button>
            <button class="calc-mode-btn ${activeMotorMode === "power" ? "active" : ""}" data-mode="power" style="padding:6px 12px; font-size:12px; border:none; border-radius:6px; cursor:pointer; margin-left:4px">kW → Nm Hesabı</button>
            <button class="calc-mode-btn ${activeMotorMode === "conveyor" ? "active" : ""}" data-mode="conveyor" style="padding:6px 12px; font-size:12px; border:none; border-radius:6px; cursor:pointer; margin-left:4px">Konveyör Güç Hesabı</button>
          </div>

          <div id="motor-inputs" class="calc-grid"></div>
        </div>

        <div class="calc-card">
          <h3>📊 Hesaplama Sonuçları</h3>
          <div id="motor-results"></div>
        </div>
      </div>
    `;

    // Bind sub-tabs (modes)
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

  // ===================== MOTOR GİRİŞLERİNİN RENDER EDİLMESİ =====================
  function renderMotorInputs() {
    const box = document.getElementById("motor-inputs");
    if (!box) return;

    if (activeMotorMode === "torque") {
      box.innerHTML = `
        <div class="calc-row">
          <label>Mil Torku (Nm)</label>
          <input type="number" id="m-torque" value="50" min="0.1" step="0.1" />
        </div>
        <div class="calc-row">
          <label>Motor Devri (RPM)</label>
          <input type="number" id="m-speed" value="1450" min="10" />
        </div>
      `;
      const inputs = ["m-torque", "m-speed"];
      inputs.forEach(id => document.getElementById(id).addEventListener("input", calcMotorTorqueToPower));
      calcMotorTorqueToPower();

    } else if (activeMotorMode === "power") {
      box.innerHTML = `
        <div class="calc-row">
          <label>Motor Nominal Gücü (kW)</label>
          <input type="number" id="m-power" value="15" min="0.1" step="0.1" />
        </div>
        <div class="calc-row">
          <label>Motor Devri (RPM)</label>
          <input type="number" id="m-speed" value="1450" min="10" />
        </div>
      `;
      const inputs = ["m-power", "m-speed"];
      inputs.forEach(id => document.getElementById(id).addEventListener("input", calcMotorPowerToTorque));
      calcMotorPowerToTorque();

    } else {
      // Conveyor
      box.innerHTML = `
        <div class="calc-grid" style="grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="calc-row">
            <label>Taşınacak Yük Kütlesi (kg)</label>
            <input type="number" id="mc-weight" value="250" min="1" />
          </div>
          <div class="calc-row">
            <label>Konveyör Hızı (m/s)</label>
            <input type="number" id="mc-speed" value="0.5" min="0.05" step="0.05" />
          </div>
        </div>
        <div class="calc-grid" style="grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="calc-row">
            <label>Sürtünme Katsayısı (μ)</label>
            <input type="number" id="mc-friction" value="0.15" min="0.01" step="0.01" />
          </div>
          <div class="calc-row">
            <label>Konveyör Eğim Açısı (Derece)</label>
            <input type="number" id="mc-angle" value="0" min="0" max="85" />
          </div>
        </div>
        <div class="calc-row">
          <label>Mekanik Verimlilik (η)</label>
          <input type="number" id="mc-efficiency" value="0.8" min="0.1" max="1" step="0.05" />
        </div>
      `;
      const inputs = ["mc-weight", "mc-speed", "mc-friction", "mc-angle", "mc-efficiency"];
      inputs.forEach(id => document.getElementById(id).addEventListener("input", calcConveyorPower));
      calcConveyorPower();
    }
  }

  // ===================== TORK -> GÜÇ HESABI =====================
  function calcMotorTorqueToPower() {
    const torque = parseFloat(document.getElementById("m-torque").value) || 0;
    const speed = parseFloat(document.getElementById("m-speed").value) || 1;

    // P = (T * n) / 9550
    const powerKw = (torque * speed) / 9550;
    const powerHp = powerKw * 1.341;

    const resultBox = document.getElementById("motor-results");
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="calc-result-panel">
        <div class="calc-result-hdr">Gereken Motor Gücü</div>
        <div class="calc-main-val" style="color: var(--primary)">
          ${powerKw.toFixed(2)} <small>kW</small>
        </div>
        <div style="font-size: 16px; font-weight:600; color:var(--muted)">
          ${powerHp.toFixed(2)} HP (Beygir Gücü)
        </div>
        <div class="calc-info-card">
          <strong>Formül:</strong> P (kW) = (Tork (Nm) × Hız (RPM)) / 9550 <br>
          Girdiğiniz <strong>${torque} Nm</strong> torku <strong>${speed} RPM</strong> hızda sürdürebilmek için nominal olarak en az <strong>${powerKw.toFixed(2)} kW</strong> gücünde bir motor seçmelisiniz.
        </div>
      </div>
    `;
  }

  // ===================== GÜÇ -> TORK HESABI =====================
  function calcMotorPowerToTorque() {
    const power = parseFloat(document.getElementById("m-power").value) || 0;
    const speed = parseFloat(document.getElementById("m-speed").value) || 1;

    // T = (9550 * P) / n
    const torque = (9550 * power) / speed;

    const resultBox = document.getElementById("motor-results");
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="calc-result-panel">
        <div class="calc-result-hdr">Mil Şaft Torku</div>
        <div class="calc-main-val" style="color: var(--primary)">
          ${torque.toFixed(1)} <small>Nm</small>
        </div>
        <div class="calc-info-card">
          <strong>Formül:</strong> T (Nm) = (9550 × Güç (kW)) / Hız (RPM) <br>
          Girdiğiniz <strong>${power} kW</strong> gücündeki motor, <strong>${speed} RPM</strong> nominal hızda dönerken şaftında sürekli olarak <strong>${torque.toFixed(1)} Nm</strong> nominal tork üretebilir.
        </div>
      </div>
    `;
  }

  // ===================== KONVEYÖR GÜÇ HESABI =====================
  function calcConveyorPower() {
    const weight = parseFloat(document.getElementById("mc-weight").value) || 0;
    const speed = parseFloat(document.getElementById("mc-speed").value) || 0;
    const friction = parseFloat(document.getElementById("mc-friction").value) || 0;
    const angleDegree = parseFloat(document.getElementById("mc-angle").value) || 0;
    const efficiency = parseFloat(document.getElementById("mc-efficiency").value) || 0.8;

    const g = 9.81; // yerçekimi
    const angleRad = (angleDegree * Math.PI) / 180;

    // Eğim ve Sürtünme Kuvveti
    const F_gravity = weight * g * Math.sin(angleRad);
    const F_friction = weight * g * Math.cos(angleRad) * friction;
    const F_net = F_gravity + F_friction;

    // Gereken Güç: P = (F_net * v) / efficiency (Watts cinsinden)
    const powerWatts = (F_net * speed) / efficiency;
    const powerKw = powerWatts / 1000;
    const powerHp = powerKw * 1.341;

    const resultBox = document.getElementById("motor-results");
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="calc-result-panel">
        <div class="calc-result-hdr">Gereken Konveyör Gücü</div>
        <div class="calc-main-val" style="color: var(--primary)">
          ${powerKw.toFixed(2)} <small>kW</small>
        </div>
        <div style="font-size: 16px; font-weight:600; color:var(--muted)">
          ${powerHp.toFixed(2)} HP (Beygir Gücü)
        </div>

        <div class="calc-data-list">
          <div class="calc-data-row">
            <span>Sürtünme Direnç Kuvveti:</span>
            <span>${F_friction.toFixed(1)} N</span>
          </div>
          <div class="calc-data-row">
            <span>Eğim Yerçekimi Kuvveti:</span>
            <span>${F_gravity.toFixed(1)} N</span>
          </div>
          <div class="calc-data-row">
            <span>Toplam Karşı Kuvvet (F_net):</span>
            <span>${F_net.toFixed(1)} N</span>
          </div>
        </div>

        <div class="calc-info-card">
          <strong>Açıklama:</strong> <br>
          Girdiğiniz kütleyi (${weight} kg) sürtünme katsayısı ${friction} olan ${angleDegree}° eğimli bir bantta ${speed} m/s hızla hareket ettirmek için, mekanik verimliliği %${efficiency * 100} olan tahrik grubunda en az <strong>${powerKw.toFixed(2)} kW</strong> gücünde bir motor kullanılmalıdır.
        </div>
      </div>
    `;
  }

  // ===================== PM KOORDİNATÖR AJAN PANELİ =====================
  async function renderPmAgent(container) {
    container.innerHTML = `<div class="agent-loading">🤖 PM Koordinatör çalışıyor…</div>`;
    let data;
    try {
      data = await API.get("/agents/pm");
    } catch (e) {
      container.innerHTML = `<div class="agent-error">Ajan çalıştırılamadı: ${e.message || e}</div>`;
      return;
    }

    const st = data.istatistik || {};
    const tipIcon = { baslat: "▶", engel: "🚫", uyari: "⚠️" };
    const oncelikRenk = { kritik: "#e74c3c", yuksek: "#e67e22", orta: "#f39c12", dusuk: "#27ae60" };

    const fazHtml = (data.faz_ozet || []).map(f => `
      <div class="agent-faz-row">
        <span class="agent-faz-adi">${UI.esc(f.faz)}</span>
        <div class="agent-faz-bar-wrap">
          <div class="agent-faz-bar" style="width:${f.pct}%"></div>
        </div>
        <span class="agent-faz-pct">%${f.pct} (${f.tamamlanan}/${f.toplam})</span>
      </div>`).join("");

    const maddelerHtml = (data.maddeler || []).map(m => `
      <div class="agent-madde" style="border-left-color:${oncelikRenk[m.oncelik] || "#4f6ef7"}">
        <span class="agent-madde-ikon">${tipIcon[m.tip] || "•"}</span>
        <span>${UI.esc(m.mesaj)}</span>
      </div>`).join("") || `<p class="muted">Aksiyon gerektiren madde yok.</p>`;

    container.innerHTML = `
      <div class="agent-panel">
        <div class="agent-header">
          <div class="agent-badge">🤖 ${UI.esc(data.ajan)}</div>
          <h3>${UI.esc(data.baslik)}</h3>
          <p class="muted">${UI.esc(data.aciklama)}</p>
        </div>

        <div class="agent-stat-row">
          <div class="agent-stat"><div class="num">${st.toplam || 0}</div><div class="lbl">Toplam</div></div>
          <div class="agent-stat accent-green"><div class="num">${st.tamamlanan || 0}</div><div class="lbl">Tamamlanan</div></div>
          <div class="agent-stat accent-blue"><div class="num">${st.devam_eden || 0}</div><div class="lbl">Devam Eden</div></div>
          <div class="agent-stat accent-red"><div class="num">${st.engellenen || 0}</div><div class="lbl">Engellenen</div></div>
          <div class="agent-stat"><div class="num">${st.planlandi || 0}</div><div class="lbl">Planlandı</div></div>
          <div class="agent-stat"><div class="num">%${st.genel_pct || 0}</div><div class="lbl">Genel İlerleme</div></div>
        </div>

        <div class="agent-section">
          <h4>📋 Aksiyon Listesi</h4>
          <div class="agent-maddeler">${maddelerHtml}</div>
        </div>

        <div class="agent-section">
          <h4>🔄 Faz İlerlemesi</h4>
          <div class="agent-faz-list">${fazHtml || '<p class="muted">Faz verisi yok.</p>'}</div>
        </div>

        <button class="btn btn-ghost btn-sm" onclick="Calculations.refreshPm()">↻ Yenile</button>
      </div>
    `;
  }

  // ===================== RİSK/QA AJAN PANELİ =====================
  async function renderRiskAgent(container) {
    container.innerHTML = `<div class="agent-loading">⚠️ Risk/QA Ajanı analiz ediyor…</div>`;
    let data;
    try {
      data = await API.get("/agents/risk");
    } catch (e) {
      container.innerHTML = `<div class="agent-error">Ajan çalıştırılamadı: ${e.message || e}</div>`;
      return;
    }

    const seviyeRenk = { kritik: "#e74c3c", yuksek: "#e67e22", orta: "#f39c12", bilgi: "#4f6ef7" };
    const seviyeIkon = { kritik: "🔴", yuksek: "🟠", orta: "🟡", bilgi: "🔵" };

    const risklerHtml = (data.riskler || []).map(r => `
      <div class="agent-madde" style="border-left-color:${seviyeRenk[r.seviye] || "#aaa"}">
        <span class="agent-madde-ikon">${seviyeIkon[r.seviye] || "•"}</span>
        <span>${UI.esc(r.mesaj)}</span>
        ${r.gorev_id ? `<span class="pill" style="margin-left:auto;font-size:11px">${UI.esc(r.gorev_id)}</span>` : ""}
      </div>`).join("") || `<p class="muted">Risk maddesi tespit edilmedi. ✅</p>`;

    const skorRenk = data.risk_skoru >= 20 ? "#e74c3c" : data.risk_skoru >= 10 ? "#e67e22" : data.risk_skoru >= 5 ? "#f39c12" : "#27ae60";

    const hazirHtml = (label, hazir) => `
      <div class="agent-hazir-row">
        <span>${label}</span>
        <span class="pill ${hazir ? "accent-green" : "accent-red"}">${hazir ? "✅ Hazır" : "⏳ Bekliyor"}</span>
      </div>`;

    container.innerHTML = `
      <div class="agent-panel">
        <div class="agent-header">
          <div class="agent-badge">⚠️ ${UI.esc(data.ajan)}</div>
          <h3>${UI.esc(data.baslik)}</h3>
          <p class="muted">${UI.esc(data.aciklama)}</p>
        </div>

        <div class="agent-stat-row">
          <div class="agent-stat" style="border-top:3px solid ${skorRenk}">
            <div class="num" style="color:${skorRenk}">${data.risk_skoru}</div>
            <div class="lbl">Risk Skoru</div>
          </div>
          <div class="agent-stat">
            <div class="num" style="color:${skorRenk}">${UI.esc(data.risk_seviyesi)}</div>
            <div class="lbl">Risk Seviyesi</div>
          </div>
          <div class="agent-stat">
            <div class="num">${data.kritik_yol_sayisi || 0}</div>
            <div class="lbl">Kritik Yol Görevi</div>
          </div>
          <div class="agent-stat">
            <div class="num">${(data.riskler || []).length}</div>
            <div class="lbl">Risk Maddesi</div>
          </div>
        </div>

        <div class="agent-section">
          <h4>🛤️ FAT / SAT Hazırlık Durumu</h4>
          <div class="agent-hazir-list">
            ${hazirHtml("FAT (Fabrika Kabul Testi)", data.fat_hazir)}
            ${hazirHtml("SAT (Saha Kabul Testi)", data.sat_hazir)}
          </div>
        </div>

        <div class="agent-section">
          <h4>🔍 Risk Maddeleri</h4>
          <div class="agent-maddeler">${risklerHtml}</div>
        </div>

        <button class="btn btn-ghost btn-sm" onclick="Calculations.refreshRisk()">↻ Yenile</button>
      </div>
    `;
  }

  function refreshPm() {
    const container = document.getElementById("calculations-container");
    if (container) renderPmAgent(container);
  }

  function refreshRisk() {
    const container = document.getElementById("calculations-container");
    if (container) renderRiskAgent(container);
  }

  return { load, refreshPm, refreshRisk };
})();

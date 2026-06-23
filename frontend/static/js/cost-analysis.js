// ===================== PROJE MALİYET ANALİZİ =====================
const CostAnalysis = (() => {

  // ─── Durum ───────────────────────────────────────────────────
  let state = {
    proje: { ad: 'Yeni Otomasyon Projesi', sure_yil: 5, iskonto: 10, kdv: 20 },
    capex: [],
    opex:  [],
    tasarruf: [],
    activeTab: 'capex',
  };
  let nextId = 1;

  const CAPEX_KATEGORILER = [
    'PLC & Otomasyon Donanımı', 'SCADA & HMI Sistemleri', 'Sensör & Enstrüman',
    'Elektrik Panosu & Kablaj', 'Mekanik & Montaj', 'Yazılım & Lisans',
    'Mühendislik & Tasarım', 'Devreye Alma & Test', 'Eğitim', 'Diğer',
  ];
  const OPEX_KATEGORILER = [
    'Bakım & Servis', 'Enerji Gideri', 'Operatör İşçiliği',
    'Yedek Parça', 'Yazılım Lisansı (Yıllık)', 'Sigorta', 'Diğer',
  ];
  const TASARRUF_KATEGORILER = [
    'İşçilik Tasarrufu', 'Enerji Tasarrufu', 'Fire & Iskarta Azalması',
    'Verimlilik Artışı (OEE)', 'Kalite & Yeniden İşleme', 'Duruş Süresi Azalması',
    'Hammadde Optimizasyonu', 'Diğer',
  ];

  // ─── Başlat ──────────────────────────────────────────────────
  function load() {
    _seedDefaults();
    _render();
  }

  function _seedDefaults() {
    if (state.capex.length) return;
    _addRow('capex', { kategori: 'PLC & Otomasyon Donanımı', aciklama: 'Siemens S7-1500 PLC + I/O modülleri', miktar: 2, birim: 'adet', birim_fiyat: 85000 });
    _addRow('capex', { kategori: 'SCADA & HMI Sistemleri', aciklama: 'WinCC SCADA lisansı + HMI panel', miktar: 1, birim: 'takım', birim_fiyat: 60000 });
    _addRow('capex', { kategori: 'Sensör & Enstrüman', aciklama: 'Akış, basınç, sıcaklık transmitterleri', miktar: 24, birim: 'adet', birim_fiyat: 4500 });
    _addRow('capex', { kategori: 'Elektrik Panosu & Kablaj', aciklama: 'MCC panosu + kablaj malzemeleri', miktar: 1, birim: 'takım', birim_fiyat: 120000 });
    _addRow('capex', { kategori: 'Mühendislik & Tasarım', aciklama: 'Proje mühendisliği & yazılım geliştirme', miktar: 800, birim: 'adam-saat', birim_fiyat: 450 });
    _addRow('capex', { kategori: 'Devreye Alma & Test', aciklama: 'FAT + SAT + saha devreye alma', miktar: 1, birim: 'takım', birim_fiyat: 35000 });
    _addRow('capex', { kategori: 'Eğitim', aciklama: 'Operatör ve bakım eğitimi', miktar: 1, birim: 'takım', birim_fiyat: 15000 });

    _addRow('opex', { kategori: 'Bakım & Servis', aciklama: 'Yıllık önleyici bakım sözleşmesi', yillik_tutar: 28000 });
    _addRow('opex', { kategori: 'Yedek Parça', aciklama: 'Yıllık yedek parça stok maliyeti', yillik_tutar: 12000 });
    _addRow('opex', { kategori: 'Yazılım Lisansı (Yıllık)', aciklama: 'SCADA yıllık lisans bedeli', yillik_tutar: 8000 });
    _addRow('opex', { kategori: 'Enerji Gideri', aciklama: 'Sistem enerji tüketimi artışı', yillik_tutar: 5000 });

    _addRow('tasarruf', { kategori: 'İşçilik Tasarrufu', aciklama: 'Otomasyon ile azalan operatör ihtiyacı (4 kişi)', yillik_tutar: 320000 });
    _addRow('tasarruf', { kategori: 'Fire & Iskarta Azalması', aciklama: 'Kalite kontrol iyileşmesi (%3 fire azalması)', yillik_tutar: 95000 });
    _addRow('tasarruf', { kategori: 'Verimlilik Artışı (OEE)', aciklama: 'OEE %12 artış → ek üretim kapasitesi', yillik_tutar: 180000 });
    _addRow('tasarruf', { kategori: 'Enerji Tasarrufu', aciklama: 'Optimize çalışma ile enerji azalması', yillik_tutar: 42000 });
    _addRow('tasarruf', { kategori: 'Duruş Süresi Azalması', aciklama: 'Prediktif bakım ile arıza kayıpları azalması', yillik_tutar: 65000 });
  }

  function _addRow(table, data = {}) {
    const id = nextId++;
    if (table === 'capex') {
      state.capex.push({ id, kategori: data.kategori || CAPEX_KATEGORILER[0], aciklama: data.aciklama || '', miktar: data.miktar || 1, birim: data.birim || 'adet', birim_fiyat: data.birim_fiyat || 0 });
    } else if (table === 'opex') {
      state.opex.push({ id, kategori: data.kategori || OPEX_KATEGORILER[0], aciklama: data.aciklama || '', yillik_tutar: data.yillik_tutar || 0 });
    } else {
      state.tasarruf.push({ id, kategori: data.kategori || TASARRUF_KATEGORILER[0], aciklama: data.aciklama || '', yillik_tutar: data.yillik_tutar || 0 });
    }
  }

  function _removeRow(table, id) {
    state[table] = state[table].filter(r => r.id !== id);
    _render();
  }

  // ─── Hesapla ──────────────────────────────────────────────────
  function _calc() {
    const totalCapex = state.capex.reduce((s, r) => s + r.miktar * r.birim_fiyat, 0);
    const totalCapexKdv = totalCapex * (1 + state.proje.kdv / 100);
    const totalOpex  = state.opex.reduce((s, r) => s + r.yillik_tutar, 0);
    const totalSav   = state.tasarruf.reduce((s, r) => s + r.yillik_tutar, 0);
    const netYillik  = totalSav - totalOpex;
    const payback    = netYillik > 0 ? totalCapexKdv / netYillik : Infinity;
    const roiPct     = totalCapexKdv > 0 ? (netYillik * state.proje.sure_yil / totalCapexKdv) * 100 : 0;
    const r          = state.proje.iskonto / 100;
    const sure       = state.proje.sure_yil;

    // NPV
    let npv = -totalCapexKdv;
    for (let t = 1; t <= sure; t++) npv += netYillik / Math.pow(1 + r, t);

    // IRR — ikiye böl
    let irr = null;
    if (netYillik > 0 && totalCapexKdv > 0) {
      let lo = -0.99, hi = 10;
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        let npvMid = -totalCapexKdv;
        for (let t = 1; t <= sure; t++) npvMid += netYillik / Math.pow(1 + mid, t);
        if (npvMid > 0) lo = mid; else hi = mid;
      }
      irr = (lo + hi) / 2 * 100;
    }

    // Yıllık nakit akış tablosu
    const cashFlow = [];
    let cumulative = -totalCapexKdv;
    cashFlow.push({ yil: 0, nakit: -totalCapexKdv, kümülatif: cumulative });
    for (let t = 1; t <= sure; t++) {
      cumulative += netYillik;
      cashFlow.push({ yil: t, nakit: netYillik, kümülatif: cumulative });
    }

    // CAPEX kategori dağılımı
    const capexByKat = {};
    state.capex.forEach(r => {
      capexByKat[r.kategori] = (capexByKat[r.kategori] || 0) + r.miktar * r.birim_fiyat;
    });

    return { totalCapex, totalCapexKdv, totalOpex, totalSav, netYillik, payback, roiPct, npv, irr, cashFlow, capexByKat };
  }

  // ─── Render ana ───────────────────────────────────────────────
  function _render() {
    const panel = document.getElementById('panel-costanalysis');
    if (!panel) return;
    const res = _calc();
    panel.innerHTML = `
      <div class="ca-layout">
        ${_renderLeft(res)}
        ${_renderRight(res)}
      </div>
    `;
    _bindAll();
  }

  function _renderLeft(res) {
    const tabs = [
      { key: 'capex',    label: '🏗️ CAPEX Kalemleri' },
      { key: 'opex',     label: '🔄 OPEX (Yıllık Gider)' },
      { key: 'tasarruf', label: '💚 Tasarruf & Kazanımlar' },
      { key: 'ayarlar',  label: '⚙️ Proje Ayarları' },
    ];
    return `
      <div class="ca-left">
        <div class="ca-inner-tabs">
          ${tabs.map(t => `<button class="ca-itab ${state.activeTab === t.key ? 'active' : ''}" data-ca-tab="${t.key}">${t.label}</button>`).join('')}
        </div>
        <div class="ca-tab-body">
          ${state.activeTab === 'capex'    ? _renderCapexTab()    : ''}
          ${state.activeTab === 'opex'     ? _renderOpexTab()     : ''}
          ${state.activeTab === 'tasarruf' ? _renderTasarrufTab() : ''}
          ${state.activeTab === 'ayarlar'  ? _renderAyarlarTab()  : ''}
        </div>
      </div>`;
  }

  function _renderCapexTab() {
    return `
      <div class="ca-table-wrap">
        <table class="ca-table">
          <thead><tr>
            <th>Kategori</th><th>Açıklama</th><th>Miktar</th><th>Birim</th><th>Birim Fiyat (₺)</th><th>Toplam (₺)</th><th></th>
          </tr></thead>
          <tbody>
            ${state.capex.map(r => `
              <tr data-id="${r.id}" data-tbl="capex">
                <td><select class="ca-sel" data-field="kategori">
                  ${CAPEX_KATEGORILER.map(k => `<option ${k===r.kategori?'selected':''}>${k}</option>`).join('')}
                </select></td>
                <td><input class="ca-inp" data-field="aciklama" value="${UI.esc(r.aciklama)}" placeholder="Kalem açıklaması"/></td>
                <td><input class="ca-inp ca-num" data-field="miktar" type="number" value="${r.miktar}" min="0" step="any" style="width:70px"/></td>
                <td><input class="ca-inp" data-field="birim" value="${UI.esc(r.birim)}" style="width:70px" placeholder="adet"/></td>
                <td><input class="ca-inp ca-num" data-field="birim_fiyat" type="number" value="${r.birim_fiyat}" min="0" step="any" style="width:110px"/></td>
                <td class="ca-total">${_fmt(r.miktar * r.birim_fiyat)}</td>
                <td><button class="ca-del-btn" data-id="${r.id}" data-tbl="capex">✕</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <button class="btn btn-primary ca-add-btn" data-tbl="capex">+ Kalem Ekle</button>
      </div>`;
  }

  function _renderOpexTab() {
    return `
      <div class="ca-table-wrap">
        <p class="muted" style="margin-bottom:12px;font-size:12px">Yıllık sabit ve değişken işletme giderleri (KDV hariç)</p>
        <table class="ca-table">
          <thead><tr>
            <th>Kategori</th><th>Açıklama</th><th>Yıllık Tutar (₺)</th><th></th>
          </tr></thead>
          <tbody>
            ${state.opex.map(r => `
              <tr data-id="${r.id}" data-tbl="opex">
                <td><select class="ca-sel" data-field="kategori">
                  ${OPEX_KATEGORILER.map(k => `<option ${k===r.kategori?'selected':''}>${k}</option>`).join('')}
                </select></td>
                <td><input class="ca-inp" data-field="aciklama" value="${UI.esc(r.aciklama)}" placeholder="Açıklama"/></td>
                <td><input class="ca-inp ca-num" data-field="yillik_tutar" type="number" value="${r.yillik_tutar}" min="0" step="any" style="width:140px"/></td>
                <td><button class="ca-del-btn" data-id="${r.id}" data-tbl="opex">✕</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <button class="btn btn-primary ca-add-btn" data-tbl="opex">+ Kalem Ekle</button>
      </div>`;
  }

  function _renderTasarrufTab() {
    return `
      <div class="ca-table-wrap">
        <p class="muted" style="margin-bottom:12px;font-size:12px">Otomasyon sayesinde elde edilecek yıllık tasarruf ve kazanımlar</p>
        <table class="ca-table">
          <thead><tr>
            <th>Kategori</th><th>Açıklama</th><th>Yıllık Kazanım (₺)</th><th></th>
          </tr></thead>
          <tbody>
            ${state.tasarruf.map(r => `
              <tr data-id="${r.id}" data-tbl="tasarruf">
                <td><select class="ca-sel" data-field="kategori">
                  ${TASARRUF_KATEGORILER.map(k => `<option ${k===r.kategori?'selected':''}>${k}</option>`).join('')}
                </select></td>
                <td><input class="ca-inp" data-field="aciklama" value="${UI.esc(r.aciklama)}" placeholder="Açıklama"/></td>
                <td><input class="ca-inp ca-num" data-field="yillik_tutar" type="number" value="${r.yillik_tutar}" min="0" step="any" style="width:140px"/></td>
                <td><button class="ca-del-btn" data-id="${r.id}" data-tbl="tasarruf">✕</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <button class="btn btn-primary ca-add-btn" data-tbl="tasarruf">+ Kalem Ekle</button>
      </div>`;
  }

  function _renderAyarlarTab() {
    return `
      <div class="ca-ayarlar">
        <div class="ca-ayr-row">
          <label>Proje Adı</label>
          <input class="ca-inp" id="ay-ad" value="${UI.esc(state.proje.ad)}"/>
        </div>
        <div class="ca-ayr-row">
          <label>Analiz Süresi (yıl)</label>
          <input class="ca-inp ca-num" id="ay-sure" type="number" value="${state.proje.sure_yil}" min="1" max="20"/>
        </div>
        <div class="ca-ayr-row">
          <label>İskonto Oranı / WACC (%)</label>
          <input class="ca-inp ca-num" id="ay-iskonto" type="number" value="${state.proje.iskonto}" min="0" max="50" step="0.5"/>
        </div>
        <div class="ca-ayr-row">
          <label>KDV Oranı (%)</label>
          <input class="ca-inp ca-num" id="ay-kdv" type="number" value="${state.proje.kdv}" min="0" max="30"/>
        </div>
        <p class="muted" style="font-size:12px;margin-top:16px">İskonto oranı: şirketin sermaye maliyeti (WACC) veya hedef getiri oranı.</p>
      </div>`;
  }

  // ─── Sağ panel: Özet + Analiz ────────────────────────────────
  function _renderRight(res) {
    const { totalCapex, totalCapexKdv, totalOpex, totalSav, netYillik, payback, roiPct, npv, irr, cashFlow, capexByKat } = res;
    const isViable = npv > 0 && payback < state.proje.sure_yil;
    const verdict  = isViable ? 'success' : 'danger';
    const verdictTxt = isViable ? '✅ Yatırım Karlı' : '❌ Yatırım Riskli';

    return `
      <div class="ca-right">
        <!-- KARAR KART -->
        <div class="ca-verdict ${verdict}">
          <div class="ca-verdict-badge">${verdictTxt}</div>
          <div class="ca-verdict-sub">${state.proje.ad} · ${state.proje.sure_yil} Yıllık Analiz</div>
        </div>

        <!-- ANA METRİKLER -->
        <div class="ca-metrics">
          ${_metric('Toplam Yatırım (CAPEX+KDV)', _fmt(totalCapexKdv), '#4f6ef7')}
          ${_metric('Yıllık Net Kazanım', _fmt(netYillik), netYillik >= 0 ? '#27ae60' : '#e74c3c')}
          ${_metric('Geri Ödeme Süresi', payback === Infinity ? '—' : `${payback.toFixed(1)} yıl`, payback < 3 ? '#27ae60' : payback < 5 ? '#f39c12' : '#e74c3c')}
          ${_metric('ROI', `% ${roiPct.toFixed(0)}`, roiPct > 100 ? '#27ae60' : '#f39c12')}
          ${_metric('NPV', `${npv >= 0 ? '+' : ''}${_fmt(npv)}`, npv >= 0 ? '#27ae60' : '#e74c3c')}
          ${_metric('IRR', irr !== null ? `% ${irr.toFixed(1)}` : '—', irr !== null && irr > state.proje.iskonto ? '#27ae60' : '#e74c3c')}
        </div>

        <!-- MALİYET ÖZET -->
        <div class="ca-section">
          <div class="ca-section-title">💰 Maliyet Özeti</div>
          ${_sumRow('CAPEX (KDV Hariç)', totalCapex)}
          ${_sumRow(`KDV (%${state.proje.kdv})`, totalCapex * state.proje.kdv / 100, '#e74c3c')}
          ${_sumRow('CAPEX (KDV Dahil)', totalCapexKdv, '#1f2433', true)}
          <div style="height:8px"></div>
          ${_sumRow('Yıllık OPEX', totalOpex, '#e74c3c')}
          ${_sumRow('Yıllık Tasarruf', totalSav, '#27ae60')}
          ${_sumRow('Yıllık Net Kazanım', netYillik, netYillik >= 0 ? '#27ae60' : '#e74c3c', true)}
        </div>

        <!-- NAKİT AKIŞ TABLOSU -->
        <div class="ca-section">
          <div class="ca-section-title">📈 Nakit Akış Tablosu</div>
          <table class="ca-cf-table">
            <thead><tr><th>Yıl</th><th>Yıllık Nakit (₺)</th><th>Kümülatif (₺)</th><th>Durum</th></tr></thead>
            <tbody>
              ${cashFlow.map(cf => `
                <tr>
                  <td>${cf.yil === 0 ? 'Y0 (Yatırım)' : `Y${cf.yil}`}</td>
                  <td style="color:${cf.nakit >= 0 ? '#27ae60' : '#e74c3c'}">${_fmt(cf.nakit)}</td>
                  <td style="color:${cf.kümülatif >= 0 ? '#27ae60' : '#e74c3c'}">${_fmt(cf.kümülatif)}</td>
                  <td>${cf.kümülatif >= 0 ? '<span class="pill" style="background:#d4edda;color:#1a7a3a">Pozitif</span>' : '<span class="pill" style="background:#fde8e8;color:#c0392b">Negatif</span>'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <!-- CAPEX KATEGORİ DAĞILIMI -->
        <div class="ca-section">
          <div class="ca-section-title">🏗️ CAPEX Dağılımı</div>
          ${Object.entries(capexByKat).sort((a,b) => b[1]-a[1]).map(([kat, val]) => {
            const pct = totalCapex > 0 ? val / totalCapex * 100 : 0;
            return `<div class="ca-bar-row">
              <div class="ca-bar-lbl">${kat}</div>
              <div class="ca-bar-wrap"><div class="ca-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
              <div class="ca-bar-val">${_fmt(val)} <span class="muted">(% ${pct.toFixed(0)})</span></div>
            </div>`;
          }).join('')}
        </div>

        <!-- SUNUM BUTONU -->
        <button class="btn btn-primary ca-print-btn" onclick="CostAnalysis.printSunum()">🖨️ Yönetim Sunumu Hazırla</button>
      </div>`;
  }

  function _metric(label, val, color) {
    return `<div class="ca-metric"><div class="ca-metric-val" style="color:${color}">${val}</div><div class="ca-metric-lbl">${label}</div></div>`;
  }
  function _sumRow(label, val, color = '#1f2433', bold = false) {
    return `<div class="ca-sum-row ${bold ? 'bold' : ''}">
      <span>${label}</span>
      <span style="color:${color}">${_fmt(val)}</span>
    </div>`;
  }
  function _fmt(n) {
    if (!isFinite(n)) return '—';
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e9) return sign + (abs/1e9).toFixed(2) + ' Mrd ₺';
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(2) + ' M ₺';
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(1) + ' K ₺';
    return sign + abs.toFixed(0) + ' ₺';
  }

  // ─── Eventler ─────────────────────────────────────────────────
  function _bindAll() {
    // İç sekmeler
    document.querySelectorAll('.ca-itab').forEach(btn => {
      btn.onclick = () => { state.activeTab = btn.dataset.caTab; _render(); };
    });

    // Tablo satır değişiklikleri
    document.querySelectorAll('tr[data-id]').forEach(row => {
      const id  = parseInt(row.dataset.id);
      const tbl = row.dataset.tbl;
      const rec = state[tbl].find(r => r.id === id);
      if (!rec) return;
      row.querySelectorAll('.ca-inp, .ca-sel').forEach(inp => {
        inp.addEventListener('input', () => {
          const field = inp.dataset.field;
          const v = (inp.type === 'number') ? (parseFloat(inp.value) || 0) : inp.value;
          rec[field] = v;
          // Sadece toplam hücresini güncelle (satır yeniden render'dan kaç)
          const totalCell = row.querySelector('.ca-total');
          if (totalCell && tbl === 'capex') {
            totalCell.textContent = _fmt(rec.miktar * rec.birim_fiyat);
          }
          _refreshRight();
        });
      });
    });

    // Silme butonları
    document.querySelectorAll('.ca-del-btn').forEach(btn => {
      btn.onclick = () => _removeRow(btn.dataset.tbl, parseInt(btn.dataset.id));
    });

    // Ekleme butonları
    document.querySelectorAll('.ca-add-btn').forEach(btn => {
      btn.onclick = () => { _addRow(btn.dataset.tbl); _render(); };
    });

    // Ayarlar
    const ayAd = document.getElementById('ay-ad');
    if (ayAd) {
      ayAd.addEventListener('input', () => { state.proje.ad = ayAd.value; _refreshRight(); });
      document.getElementById('ay-sure').addEventListener('input', e => { state.proje.sure_yil = parseInt(e.target.value)||5; _refreshRight(); });
      document.getElementById('ay-iskonto').addEventListener('input', e => { state.proje.iskonto = parseFloat(e.target.value)||10; _refreshRight(); });
      document.getElementById('ay-kdv').addEventListener('input', e => { state.proje.kdv = parseFloat(e.target.value)||20; _refreshRight(); });
    }
  }

  function _refreshRight() {
    const right = document.querySelector('.ca-right');
    if (!right) return;
    const res = _calc();
    right.outerHTML; // dummy read
    const tmp = document.createElement('div');
    tmp.innerHTML = _renderRight(res);
    right.replaceWith(tmp.firstElementChild);
  }

  // ─── Sunum Yazdır ─────────────────────────────────────────────
  function printSunum() {
    const res = _calc();
    const { totalCapex, totalCapexKdv, totalOpex, totalSav, netYillik, payback, roiPct, npv, irr, cashFlow, capexByKat } = res;
    const isViable = npv > 0 && payback < state.proje.sure_yil;
    const now = new Date().toLocaleDateString('tr-TR', { day:'2-digit', month:'long', year:'numeric' });

    const html = `<!DOCTYPE html><html lang="tr"><head>
    <meta charset="UTF-8"/>
    <title>Yatırım Analizi — ${UI.esc(state.proje.ad)}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a2e;background:#fff;padding:28px 36px}
      h1{font-size:22px;font-weight:700;color:#2c3e7a;margin-bottom:4px}
      .sub{color:#666;font-size:12px;margin-bottom:24px}
      .verdict{display:inline-block;padding:6px 18px;border-radius:20px;font-weight:700;font-size:14px;margin-bottom:20px;
        ${isViable ? 'background:#d4edda;color:#1a7a3a' : 'background:#fde8e8;color:#c0392b'}}
      .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
      .metric{border:1px solid #e5e9f2;border-radius:8px;padding:12px 16px;text-align:center}
      .metric .val{font-size:18px;font-weight:700}
      .metric .lbl{font-size:11px;color:#666;margin-top:4px}
      h2{font-size:14px;font-weight:700;color:#2c3e7a;border-bottom:2px solid #4f6ef7;padding-bottom:6px;margin:20px 0 12px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#f4f6fb;font-weight:600;padding:7px 10px;text-align:left;border:1px solid #e5e9f2}
      td{padding:6px 10px;border:1px solid #e5e9f2}
      tr:nth-child(even) td{background:#fafbff}
      .total{font-weight:700;background:#f4f6fb!important}
      .pos{color:#1a7a3a;font-weight:600} .neg{color:#c0392b;font-weight:600}
      .sum-row{display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #e5e9f2}
      .sum-row.bold{font-weight:700;background:#f4f6fb}
      .bar-row{display:grid;grid-template-columns:180px 1fr 120px;align-items:center;gap:10px;margin-bottom:8px;font-size:12px}
      .bar-wrap{height:8px;background:#e5e9f2;border-radius:4px;overflow:hidden}
      .bar-fill{height:100%;background:#4f6ef7;border-radius:4px}
      .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e5e9f2;font-size:11px;color:#999;text-align:center}
      @media print{body{padding:12px 20px}}
    </style></head><body>
    <h1>📊 Otomasyon Projesi Yatırım Analizi</h1>
    <div class="sub">${UI.esc(state.proje.ad)} · Hazırlanış: ${now} · ${state.proje.sure_yil} Yıllık Projeksiyon · İskonto: %${state.proje.iskonto}</div>
    <div class="verdict">${isViable ? '✅ Yatırım Karlı — NPV Pozitif' : '❌ Yatırım Riskli — NPV Negatif'}</div>

    <div class="metrics">
      <div class="metric"><div class="val" style="color:#4f6ef7">${_fmt(totalCapexKdv)}</div><div class="lbl">Toplam Yatırım (CAPEX+KDV)</div></div>
      <div class="metric"><div class="val" style="color:${netYillik>=0?'#1a7a3a':'#c0392b'}">${_fmt(netYillik)}</div><div class="lbl">Yıllık Net Kazanım</div></div>
      <div class="metric"><div class="val" style="color:${payback<3?'#1a7a3a':payback<5?'#b06000':'#c0392b'}">${payback===Infinity?'—':payback.toFixed(1)+' Yıl'}</div><div class="lbl">Geri Ödeme Süresi</div></div>
      <div class="metric"><div class="val" style="color:${roiPct>100?'#1a7a3a':'#b06000'}">% ${roiPct.toFixed(0)}</div><div class="lbl">ROI (${state.proje.sure_yil} Yıl)</div></div>
      <div class="metric"><div class="val" style="color:${npv>=0?'#1a7a3a':'#c0392b'}">${npv>=0?'+':''}${_fmt(npv)}</div><div class="lbl">NPV</div></div>
      <div class="metric"><div class="val" style="color:${irr!==null&&irr>state.proje.iskonto?'#1a7a3a':'#c0392b'}">${irr!==null?'%'+irr.toFixed(1):'—'}</div><div class="lbl">IRR</div></div>
    </div>

    <h2>🏗️ CAPEX — Yatırım Kalemleri</h2>
    <table>
      <thead><tr><th>Kategori</th><th>Açıklama</th><th>Miktar</th><th>Birim</th><th>Birim Fiyat</th><th>Toplam</th></tr></thead>
      <tbody>
        ${state.capex.map(r => `<tr><td>${UI.esc(r.kategori)}</td><td>${UI.esc(r.aciklama)}</td><td>${r.miktar}</td><td>${UI.esc(r.birim)}</td><td>${_fmt(r.birim_fiyat)}</td><td>${_fmt(r.miktar*r.birim_fiyat)}</td></tr>`).join('')}
        <tr class="total"><td colspan="5">Ara Toplam (KDV Hariç)</td><td>${_fmt(totalCapex)}</td></tr>
        <tr class="total"><td colspan="5">KDV (%${state.proje.kdv})</td><td>${_fmt(totalCapex*state.proje.kdv/100)}</td></tr>
        <tr class="total"><td colspan="5">CAPEX Genel Toplam (KDV Dahil)</td><td class="pos">${_fmt(totalCapexKdv)}</td></tr>
      </tbody>
    </table>

    <h2>🔄 OPEX — Yıllık İşletme Giderleri</h2>
    <table>
      <thead><tr><th>Kategori</th><th>Açıklama</th><th>Yıllık Tutar</th></tr></thead>
      <tbody>
        ${state.opex.map(r => `<tr><td>${UI.esc(r.kategori)}</td><td>${UI.esc(r.aciklama)}</td><td>${_fmt(r.yillik_tutar)}</td></tr>`).join('')}
        <tr class="total"><td colspan="2">Toplam Yıllık OPEX</td><td class="neg">${_fmt(totalOpex)}</td></tr>
      </tbody>
    </table>

    <h2>💚 Tasarruf & Kazanımlar (Yıllık)</h2>
    <table>
      <thead><tr><th>Kategori</th><th>Açıklama</th><th>Yıllık Kazanım</th></tr></thead>
      <tbody>
        ${state.tasarruf.map(r => `<tr><td>${UI.esc(r.kategori)}</td><td>${UI.esc(r.aciklama)}</td><td>${_fmt(r.yillik_tutar)}</td></tr>`).join('')}
        <tr class="total"><td colspan="2">Toplam Yıllık Tasarruf</td><td class="pos">${_fmt(totalSav)}</td></tr>
      </tbody>
    </table>

    <h2>📈 Nakit Akış Projeksiyonu (${state.proje.sure_yil} Yıl)</h2>
    <table>
      <thead><tr><th>Yıl</th><th>Yıllık Nakit (₺)</th><th>Kümülatif (₺)</th><th>Durum</th></tr></thead>
      <tbody>
        ${cashFlow.map(cf => `<tr>
          <td>${cf.yil===0?'Y0 — Yatırım':`Y${cf.yil}`}</td>
          <td class="${cf.nakit>=0?'pos':'neg'}">${_fmt(cf.nakit)}</td>
          <td class="${cf.kümülatif>=0?'pos':'neg'}">${_fmt(cf.kümülatif)}</td>
          <td>${cf.kümülatif>=0?'✅ Pozitif':'❌ Negatif'}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <h2>🏗️ CAPEX Kategori Dağılımı</h2>
    ${Object.entries(capexByKat).sort((a,b)=>b[1]-a[1]).map(([kat,val]) => {
      const pct = totalCapex > 0 ? val/totalCapex*100 : 0;
      return `<div class="bar-row">
        <div>${kat}</div>
        <div class="bar-wrap"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
        <div>${_fmt(val)} (%${pct.toFixed(0)})</div>
      </div>`;
    }).join('')}

    <div class="footer">Bu rapor ProjeHaritası uygulaması tarafından oluşturulmuştur · ${now}</div>
    <script>window.onload=()=>window.print()<\/script>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  }

  return { load, printSunum };
})();

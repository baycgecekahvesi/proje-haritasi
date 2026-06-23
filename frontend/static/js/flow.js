// ===================== OTOMASYONOTOMASYONPROJESİ AKIŞ DİYAGRAMI =====================
const ProjectFlow = (() => {

  const STORAGE_KEY = "proje_akis_state_v1";

  const FAZLAR = [
    {
      id: "keşif",
      no: 1,
      baslik: "Keşif & Fizibilite",
      ikon: "🔍",
      renk: "#6366f1",
      aciklama: "Mevcut durumu anla, proje kapsamını belirle, teknik ve ekonomik fizibilite değerlendir.",
      adimlar: [
        "Müşteri/saha toplantısı yapıldı ve ihtiyaçlar dinlendi",
        "Mevcut tesis/makina yerinde incelendi (topo survey)",
        "Mevcut otomasyon/elektrik şemaları toplandı",
        "Üretim kapasitesi ve hedefleri kayıt altına alındı",
        "Sorun noktaları ve riskler listelendi",
        "Proje kapsamı (scope) taslak olarak belirlendi",
        "Ön bütçe tahmini yapıldı",
        "Fizibilite raporu hazırlandı ve onaylandı",
      ],
    },
    {
      id: "şartname",
      no: 2,
      baslik: "Teknik Şartname & Gereksinimler",
      ikon: "📋",
      renk: "#0ea5e9",
      aciklama: "Tüm fonksiyonel ve teknik gereksinimleri belge haline getir; onay al.",
      adimlar: [
        "Fonksiyonel Gereksinim Şartnamesi (FRS) hazırlandı",
        "Teknik Gereksinim Şartnamesi (TRS) hazırlandı",
        "I/O listesi (giriş/çıkış noktaları) oluşturuldu",
        "Haberleşme gereksinimleri belirlendi (PROFIBUS / PROFINET / Modbus / OPC-UA)",
        "Güvenlik gereksinimleri belirlendi (SIL seviyesi / ATEX bölge sınıfı)",
        "Ortam koşulları tanımlandı (sıcaklık, toz, titreşim, IP sınıfı)",
        "Standartlar ve yönetmelikler listelendi (IEC 61511, IEC 60364 vb.)",
        "Şartname müşteri tarafından onaylandı ve imzalandı",
      ],
    },
    {
      id: "tasarım",
      no: 3,
      baslik: "Mühendislik & Tasarım",
      ikon: "📐",
      renk: "#10b981",
      aciklama: "Tüm mühendislik tasarımlarını tamamla ve Tasarım İncelemesi (Design Review) yap.",
      adimlar: [
        "P&ID (Boru ve Enstrümantasyon Diyagramı) hazırlandı",
        "Elektrik şeması (wiring diagram) hazırlandı",
        "Pano (panel) yerleşim planı (layout) tasarlandı",
        "PLC/DCS donanım mimarisi belirlendi (CPU, I/O modülleri, rack)",
        "SCADA/HMI ekran tasarımı yapıldı",
        "Ağ (network) topolojisi ve iletişim mimarisi tasarlandı",
        "Kablo listesi ve kablo güzergâh planı hazırlandı",
        "Motor, kablo, sigorta boyutlandırma hesapları yapıldı (IEC)",
        "Topraklama (grounding) ve paratoner planı hazırlandı",
        "Tasarım İncelemesi (Design Review) müşteri ile yapıldı ve onaylandı",
      ],
    },
    {
      id: "tedarik",
      no: 4,
      baslik: "Tedarik & Satın Alma",
      ikon: "🛒",
      renk: "#f59e0b",
      aciklama: "Malzeme listesini hazırla, teklifler al, siparişleri ver ve teslimatları takip et.",
      adimlar: [
        "BOM (Malzeme Listesi) kesinleştirildi",
        "Kritik ekipmanlar için teknik şartname hazırlandı ve tedarikçilere gönderildi",
        "En az 2-3 tedarikçiden teklif alındı ve karşılaştırıldı",
        "PLC/DCS lisansları ve yazılım araçları temin edildi",
        "Ekipman siparişleri verildi",
        "Teslimat takip planı oluşturuldu",
        "Tüm ekipmanlar teslim alındı ve kontrol edildi",
        "Muayene sonuçları kayıt altına alındı",
      ],
    },
    {
      id: "imalat",
      no: 5,
      baslik: "İmalat & Geliştirme",
      ikon: "🏭",
      renk: "#8b5cf6",
      aciklama: "Pano imalatı, kablaj, PLC/SCADA programlama ve iç testleri tamamla.",
      adimlar: [
        "Elektrik panosu (MCC / kontrol panosu) imalatı tamamlandı",
        "Kablaj yapıldı ve işaretleme (tagging) tamamlandı",
        "Doğrulama testi: kablo süreklilik ve izolasyon testleri yapıldı",
        "PLC donanımı kuruldu ve yazılım yüklendi",
        "PLC programı (ladder/FBD/SCL) yazıldı ve yorumlandı",
        "SCADA / HMI uygulama geliştirmesi tamamlandı",
        "Alarm ve interlock mantığı tanımlandı ve test edildi",
        "İç fonksiyon testleri (bench test) gerçekleştirildi",
        "Yazılım sürüm kontrolü yapıldı ve yedek alındı",
      ],
    },
    {
      id: "fat",
      no: 6,
      baslik: "FAT — Fabrika Kabul Testi",
      ikon: "✅",
      renk: "#ef4444",
      aciklama: "Sistemin müşteri huzurunda fabrikada tam fonksiyonel test edilmesi; protokol imzalanır.",
      adimlar: [
        "FAT prosedürü (test senaryoları) hazırlandı ve müşteriye gönderildi",
        "FAT tarihi müşteri ile mutabık kalındı",
        "Test ortamı hazırlandı (simülasyon/stub sinyaller)",
        "Tüm I/O noktaları test edildi",
        "Fonksiyonel testler (otomatik/manuel mod, sekans) başarıyla tamamlandı",
        "Alarm ve interlock testleri başarıyla tamamlandı",
        "Güvenlik fonksiyonları (ESD, safety relay) test edildi",
        "Performans testleri (hız, hassasiyet, tepki süresi) doğrulandı",
        "FAT protokolü (punch list dahil) müşteri tarafından imzalandı",
        "Açık punch list maddeleri kapatıldı",
      ],
    },
    {
      id: "nakliye",
      no: 7,
      baslik: "Nakliye & Saha Hazırlığı",
      ikon: "🚛",
      renk: "#64748b",
      aciklama: "Ekipmanları güvenli taşı; saha altyapısını ve montaj hazırlığını tamamla.",
      adimlar: [
        "Nakliye planı hazırlandı (boyut, ağırlık, özel taşıma gereksinimleri)",
        "Ekipmanlar paketlendi, hasar koruması sağlandı",
        "Ekipmanlar tesise ulaştı ve hasar kontrolü yapıldı",
        "Saha altyapısı hazır: kablo kanalları, kablo geçişleri, güç bağlantıları",
        "Panel montaj konumları hazırlandı (beton kaide, ankraj)",
        "Topraklama (grounding) altyapısı hazırlandı",
        "İş güvenliği (ppe, LOTO) planı hazırlandı ve uygulandı",
      ],
    },
    {
      id: "montaj",
      no: 8,
      baslik: "Kurulum & Montaj",
      ikon: "🔧",
      renk: "#0891b2",
      aciklama: "Saha kablolarını çek, enstrümanları bağla, mekanik montajı tamamla.",
      adimlar: [
        "Panolar yerine monte edildi",
        "Güç kabloları çekildi (MCC → motorlar, pano → pano)",
        "Kontrol ve sinyal kabloları çekildi",
        "Saha enstrümanları (sensörler, transmitter) monte edildi ve bağlandı",
        "Motor ve aktüatör elektrik bağlantıları yapıldı",
        "Tüm kablo etiketleme ve işaretleme tamamlandı",
        "Saha kablo süreklilik testleri yapıldı",
        "Topraklama (grounding) ölçümleri yapıldı (< 1 Ω hedef)",
        "Görsel montaj kalite kontrolü yapıldı",
      ],
    },
    {
      id: "devreye",
      no: 9,
      baslik: "Devreye Alma (Commissioning)",
      ikon: "⚡",
      renk: "#d97706",
      aciklama: "Saha I/O testleri, loop testleri, program yükleme ve proses testleri.",
      adimlar: [
        "Enerji verme öncesi son kontroller yapıldı (pre-energization checklist)",
        "Güç kaynağı voltaj ve frekans kontrolü yapıldı",
        "Saha I/O testleri yapıldı (her sinyal PLC'de doğrulandı)",
        "Loop testleri yapıldı (her kontrol döngüsü uçtan uca test edildi)",
        "Motor dönüş yönleri kontrol edildi",
        "Güvenlik sistemleri (ESD, güvenlik rölesi) devreye alındı ve test edildi",
        "PLC programı son versiyonu yüklendi",
        "SCADA/HMI saha verilerini doğru gösteriyor (doğrulandı)",
        "Sistem soğuk çalışma (dry-run) testi yapıldı",
        "Sistem gerçek proses ile ısıl çalışma (hot-run) testi yapıldı",
        "PID ayarları yapıldı ve optimize edildi",
        "Performans kriterleri (kapasiteden en az %95) karşılandı",
      ],
    },
    {
      id: "sat",
      no: 10,
      baslik: "SAT — Saha Kabul Testi",
      ikon: "🏁",
      renk: "#16a34a",
      aciklama: "Sistemin müşteri huzurunda gerçek sahada kabul testinin yapılması; protokol imzalanır.",
      adimlar: [
        "SAT prosedürü hazırlandı ve müşteriye gönderildi",
        "SAT tarihi müşteri ile mutabık kalındı",
        "Tüm I/O noktaları sahada doğrulandı",
        "Fonksiyonel testler (tüm modlar, sekanslar) başarıyla tamamlandı",
        "Alarm ve interlock testleri başarıyla tamamlandı",
        "Güvenlik sistemleri sahada test edildi",
        "Performans ve kapasite hedefleri karşılandı",
        "Uzaktan erişim (remote access) test edildi",
        "SAT protokolü müşteri tarafından imzalandı",
        "Açık punch list maddeleri tarihli plan ile kapatıldı",
      ],
    },
    {
      id: "kapaniş",
      no: 11,
      baslik: "Eğitim, Dokümantasyon & Kapanış",
      ikon: "🎓",
      renk: "#9333ea",
      aciklama: "Operatör ve bakım ekibini eğit; as-built dokümanları teslim et; projeyi kapat.",
      adimlar: [
        "Operatör eğitimi verildi (HMI, normal/alarm/acil prosedürleri)",
        "Bakım ekibi eğitimi verildi (arıza tespiti, yedek parça, bakım planı)",
        "As-Built elektrik şemaları hazırlandı ve teslim edildi",
        "As-Built P&ID hazırlandı ve teslim edildi",
        "PLC/SCADA program yedekleri ve dokümantasyonu teslim edildi",
        "Kullanım ve bakım kılavuzu teslim edildi",
        "Yedek parça listesi ve önerilen stok teslim edildi",
        "Garanti belgesi ve şartları teslim edildi",
        "Proje kapanış toplantısı yapıldı",
        "Müşteri memnuniyeti formu dolduruldu",
        "Proje dosyası arşivlendi",
      ],
    },
  ];

  // localStorage'dan state oku
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  let state = loadState(); // { "faz_id_adim_index": true/false }

  function stateKey(fazId, idx) { return `${fazId}_${idx}`; }

  function isChecked(fazId, idx) { return !!state[stateKey(fazId, idx)]; }

  function toggle(fazId, idx) {
    const k = stateKey(fazId, idx);
    state[k] = !state[k];
    saveState(state);
    _updateFazUI(fazId);
    _updateOverall();
  }

  function resetFaz(fazId) {
    const faz = FAZLAR.find(f => f.id === fazId);
    if (!faz) return;
    faz.adimlar.forEach((_, i) => { delete state[stateKey(fazId, i)]; });
    saveState(state);
    _updateFazUI(fazId);
    _updateOverall();
  }

  function _fazToplam(faz) {
    return faz.adimlar.filter((_, i) => isChecked(faz.id, i)).length;
  }

  function _updateFazUI(fazId) {
    const faz = FAZLAR.find(f => f.id === fazId);
    if (!faz) return;
    const tam = _fazToplam(faz);
    const pct = Math.round((tam / faz.adimlar.length) * 100);

    // progress bar
    const bar = document.getElementById(`pf-bar-${fazId}`);
    if (bar) bar.style.width = pct + "%";
    const pctLbl = document.getElementById(`pf-pct-${fazId}`);
    if (pctLbl) pctLbl.textContent = pct + "%";

    // kart durumu
    const card = document.getElementById(`pf-card-${fazId}`);
    if (card) {
      card.classList.toggle("pf-done", pct === 100);
      card.classList.toggle("pf-active", pct > 0 && pct < 100);
    }

    // checkbox'lar
    faz.adimlar.forEach((_, i) => {
      const cb = document.getElementById(`pf-cb-${fazId}-${i}`);
      if (cb) cb.checked = isChecked(fazId, i);
      const lbl = document.getElementById(`pf-lbl-${fazId}-${i}`);
      if (lbl) lbl.style.textDecoration = isChecked(fazId, i) ? "line-through" : "none";
    });
  }

  function _updateOverall() {
    const toplam = FAZLAR.reduce((s, f) => s + f.adimlar.length, 0);
    const tam = FAZLAR.reduce((s, f) => s + _fazToplam(f), 0);
    const pct = Math.round((tam / toplam) * 100);
    const el = document.getElementById("pf-overall-bar");
    if (el) el.style.width = pct + "%";
    const lbl = document.getElementById("pf-overall-pct");
    if (lbl) lbl.textContent = pct + "%";
    const cntLbl = document.getElementById("pf-overall-cnt");
    if (cntLbl) cntLbl.textContent = `${tam} / ${toplam} adım tamamlandı`;
  }

  function load() {
    const panel = document.getElementById("panel-flow");
    if (!panel) return;
    state = loadState();
    _renderAll(panel);
  }

  function _renderAll(panel) {
    const toplam = FAZLAR.reduce((s, f) => s + f.adimlar.length, 0);
    const tam = FAZLAR.reduce((s, f) => s + _fazToplam(f), 0);
    const overallPct = Math.round((tam / toplam) * 100);

    panel.innerHTML = `
      <div class="pf-layout">

        <!-- BAŞLIK -->
        <div class="pf-header">
          <div>
            <h2 class="pf-title">⚙️ Otomasyon Projesi Akış Diyagramı</h2>
            <p class="pf-subtitle">Tesis veya makina otomasyonu projesinde atlanmaması gereken tüm adımlar — sırayla işaretleyerek ilerleyin.</p>
          </div>
          <div class="pf-overall-wrap">
            <div class="pf-overall-top">
              <span id="pf-overall-cnt">${tam} / ${toplam} adım tamamlandı</span>
              <span id="pf-overall-pct" class="pf-overall-pct">${overallPct}%</span>
            </div>
            <div class="pf-overall-track">
              <div id="pf-overall-bar" class="pf-overall-fill" style="width:${overallPct}%"></div>
            </div>
          </div>
        </div>

        <!-- FAZ HIZLI GEZİNME -->
        <div class="pf-nav">
          ${FAZLAR.map(f => {
            const t = _fazToplam(f);
            const p = Math.round((t / f.adimlar.length) * 100);
            const dot = p === 100 ? "pf-nav-done" : p > 0 ? "pf-nav-active" : "";
            return `<a href="#pf-card-${f.id}" class="pf-nav-item ${dot}" style="--fc:${f.renk}">
              <span class="pf-nav-no">${f.no}</span>
              <span class="pf-nav-lbl">${f.ikon} ${f.baslik}</span>
              <span class="pf-nav-pct">${p}%</span>
            </a>`;
          }).join("")}
        </div>

        <!-- FAZ KARTLARI -->
        <div class="pf-cards">
          ${FAZLAR.map((faz, fi) => {
            const t = _fazToplam(faz);
            const pct = Math.round((t / faz.adimlar.length) * 100);
            const doneClass = pct === 100 ? "pf-done" : pct > 0 ? "pf-active" : "";
            return `
              <div class="pf-faz-wrap">
                ${fi > 0 ? `<div class="pf-connector"><div class="pf-connector-line" style="border-color:${faz.renk}44"></div><div class="pf-connector-arrow" style="color:${faz.renk}">▼</div></div>` : ""}
                <div class="pf-card ${doneClass}" id="pf-card-${faz.id}" style="--faz-renk:${faz.renk}">
                  <div class="pf-card-head">
                    <div class="pf-card-left">
                      <div class="pf-no" style="background:${faz.renk}">${faz.no}</div>
                      <div>
                        <div class="pf-faz-baslik">${faz.ikon} ${faz.baslik}</div>
                        <div class="pf-faz-aciklama">${faz.aciklama}</div>
                      </div>
                    </div>
                    <div class="pf-card-right">
                      <div class="pf-pct-wrap">
                        <span id="pf-pct-${faz.id}" class="pf-pct-lbl" style="color:${faz.renk}">${pct}%</span>
                        <span class="pf-cnt-lbl">${t}/${faz.adimlar.length}</span>
                      </div>
                      <div class="pf-bar-track">
                        <div id="pf-bar-${faz.id}" class="pf-bar-fill" style="width:${pct}%;background:${faz.renk}"></div>
                      </div>
                      ${pct > 0 ? `<button class="pf-reset-btn" data-faz="${faz.id}" title="Bu fazı sıfırla">↺</button>` : ""}
                    </div>
                  </div>
                  <div class="pf-adimlar">
                    ${faz.adimlar.map((adim, i) => `
                      <label class="pf-adim" for="pf-cb-${faz.id}-${i}">
                        <input type="checkbox" id="pf-cb-${faz.id}-${i}"
                          class="pf-cb" data-faz="${faz.id}" data-idx="${i}"
                          ${isChecked(faz.id, i) ? "checked" : ""}
                          style="accent-color:${faz.renk}" />
                        <span class="pf-adim-no" style="color:${faz.renk}">${faz.no}.${i+1}</span>
                        <span id="pf-lbl-${faz.id}-${i}" class="pf-adim-metin"
                          style="${isChecked(faz.id, i) ? "text-decoration:line-through;color:var(--muted)" : ""}">${adim}</span>
                        ${isChecked(faz.id, i) ? `<span class="pf-tick" style="color:${faz.renk}">✓</span>` : ""}
                      </label>`).join("")}
                  </div>
                  ${pct === 100 ? `<div class="pf-done-badge" style="border-color:${faz.renk}44;color:${faz.renk}">✅ Faz Tamamlandı</div>` : ""}
                </div>
              </div>`;
          }).join("")}
        </div>

        <!-- ALT ÖZET -->
        <div class="pf-summary">
          <div class="pf-summary-row">
            ${FAZLAR.map(f => {
              const t = _fazToplam(f);
              const p = Math.round((t / f.adimlar.length) * 100);
              return `<div class="pf-sum-item" title="${f.baslik}: ${p}%">
                <div class="pf-sum-fill" style="height:${p}%;background:${f.renk}"></div>
                <span class="pf-sum-lbl">${f.no}</span>
              </div>`;
            }).join("")}
          </div>
          <div style="text-align:center;font-size:11px;color:var(--muted);margin-top:6px">Faz bazlı ilerleme — her sütun bir fazı temsil eder</div>
        </div>

      </div>`;

    // Event listener'lar
    panel.querySelectorAll(".pf-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        toggle(cb.dataset.faz, parseInt(cb.dataset.idx));
      });
    });

    panel.querySelectorAll(".pf-reset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm(`"${FAZLAR.find(f=>f.id===btn.dataset.faz)?.baslik}" fazını sıfırlamak istediğinizden emin misiniz?`)) {
          resetFaz(btn.dataset.faz);
          load();
        }
      });
    });
  }

  return { load };
})();

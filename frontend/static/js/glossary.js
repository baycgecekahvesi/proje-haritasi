// ===================== KISALTMALAR SÖZLÜĞÜ =====================
const Glossary = (() => {

  const TERMS = [
    // ── Saha Testleri & Proje Süreçleri ──────────────────────────
    { abbr: "FAT",     full: "Factory Acceptance Test",                   tr: "Fabrika Kabul Testi",         cat: "Test & Kabul",       desc: "Sistemin teslimattan önce tedarikçinin fabrikasında müşteri huzurunda test edilmesidir." },
    { abbr: "SAT",     full: "Site Acceptance Test",                      tr: "Saha Kabul Testi",            cat: "Test & Kabul",       desc: "Sistemin müşteri tesisine kurulduktan sonra gerçek ortamda yapılan kabul testidir." },
    { abbr: "HAT",     full: "Hardware Acceptance Test",                  tr: "Donanım Kabul Testi",         cat: "Test & Kabul",       desc: "Donanımın tasarım şartnamesini karşıladığını doğrulayan test aşamasıdır." },
    { abbr: "FAP",     full: "Factory Acceptance Protocol",               tr: "Fabrika Kabul Protokolü",     cat: "Test & Kabul",       desc: "FAT sürecinde kullanılan test adımlarını ve onay kriterlerini tanımlayan doküman." },
    { abbr: "ITP",     full: "Inspection and Test Plan",                  tr: "Muayene ve Test Planı",       cat: "Test & Kabul",       desc: "Projenin muayene, test ve kontrol adımlarını önceden planlayan belgedir." },
    { abbr: "MC",      full: "Mechanical Completion",                     tr: "Mekanik Tamamlama",           cat: "Test & Kabul",       desc: "Tüm mekanik ekipmanın kurulumunun tamamlandığını ifade eden aşamadır." },

    // ── Otomasyon & Kontrol Sistemleri ───────────────────────────
    { abbr: "PLC",     full: "Programmable Logic Controller",             tr: "Programlanabilir Mantık Denetleyici", cat: "Otomasyon",  desc: "Endüstriyel süreçleri kontrol etmek için kullanılan programlanabilir elektronik cihazdır." },
    { abbr: "SCADA",   full: "Supervisory Control and Data Acquisition",  tr: "Gözetimsel Kontrol ve Veri Toplama",  cat: "Otomasyon",  desc: "Uzaktaki endüstriyel süreçleri izlemek ve kontrol etmek için kullanılan yazılım/donanım sistemidir." },
    { abbr: "HMI",     full: "Human Machine Interface",                   tr: "İnsan Makine Arayüzü",        cat: "Otomasyon",          desc: "Operatörlerin makine ve süreçlerle etkileşime girdiği panel veya yazılım ekranıdır." },
    { abbr: "DCS",     full: "Distributed Control System",                tr: "Dağıtık Kontrol Sistemi",     cat: "Otomasyon",          desc: "Büyük endüstriyel tesislerde kontrol işlevlerini dağıtık olarak yürüten sistemdir." },
    { abbr: "RTU",     full: "Remote Terminal Unit",                      tr: "Uzak Terminal Birimi",        cat: "Otomasyon",          desc: "Uzak noktalardaki saha cihazlarından veri toplayan ve merkeze ileten elektronik cihazdır." },
    { abbr: "MES",     full: "Manufacturing Execution System",            tr: "Üretim Yürütme Sistemi",      cat: "Otomasyon",          desc: "Üretim süreçlerini gerçek zamanlı izleyip yöneten fabrika düzeyi yazılım sistemidir." },
    { abbr: "ERP",     full: "Enterprise Resource Planning",              tr: "Kurumsal Kaynak Planlaması",  cat: "Otomasyon",          desc: "Üretim, finans, insan kaynakları gibi kurumsal süreçleri bütünleşik yöneten yazılımdır." },
    { abbr: "PID",     full: "Proportional–Integral–Derivative",          tr: "Oransal–İntegral–Türevsel",   cat: "Otomasyon",          desc: "Endüstriyel süreçlerde set noktasına ulaşmak için kullanılan geri beslemeli kontrol algoritmasıdır." },
    { abbr: "I/O",     full: "Input / Output",                            tr: "Giriş / Çıkış",               cat: "Otomasyon",          desc: "PLC veya DCS üzerindeki dijital/analog sinyal giriş-çıkış noktalarıdır." },
    { abbr: "OPC",     full: "OLE for Process Control",                   tr: "Proses Kontrol için OLE",     cat: "Otomasyon",          desc: "Farklı üreticilerin otomasyon yazılımlarının veri alışverişi yapmasını sağlayan standart arayüzdür." },
    { abbr: "OPC-UA",  full: "OPC Unified Architecture",                  tr: "OPC Birleşik Mimari",         cat: "Otomasyon",          desc: "Platform bağımsız, güvenli ve ölçeklenebilir endüstriyel haberleşme standardıdır." },
    { abbr: "OEE",     full: "Overall Equipment Effectiveness",           tr: "Genel Ekipman Etkinliği",     cat: "Otomasyon",          desc: "Üretim ekipmanının kullanılabilirlik, performans ve kalite çarpımından elde edilen verimlilik göstergesidir." },

    // ── Saha Haberleşme Protokolleri ─────────────────────────────
    { abbr: "PROFIBUS",full: "Process Field Bus",                         tr: "Proses Alan Veriyolu",        cat: "Haberleşme",         desc: "Endüstriyel otomasyon cihazları arasındaki seri haberleşme protokolüdür (IEC 61158)." },
    { abbr: "PROFINET", full: "Process Field Network",                    tr: "Proses Alan Ağı",             cat: "Haberleşme",         desc: "Ethernet tabanlı gerçek zamanlı endüstriyel ağ protokolüdür." },
    { abbr: "HART",    full: "Highway Addressable Remote Transducer",     tr: "Uzak Transdüser Haberleşme",  cat: "Haberleşme",         desc: "4–20 mA sinyal hattı üzerinden dijital haberleşme sağlayan protokoldür." },
    { abbr: "Modbus",  full: "Modbus (serial protocol)",                  tr: "Modbus Protokolü",            cat: "Haberleşme",         desc: "PLC ve enstrümanlar arasında yaygın kullanılan seri haberleşme protokolüdür." },
    { abbr: "DNP3",    full: "Distributed Network Protocol 3",            tr: "Dağıtık Ağ Protokolü 3",     cat: "Haberleşme",         desc: "SCADA sistemlerinde uzak saha cihazlarıyla haberleşmek için kullanılan protokoldür." },
    { abbr: "IEC 61850",full:"IEC 61850",                                 tr: "Güç Sistemi Haberleşme Std.", cat: "Haberleşme",         desc: "Enerji dağıtım sistemlerinde kullanılan uluslararası haberleşme standardıdır." },

    // ── Enstrümantasyon & Elektrik ────────────────────────────────
    { abbr: "P&ID",    full: "Piping and Instrumentation Diagram",        tr: "Boru ve Enstrümantasyon Diyagramı", cat: "Enstrümantasyon", desc: "Bir prosesin boru hatlarını, enstrümanlarını ve kontrol sistemlerini gösteren teknik diyagramdır." },
    { abbr: "PT",      full: "Pressure Transmitter",                      tr: "Basınç Transmitteri",         cat: "Enstrümantasyon",    desc: "Basıncı ölçerek standart sinyal (4–20 mA / HART) olarak ileten cihazdır." },
    { abbr: "TT",      full: "Temperature Transmitter",                   tr: "Sıcaklık Transmitteri",       cat: "Enstrümantasyon",    desc: "Sıcaklığı ölçerek standart elektrik sinyaline çeviren cihazdır." },
    { abbr: "FT",      full: "Flow Transmitter",                          tr: "Akış Transmitteri",           cat: "Enstrümantasyon",    desc: "Akış debisini ölçerek 4–20 mA veya dijital sinyal olarak ileten cihazdır." },
    { abbr: "LT",      full: "Level Transmitter",                         tr: "Seviye Transmitteri",         cat: "Enstrümantasyon",    desc: "Tank veya kaptaki sıvı seviyesini ölçen enstrümandır." },
    { abbr: "VFD",     full: "Variable Frequency Drive",                  tr: "Frekans Sürücüsü",            cat: "Elektrik",           desc: "AC motorun hızını frekansı değiştirerek kontrol eden güç elektroniği cihazıdır." },
    { abbr: "MCC",     full: "Motor Control Center",                      tr: "Motor Kontrol Merkezi",       cat: "Elektrik",           desc: "Motorların devreye alma, koruma ve kontrol bileşenlerini bir araya getiren elektrik panosudur." },
    { abbr: "MMS",     full: "Motor Management Switch / Motor Circuit Breaker", tr: "Motor Koruma Şalteri",  cat: "Elektrik",           desc: "Motorları aşırı yük ve kısa devreye karşı koruyan özel kesicilerdir." },
    { abbr: "MCB",     full: "Miniature Circuit Breaker",                 tr: "Minyatür Devre Kesici",       cat: "Elektrik",           desc: "Küçük güçlü devreleri aşırı akım ve kısa devreden koruyan sigorta tipi kesicidir." },
    { abbr: "MCCB",    full: "Molded Case Circuit Breaker",               tr: "Kalıplı Gövdeli Devre Kesici",cat: "Elektrik",           desc: "Daha yüksek akım kapasitesine sahip endüstriyel devre kesicilerdir." },
    { abbr: "RCD",     full: "Residual Current Device",                   tr: "Kaçak Akım Rölesi",           cat: "Elektrik",           desc: "Kaçak akımları tespit ederek elektrik çarpmasını önleyen koruma cihazıdır." },
    { abbr: "UPS",     full: "Uninterruptible Power Supply",              tr: "Kesintisiz Güç Kaynağı",      cat: "Elektrik",           desc: "Şebeke kesintisinde kritik sistemlere enerji sağlayan akü destekli güç kaynağıdır." },
    { abbr: "IP",      full: "Ingress Protection",                        tr: "Koruma Sınıfı (Toz/Su)",      cat: "Elektrik",           desc: "IEC 60529 standardında cihazların toz ve suya karşı koruma derecesini tanımlar (ör. IP65, IP67)." },
    { abbr: "ATEX",    full: "ATmosphères EXplosibles",                   tr: "Patlayıcı Ortam Standardı",   cat: "Elektrik",           desc: "AB direktifi; patlama riskli ortamlarda kullanılacak ekipmanların sertifikasyon standardıdır." },
    { abbr: "EMC",     full: "Electromagnetic Compatibility",             tr: "Elektromanyetik Uyumluluk",   cat: "Elektrik",           desc: "Cihazların elektromanyetik girişim yaratmadan ve buna dayanıklı çalışabilme özelliğidir." },
    { abbr: "kVA",     full: "Kilovolt-Ampere",                           tr: "Kilovolt-Amper",              cat: "Elektrik",           desc: "Görünen gücün birimi; aktif (kW) ve reaktif (kVAR) güçlerin vektörel toplamıdır." },
    { abbr: "kVAR",    full: "Kilovolt-Ampere Reactive",                  tr: "Reaktif Güç Birimi",          cat: "Elektrik",           desc: "Manyetik alan oluşturmak için gereken reaktif gücün birimidir; güç faktörünü etkiler." },

    // ── Güvenlik Sistemleri ───────────────────────────────────────
    { abbr: "SIS",     full: "Safety Instrumented System",                tr: "Güvenlik Enstrümanlı Sistemi", cat: "Güvenlik",          desc: "Tehlikeli bir durumu önlemek veya azaltmak için devreye giren fonksiyonel güvenlik sistemidir." },
    { abbr: "SIL",     full: "Safety Integrity Level",                    tr: "Güvenlik Bütünlük Seviyesi",  cat: "Güvenlik",          desc: "IEC 61511 standardında güvenlik fonksiyonlarının güvenilirlik derecesini tanımlayan 1–4 skalasıdır." },
    { abbr: "ESD",     full: "Emergency Shutdown",                        tr: "Acil Kapatma Sistemi",        cat: "Güvenlik",           desc: "Tehlikeli bir durumda tesisi güvenli bir duruma getirmek için devreye giren sistemdir." },
    { abbr: "LOTO",    full: "Lockout / Tagout",                          tr: "Kilitleme / Etiketleme",      cat: "Güvenlik",           desc: "Enerji kaynaklarını kilitleyen ve etiketleyen, bakım esnasında kazaları önleyen prosedürdür." },
    { abbr: "HAZOP",   full: "Hazard and Operability Study",              tr: "Tehlike ve İşletilebilirlik Analizi", cat: "Güvenlik",   desc: "Proses sistemlerindeki tehlikeleri ve işletim sorunlarını sistematik olarak inceleyen risk analiz yöntemidir." },

    // ── Bakım & Güvenilirlik ──────────────────────────────────────
    { abbr: "MTBF",    full: "Mean Time Between Failures",                tr: "Ortalama Arızasız Çalışma Süresi", cat: "Bakım",         desc: "Bir sistemin iki ardışık arıza arasında ortalama çalıştığı süreyi ifade eder." },
    { abbr: "MTTR",    full: "Mean Time To Repair",                       tr: "Ortalama Onarım Süresi",      cat: "Bakım",              desc: "Arıza oluştuktan sonra sistemi çalışır hale getirmek için harcanan ortalama süredir." },
    { abbr: "FMEA",    full: "Failure Mode and Effects Analysis",         tr: "Hata Modu ve Etkileri Analizi", cat: "Bakım",            desc: "Bir sistemdeki olası arızaları ve bunların etkilerini önceden belirleyip değerlendiren analiz yöntemidir." },
    { abbr: "PM",      full: "Preventive Maintenance",                    tr: "Önleyici Bakım",              cat: "Bakım",              desc: "Arıza oluşmadan önce planlı aralıklarla yapılan bakım faaliyetidir." },
    { abbr: "CBM",     full: "Condition Based Maintenance",               tr: "Duruma Dayalı Bakım",         cat: "Bakım",              desc: "Ekipman durumunu sürekli izleyerek ihtiyaç anında yapılan bakım stratejisidir." },
    { abbr: "KPI",     full: "Key Performance Indicator",                 tr: "Temel Performans Göstergesi", cat: "Bakım",              desc: "Bir sürecin veya organizasyonun hedeflere ulaşma performansını ölçen sayısal göstergedir." },

    // ── Finans & Proje Yönetimi ───────────────────────────────────
    { abbr: "CAPEX",   full: "Capital Expenditure",                       tr: "Sermaye Harcaması",           cat: "Finans",             desc: "Ekipman, yazılım ve kurulum gibi uzun vadeli varlıklar için yapılan tek seferlik yatırım harcamalarıdır." },
    { abbr: "OPEX",    full: "Operational Expenditure",                   tr: "İşletme Giderleri",           cat: "Finans",             desc: "Bakım, enerji ve işçilik gibi süregelen yıllık işletme maliyetlerinin toplamıdır." },
    { abbr: "ROI",     full: "Return on Investment",                      tr: "Yatırım Getirisi",            cat: "Finans",             desc: "Bir yatırımın net kazancının yatırım maliyetine oranla yüzde olarak ifadesidir." },
    { abbr: "NPV",     full: "Net Present Value",                         tr: "Net Bugünkü Değer",           cat: "Finans",             desc: "Gelecekteki nakit akışlarının bugünkü değere indirgenmesiyle hesaplanan yatırım karlılık göstergesidir." },
    { abbr: "IRR",     full: "Internal Rate of Return",                   tr: "İç Verim Oranı",             cat: "Finans",             desc: "NPV'yi sıfıra eşitleyen iskonto oranıdır; WACC ile karşılaştırılarak yatırım kararı verilir." },
    { abbr: "WACC",    full: "Weighted Average Cost of Capital",          tr: "Ağırlıklı Ortalama Sermaye Maliyeti", cat: "Finans",     desc: "Şirketin özkaynak ve borç maliyetlerinin ağırlıklı ortalamasıdır; iskonto oranı olarak kullanılır." },
    { abbr: "BOM",     full: "Bill of Materials",                         tr: "Malzeme Listesi",             cat: "Finans",             desc: "Bir ürün veya sistemi oluşturan tüm bileşenlerin miktar ve açıklamalarını içeren listedir." },
    { abbr: "RFQ",     full: "Request for Quotation",                     tr: "Fiyat Teklifi Talebi",        cat: "Finans",             desc: "Tedarikçilerden belirli mal veya hizmet için fiyat teklifi istemek amacıyla yapılan resmi taleptir." },
    { abbr: "WBS",     full: "Work Breakdown Structure",                  tr: "İş Kırılım Yapısı",           cat: "Finans",             desc: "Proje kapsamını yönetilebilir iş paketlerine bölen hiyerarşik yapıdır." },
  ];

  const CATS = [...new Set(TERMS.map(t => t.cat))].sort();
  const CAT_COLORS = {
    "Test & Kabul":    "#4f6ef7",
    "Otomasyon":       "#8e44ad",
    "Haberleşme":      "#2980b9",
    "Enstrümantasyon": "#16a085",
    "Elektrik":        "#d35400",
    "Güvenlik":        "#c0392b",
    "Bakım":           "#27ae60",
    "Finans":          "#f39c12",
  };

  let filterText = "";
  let filterCat  = "";

  function load() {
    _render();
  }

  function _render() {
    const panel = document.getElementById("panel-glossary");
    if (!panel) return;

    panel.innerHTML = `
      <div class="gl-layout">
        <div class="gl-toolbar">
          <div class="gl-search-wrap">
            <input id="gl-search" class="gl-search" type="search" placeholder="🔍  Kısaltma veya kelime ara…" value="${UI.esc(filterText)}"/>
          </div>
          <div class="gl-cats">
            <button class="gl-cat-btn ${filterCat===''?'active':''}" data-cat="">Tümü</button>
            ${CATS.map(c => `<button class="gl-cat-btn ${filterCat===c?'active':''}" data-cat="${UI.esc(c)}" style="${filterCat===c?`background:${CAT_COLORS[c]};border-color:${CAT_COLORS[c]};color:#fff`:''}">${c}</button>`).join("")}
          </div>
        </div>
        <div id="gl-list" class="gl-list"></div>
      </div>`;

    document.getElementById("gl-search").addEventListener("input", e => {
      filterText = e.target.value;
      _renderList();
    });
    document.querySelectorAll(".gl-cat-btn").forEach(btn => {
      btn.onclick = () => { filterCat = btn.dataset.cat; _render(); };
    });

    _renderList();
  }

  function _renderList() {
    const q = filterText.toLowerCase();
    const filtered = TERMS.filter(t => {
      const matchCat  = !filterCat || t.cat === filterCat;
      const matchText = !q ||
        t.abbr.toLowerCase().includes(q) ||
        t.full.toLowerCase().includes(q) ||
        t.tr.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q);
      return matchCat && matchText;
    });

    const box = document.getElementById("gl-list");
    if (!box) return;

    if (!filtered.length) {
      box.innerHTML = `<div class="gl-empty"><p>Sonuç bulunamadı.</p></div>`;
      return;
    }

    // Kategoriye göre grupla
    const grouped = {};
    filtered.forEach(t => {
      if (!grouped[t.cat]) grouped[t.cat] = [];
      grouped[t.cat].push(t);
    });

    box.innerHTML = Object.entries(grouped).map(([cat, terms]) => `
      <div class="gl-group">
        <div class="gl-group-title" style="border-left-color:${CAT_COLORS[cat]||'var(--primary)'}">
          <span style="color:${CAT_COLORS[cat]||'var(--primary)'}">${cat}</span>
          <span class="gl-count">${terms.length} terim</span>
        </div>
        <div class="gl-cards">
          ${terms.map(t => `
            <div class="gl-card">
              <div class="gl-card-head">
                <span class="gl-abbr">${UI.esc(t.abbr)}</span>
                <span class="gl-cat-pill" style="background:${CAT_COLORS[t.cat]||'var(--primary)'}20;color:${CAT_COLORS[t.cat]||'var(--primary)'}">${UI.esc(t.cat)}</span>
              </div>
              <div class="gl-full">${UI.esc(t.full)}</div>
              <div class="gl-tr">🇹🇷 ${UI.esc(t.tr)}</div>
              <div class="gl-desc">${UI.esc(t.desc)}</div>
            </div>`).join("")}
        </div>
      </div>`).join("");
  }

  return { load };
})();

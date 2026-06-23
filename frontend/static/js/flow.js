// ===================== OTOMASYON PROJESİ AKIŞ DİYAGRAMI =====================
const ProjectFlow = (() => {

  const STORAGE_KEY      = "proje_akis_state_v1";
  const EP_STORAGE_KEY   = "eplan_kontrol_state_v1";

  // ─── ANA PROJE FAZLARI ───────────────────────────────────────────────────
  const FAZLAR = [
    {
      id: "keşif", no: 1, baslik: "Keşif & Fizibilite", ikon: "🔍", renk: "#6366f1",
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
      id: "şartname", no: 2, baslik: "Teknik Şartname & Gereksinimler", ikon: "📋", renk: "#0ea5e9",
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
      id: "tasarım", no: 3, baslik: "Mühendislik & Tasarım", ikon: "📐", renk: "#10b981",
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
      id: "tedarik", no: 4, baslik: "Tedarik & Satın Alma", ikon: "🛒", renk: "#f59e0b",
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
      id: "imalat", no: 5, baslik: "İmalat & Geliştirme", ikon: "🏭", renk: "#8b5cf6",
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
      id: "fat", no: 6, baslik: "FAT — Fabrika Kabul Testi", ikon: "✅", renk: "#ef4444",
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
      id: "nakliye", no: 7, baslik: "Nakliye & Saha Hazırlığı", ikon: "🚛", renk: "#64748b",
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
      id: "montaj", no: 8, baslik: "Kurulum & Montaj", ikon: "🔧", renk: "#0891b2",
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
      id: "devreye", no: 9, baslik: "Devreye Alma (Commissioning)", ikon: "⚡", renk: "#d97706",
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
      id: "sat", no: 10, baslik: "SAT — Saha Kabul Testi", ikon: "🏁", renk: "#16a34a",
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
      id: "kapaniş", no: 11, baslik: "Eğitim, Dokümantasyon & Kapanış", ikon: "🎓", renk: "#9333ea",
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

  // ─── E-PLAN KONTROL NOKTALARI ────────────────────────────────────────────
  const EP_KONTROL = [
    {
      id: "ep_proje", faz_ref: "Keşif & Tasarım Öncesi", ikon: "🗂️", renk: "#6366f1",
      baslik: "E-Plan Proje Kurulumu",
      aciklama: "Çizim yapmadan önce E-Plan proje dosyasını doğru yapılandır.",
      adimlar: [
        "E-Plan proje dosyası oluşturuldu (.zw9 / .zw3)",
        "Kurumsal şablon (template) uygulandı",
        "Sayfa boyutu ve ölçeği ayarlandı (A3/A1, 1:1)",
        "Başlık bloğu (title block) — proje adı, müşteri, tarih, revizyon sütunları dolduruldu",
        "Çizgi kalınlıkları ve renk kodları IEC/DIN standartlarına göre ayarlandı",
        "Sayfa indeksi (table of contents) yapısı oluşturuldu",
        "Revizyon yönetim sütunları tanımlandı (Rev., tarih, hazırlayan, onaylayan)",
      ],
    },
    {
      id: "ep_pid", faz_ref: "Faz 3 — Tasarım", ikon: "🔀", renk: "#0ea5e9",
      baslik: "P&ID ve Süreç Şemaları",
      aciklama: "Proses akış ve enstrümantasyon diyagramlarını E-Plan'a aktar.",
      adimlar: [
        "P&ID sayfaları E-Plan'a oluşturuldu",
        "Enstrüman tag listesi (field tag) E-Plan'a girildi",
        "Sensör, transmitter, vana, pompa sembolleri doğru kullanıldı (ISA/IEC)",
        "Süreç açıklamaları (notes) ve referanslar eklendi",
        "P&ID müşteri tarafından gözden geçirildi ve onaylandı",
      ],
    },
    {
      id: "ep_guc", faz_ref: "Faz 3 — Tasarım", ikon: "⚡", renk: "#f59e0b",
      baslik: "Güç Şeması (Power Diagram)",
      aciklama: "Ana güç beslemesinden motor devrelerine kadar tüm güç şemalarını tamamla.",
      adimlar: [
        "Ana güç besleme şeması çizildi (trafo, ana kesici, bara)",
        "MCC / motor kontrol merkezi devresi tamamlandı",
        "Her motor için: sigorta → kontaktör → termik röle → motor çizildi",
        "Güç kablosu kesiti ve uzunluğu her devrede belirtildi",
        "Faz renk kodları IEC 60446 uyumlu (L1-L2-L3 / kahve-siyah-gri)",
        "Topraklama (PE) bağlantıları her devre için çizildi",
        "IEC 60364 uygunluğu tasarım aşamasında kontrol edildi",
      ],
    },
    {
      id: "ep_kontrol", faz_ref: "Faz 3 — Tasarım", ikon: "🎛️", renk: "#10b981",
      baslik: "Kontrol & Güvenlik Şemaları",
      aciklama: "PLC I/O, kontrol devresi ve güvenlik devresi şemalarını çiz.",
      adimlar: [
        "PLC I/O şeması çizildi (her giriş/çıkış noktası ayrı satırda)",
        "Dijital giriş (DI) devreleri: buton, limit switch, sensör bağlantıları",
        "Dijital çıkış (DO) devreleri: röle, solenoid, pilot lamba bağlantıları",
        "Analog I/O devreleri: 4-20mA, PT100, termokupl, encoder bağlantıları",
        "Acil durdurma (E-stop) ve güvenlik devresi şeması çizildi",
        "Safety relay / güvenlik PLC bağlantıları tamamlandı",
        "Kontrol devresi besleme (24VDC, 230VAC) şeması çizildi",
        "Haberleşme şeması çizildi (PROFIBUS, PROFINET, Ethernet, RS-485 vb.)",
      ],
    },
    {
      id: "ep_panel", faz_ref: "Faz 3 — Tasarım", ikon: "🗃️", renk: "#8b5cf6",
      baslik: "Panel Layout (2D/3D Yerleşim)",
      aciklama: "Elektrik panosunun iç ve dış yerleşim planını E-Plan Pro Panel ile hazırla.",
      adimlar: [
        "Panel gövde boyutu belirlendi (E-Plan'a eklendi)",
        "İç yerleşim planı çizildi: DIN ray, ekipman yerleri, kablo kanalları",
        "Ön kapak layout'u çizildi: buton, sinyal lambası, kilit, gösterge",
        "DIN ray uzunluk hesabı yapıldı (toplam mm < ray kapasitesi)",
        "Kablo kanalı (wireduct) boyutlandırması yapıldı",
        "Isı dissipasyon hesabı yapıldı — gerekiyorsa fan/klima eklendi",
        "Yüksek gerilim ve alçak gerilim bölgeleri fiziksel olarak ayrıldı",
        "Panel layout müşteri ile paylaşıldı ve onaylandı",
      ],
    },
    {
      id: "ep_kablo", faz_ref: "Faz 3-5 — Tasarım & İmalat", ikon: "🔌", renk: "#0891b2",
      baslik: "Kablo Listesi & Etiketleme",
      aciklama: "Tüm kabloları E-Plan'da tanımla; çekme ve etiket listelerini export et.",
      adimlar: [
        "Tüm kablolar E-Plan'da tanımlandı (kaynak terminal → hedef terminal)",
        "Her kablo için: kesit, renk, uzunluk, kablo tipi girildi",
        "Çok damarlı kabloların çekirdek ataması yapıldı (damar rengi → sinyal adı)",
        "Kablo çekme listesi (cable pull list) export edildi",
        "Kablo etiket listesi export edildi (termal transfer yazıcı formatında)",
        "Terminal blok bağlantı listesi export edildi",
        "Kablo güzergâh planı ile karşılaştırılıp uyuşma kontrol edildi",
      ],
    },
    {
      id: "ep_bom", faz_ref: "Faz 4 — Tedarik", ikon: "📦", renk: "#d97706",
      baslik: "BOM (Malzeme Listesi) Export",
      aciklama: "E-Plan parts veritabanından BOM üret ve tedarik sürecine besle.",
      adimlar: [
        "E-Plan parts veritabanı güncel ve doğru (üretici parça numaraları girildi)",
        "Tüm ekipman sembolleri doğru parts ile ilişkilendirildi",
        "BOM E-Plan'dan export edildi (Excel/CSV formatında)",
        "BOM gözden geçirildi: eksik ya da fazla malzeme yok",
        "Yedek parça listesi BOM'dan ayrıca çıkarıldı",
        "Tedarikçi tekliflerine karşı BOM karşılaştırması yapıldı",
      ],
    },
    {
      id: "ep_fat_kontrol", faz_ref: "Faz 6 — FAT Öncesi", ikon: "🔍", renk: "#ef4444",
      baslik: "FAT Öncesi Şema Kalite Kontrolü",
      aciklama: "FAT'a girmeden önce şemaların eksiksiz ve hatasız olduğunu doğrula.",
      adimlar: [
        "Tüm şema sayfaları eksiksiz ve numara sırası doğru",
        "Çapraz referanslar (cross-references) doğru çalışıyor — kontrol edildi",
        "Sembol-terminal eşleşmesi (DRC — Design Rule Check) çalıştırıldı ve hatalar temizlendi",
        "Revizyon bloğu güncellendi (Rev. no, tarih, hazırlayan, onaylayan)",
        "FAT'a özel şema paketi PDF olarak export edildi",
        "Şema paketi müşteriye gönderildi ve onay alındı",
        "Kablo listesi ve panel layout FAT öncesi son haliyle güncellendi",
      ],
    },
    {
      id: "ep_asbuilt", faz_ref: "Faz 11 — Kapanış", ikon: "📐", renk: "#9333ea",
      baslik: "As-Built Şemalar & Teslim",
      aciklama: "Sahada yapılan tüm değişiklikleri şemalara işle; müşteriye eksiksiz teslim et.",
      adimlar: [
        "Saha değişiklikleri (field changes) şemalara birebir işlendi",
        "As-Built revizyonu eklendi (tarih, değişiklik özeti, mühendis imzası)",
        "As-Built PDF paketi hazırlandı (tüm sayfalar, tüm ekler)",
        "Kablo listesi as-built duruma güncellendi",
        "Panel layout as-built duruma güncellendi",
        "Orijinal E-Plan proje dosyası müşteriye teslim edildi (.zw9 / .zw3)",
        "Proje yedeği şirket arşivine alındı (bulut + lokal)",
        "As-built paketi müşteri tarafından teslim alındı ve imzalandı",
      ],
    },
  ];

  // ─── STATE YÖNETİMİ ───────────────────────────────────────────────────────
  function loadState(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  }
  function saveState(key, s) {
    try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
  }

  let state   = loadState(STORAGE_KEY);
  let epState = loadState(EP_STORAGE_KEY);

  function isChecked(st, fazId, idx) { return !!st[`${fazId}_${idx}`]; }

  function toggle(st, key, fazId, idx, cb) {
    const k = `${fazId}_${idx}`;
    st[k] = !st[k];
    saveState(key, st);
    cb();
  }

  function _fazToplam(st, liste, faz) {
    return faz.adimlar.filter((_, i) => isChecked(st, faz.id, i)).length;
  }

  // ─── PROJE AKIŞI RENDER ───────────────────────────────────────────────────
  function _renderAkis(wrap) {
    const toplam = FAZLAR.reduce((s, f) => s + f.adimlar.length, 0);
    const tam    = FAZLAR.reduce((s, f) => s + _fazToplam(state, FAZLAR, f), 0);
    const pct    = Math.round((tam / toplam) * 100);

    wrap.innerHTML = `
      <div class="pf-overall-wrap" style="margin-bottom:4px">
        <div class="pf-overall-top">
          <span id="pf-overall-cnt">${tam} / ${toplam} adım tamamlandı</span>
          <span id="pf-overall-pct" class="pf-overall-pct">${pct}%</span>
        </div>
        <div class="pf-overall-track"><div id="pf-overall-bar" class="pf-overall-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="pf-nav">
        ${FAZLAR.map(f => {
          const t = _fazToplam(state, FAZLAR, f);
          const p = Math.round((t / f.adimlar.length) * 100);
          const cls = p === 100 ? "pf-nav-done" : p > 0 ? "pf-nav-active" : "";
          return `<a href="#pf-card-${f.id}" class="pf-nav-item ${cls}" style="--fc:${f.renk}">
            <span class="pf-nav-no">${f.no}</span>
            <span class="pf-nav-lbl">${f.ikon} ${f.baslik}</span>
            <span class="pf-nav-pct">${p}%</span>
          </a>`;
        }).join("")}
      </div>

      <div class="pf-cards">
        ${FAZLAR.map((faz, fi) => {
          const t   = _fazToplam(state, FAZLAR, faz);
          const pct = Math.round((t / faz.adimlar.length) * 100);
          const dc  = pct === 100 ? "pf-done" : pct > 0 ? "pf-active" : "";
          return `
            <div class="pf-faz-wrap">
              ${fi > 0 ? `<div class="pf-connector"><div class="pf-connector-line" style="border-color:${faz.renk}44"></div><div class="pf-connector-arrow" style="color:${faz.renk}">▼</div></div>` : ""}
              <div class="pf-card ${dc}" id="pf-card-${faz.id}" style="--faz-renk:${faz.renk}">
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
                    <div class="pf-bar-track"><div id="pf-bar-${faz.id}" class="pf-bar-fill" style="width:${pct}%;background:${faz.renk}"></div></div>
                    ${pct > 0 ? `<button class="pf-reset-btn" data-faz="${faz.id}" title="Sıfırla">↺</button>` : ""}
                  </div>
                </div>
                <div class="pf-adimlar">
                  ${faz.adimlar.map((adim, i) => {
                    const chk = isChecked(state, faz.id, i);
                    return `<label class="pf-adim" for="pf-cb-${faz.id}-${i}">
                      <input type="checkbox" id="pf-cb-${faz.id}-${i}" class="pf-cb" data-faz="${faz.id}" data-idx="${i}" ${chk ? "checked" : ""} style="accent-color:${faz.renk}" />
                      <span class="pf-adim-no" style="color:${faz.renk}">${faz.no}.${i+1}</span>
                      <span id="pf-lbl-${faz.id}-${i}" class="pf-adim-metin" style="${chk ? "text-decoration:line-through;color:var(--muted)" : ""}">${adim}</span>
                      ${chk ? `<span class="pf-tick" style="color:${faz.renk}">✓</span>` : ""}
                    </label>`;
                  }).join("")}
                </div>
                ${pct === 100 ? `<div class="pf-done-badge" style="border-color:${faz.renk}44;color:${faz.renk}">✅ Faz Tamamlandı</div>` : ""}
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="pf-summary">
        <div class="pf-summary-row">
          ${FAZLAR.map(f => {
            const t = _fazToplam(state, FAZLAR, f);
            const p = Math.round((t / f.adimlar.length) * 100);
            return `<div class="pf-sum-item" title="${f.baslik}: ${p}%">
              <div class="pf-sum-fill" style="height:${p}%;background:${f.renk}"></div>
              <span class="pf-sum-lbl">${f.no}</span>
            </div>`;
          }).join("")}
        </div>
        <div style="text-align:center;font-size:11px;color:var(--muted);margin-top:6px">Faz bazlı ilerleme — her sütun bir fazı temsil eder</div>
      </div>`;

    wrap.querySelectorAll(".pf-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        toggle(state, STORAGE_KEY, cb.dataset.faz, +cb.dataset.idx, () => _refreshAkis(wrap));
      });
    });
    wrap.querySelectorAll(".pf-reset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const f = FAZLAR.find(f => f.id === btn.dataset.faz);
        if (!f || !confirm(`"${f.baslik}" fazını sıfırlamak istediğinizden emin misiniz?`)) return;
        f.adimlar.forEach((_, i) => { delete state[`${f.id}_${i}`]; });
        saveState(STORAGE_KEY, state);
        _renderAkis(wrap);
      });
    });
  }

  function _refreshAkis(wrap) {
    const toplam = FAZLAR.reduce((s, f) => s + f.adimlar.length, 0);
    const tam    = FAZLAR.reduce((s, f) => s + _fazToplam(state, FAZLAR, f), 0);
    const pct    = Math.round((tam / toplam) * 100);
    const cnt = wrap.querySelector("#pf-overall-cnt"); if (cnt) cnt.textContent = `${tam} / ${toplam} adım tamamlandı`;
    const opct = wrap.querySelector("#pf-overall-pct"); if (opct) opct.textContent = pct + "%";
    const obar = wrap.querySelector("#pf-overall-bar"); if (obar) obar.style.width = pct + "%";
    FAZLAR.forEach(faz => {
      const t  = _fazToplam(state, FAZLAR, faz);
      const p  = Math.round((t / faz.adimlar.length) * 100);
      const bar = wrap.querySelector(`#pf-bar-${faz.id}`); if (bar) bar.style.width = p + "%";
      const pl  = wrap.querySelector(`#pf-pct-${faz.id}`); if (pl) pl.textContent = p + "%";
      const card = wrap.querySelector(`#pf-card-${faz.id}`);
      if (card) { card.classList.toggle("pf-done", p === 100); card.classList.toggle("pf-active", p > 0 && p < 100); }
      faz.adimlar.forEach((_, i) => {
        const chk = isChecked(state, faz.id, i);
        const cb  = wrap.querySelector(`#pf-cb-${faz.id}-${i}`); if (cb) cb.checked = chk;
        const lbl = wrap.querySelector(`#pf-lbl-${faz.id}-${i}`);
        if (lbl) lbl.style.textDecoration = chk ? "line-through" : "none";
      });
    });
  }

  // ─── E-PLAN KONTROL RENDER ────────────────────────────────────────────────
  function _renderEplan(wrap) {
    const toplam = EP_KONTROL.reduce((s, f) => s + f.adimlar.length, 0);
    const tam    = EP_KONTROL.reduce((s, f) => s + _fazToplam(epState, EP_KONTROL, f), 0);
    const pct    = Math.round((tam / toplam) * 100);

    wrap.innerHTML = `
      <div class="ep-kl-bilgi">
        <div>
          <h3 class="ep-kl-baslik">📐 E-Plan Kontrol Noktaları</h3>
          <p class="ep-kl-sub">Proje boyunca E-Plan'da hazırlanması gereken belgeler ve kalite kontrol adımları — atlanmadan takip edin.</p>
        </div>
        <div class="pf-overall-wrap" style="min-width:200px">
          <div class="pf-overall-top">
            <span id="ep-kl-cnt">${tam} / ${toplam} adım</span>
            <span id="ep-kl-pct" class="pf-overall-pct">${pct}%</span>
          </div>
          <div class="pf-overall-track"><div id="ep-kl-bar" class="pf-overall-fill" style="width:${pct}%;background:#6366f1"></div></div>
        </div>
      </div>

      <div class="ep-kl-grid">
        ${EP_KONTROL.map((blok, bi) => {
          const t   = _fazToplam(epState, EP_KONTROL, blok);
          const bpct = Math.round((t / blok.adimlar.length) * 100);
          const dc   = bpct === 100 ? "pf-done" : bpct > 0 ? "pf-active" : "";
          return `
            <div class="ep-kl-kart ${dc}" id="ep-kl-${blok.id}" style="--faz-renk:${blok.renk}">
              <div class="ep-kl-kart-head">
                <div class="pf-no" style="background:${blok.renk};font-size:16px;width:28px;height:28px">${blok.ikon}</div>
                <div style="flex:1">
                  <div class="pf-faz-baslik" style="font-size:13px">${blok.baslik}</div>
                  <div style="font-size:10px;color:var(--muted);margin-top:2px">📍 ${blok.faz_ref}</div>
                </div>
                <div style="text-align:right">
                  <span class="pf-pct-lbl" style="color:${blok.renk};font-size:16px">${bpct}%</span>
                  <div class="pf-bar-track" style="width:70px;margin-top:4px">
                    <div class="pf-bar-fill" id="ep-kl-bar-${blok.id}" style="width:${bpct}%;background:${blok.renk}"></div>
                  </div>
                </div>
              </div>
              <p style="font-size:11.5px;color:var(--muted);margin:8px 0 10px">${blok.aciklama}</p>
              <div class="pf-adimlar">
                ${blok.adimlar.map((adim, i) => {
                  const chk = isChecked(epState, blok.id, i);
                  return `<label class="pf-adim" for="ep-kl-cb-${blok.id}-${i}">
                    <input type="checkbox" id="ep-kl-cb-${blok.id}-${i}" class="ep-kl-cb"
                      data-faz="${blok.id}" data-idx="${i}"
                      ${chk ? "checked" : ""} style="accent-color:${blok.renk}" />
                    <span class="pf-adim-no" style="color:${blok.renk}">${bi+1}.${i+1}</span>
                    <span class="pf-adim-metin" id="ep-kl-lbl-${blok.id}-${i}"
                      style="${chk ? "text-decoration:line-through;color:var(--muted)" : ""}">${adim}</span>
                    ${chk ? `<span class="pf-tick" style="color:${blok.renk}">✓</span>` : ""}
                  </label>`;
                }).join("")}
              </div>
              ${bpct === 100 ? `<div class="pf-done-badge" style="border-color:${blok.renk}44;color:${blok.renk}">✅ Tamamlandı</div>` : ""}
            </div>`;
        }).join("")}
      </div>

      <div class="ep-kl-ozet">
        ${EP_KONTROL.map(blok => {
          const t  = _fazToplam(epState, EP_KONTROL, blok);
          const p  = Math.round((t / blok.adimlar.length) * 100);
          return `<div class="ep-kl-ozet-item" title="${blok.baslik}: ${p}%" style="--bc:${blok.renk}">
            <span>${blok.ikon}</span>
            <div class="ep-kl-ozet-bar"><div style="width:${p}%;height:100%;background:${blok.renk};border-radius:2px"></div></div>
            <span style="font-size:10px;font-weight:700;color:${blok.renk}">${p}%</span>
          </div>`;
        }).join("")}
      </div>`;

    wrap.querySelectorAll(".ep-kl-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        toggle(epState, EP_STORAGE_KEY, cb.dataset.faz, +cb.dataset.idx, () => _refreshEplan(wrap));
      });
    });
  }

  function _refreshEplan(wrap) {
    const toplam = EP_KONTROL.reduce((s, f) => s + f.adimlar.length, 0);
    const tam    = EP_KONTROL.reduce((s, f) => s + _fazToplam(epState, EP_KONTROL, f), 0);
    const pct    = Math.round((tam / toplam) * 100);
    const cnt = wrap.querySelector("#ep-kl-cnt"); if (cnt) cnt.textContent = `${tam} / ${toplam} adım`;
    const pl  = wrap.querySelector("#ep-kl-pct"); if (pl)  pl.textContent = pct + "%";
    const bar = wrap.querySelector("#ep-kl-bar"); if (bar) bar.style.width = pct + "%";
    EP_KONTROL.forEach((blok, bi) => {
      const t  = _fazToplam(epState, EP_KONTROL, blok);
      const p  = Math.round((t / blok.adimlar.length) * 100);
      const b  = wrap.querySelector(`#ep-kl-bar-${blok.id}`); if (b) b.style.width = p + "%";
      const card = wrap.querySelector(`#ep-kl-${blok.id}`);
      if (card) { card.classList.toggle("pf-done", p === 100); card.classList.toggle("pf-active", p > 0 && p < 100); }
      blok.adimlar.forEach((_, i) => {
        const chk = isChecked(epState, blok.id, i);
        const cb  = wrap.querySelector(`#ep-kl-cb-${blok.id}-${i}`); if (cb) cb.checked = chk;
        const lbl = wrap.querySelector(`#ep-kl-lbl-${blok.id}-${i}`);
        if (lbl) lbl.style.textDecoration = chk ? "line-through" : "none";
      });
    });
  }

  // ─── ANA LOAD ─────────────────────────────────────────────────────────────
  function load() {
    const panel = document.getElementById("panel-flow");
    if (!panel) return;
    state   = loadState(STORAGE_KEY);
    epState = loadState(EP_STORAGE_KEY);

    panel.innerHTML = `
      <div class="pf-layout">
        <div class="pf-header">
          <div>
            <h2 class="pf-title">⚙️ Otomasyon Projesi Planlama</h2>
            <p class="pf-subtitle">Proje akışı ve E-Plan kontrol noktaları — adım adım, eksiksiz takip.</p>
          </div>
          <div class="pf-view-tabs">
            <button class="pf-vtab active" data-view="akis">⚙️ Proje Akışı</button>
            <button class="pf-vtab" data-view="eplan">📐 E-Plan Kontrol</button>
          </div>
        </div>
        <div id="pf-view-wrap"></div>
      </div>`;

    const viewWrap = panel.querySelector("#pf-view-wrap");
    let aktifView  = "akis";

    function switchView(v) {
      aktifView = v;
      panel.querySelectorAll(".pf-vtab").forEach(b => b.classList.toggle("active", b.dataset.view === v));
      if (v === "akis")  _renderAkis(viewWrap);
      else               _renderEplan(viewWrap);
    }

    panel.querySelectorAll(".pf-vtab").forEach(b => {
      b.addEventListener("click", () => switchView(b.dataset.view));
    });

    switchView("akis");
  }

  return { load };
})();

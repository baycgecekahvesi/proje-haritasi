import { useState, useMemo } from "react";

// ── Veri ──────────────────────────────────────────────────────────────────────
const ROLLER = [
  { id: "ELK", adi: "Elektrik/Otomasyon Müh.", renk: "#10B981", ikon: "⚡" },
  { id: "PLC", adi: "PLC Programcısı",        renk: "#3B82F6", ikon: "🔷" },
  { id: "SCADA", adi: "SCADA Mühendisi",       renk: "#8B5CF6", ikon: "🖥️" },
  { id: "SAHA", adi: "Saha Teknisyeni",        renk: "#F59E0B", ikon: "🔧" },
  { id: "PM",   adi: "Proje Müdürü",           renk: "#EF4444", ikon: "📋" },
];

const FAZLAR = ["Başlangıç","Planlama","Tasarım","Tedarik","Geliştirme","Entegrasyon","Test","Devreye Alma","Kabul","Kapanış"];
const DURUMLAR = [
  { id: "Planlandı",     renk: "#4B5563", bg: "#1F2937" },
  { id: "Devam Ediyor",  renk: "#3B82F6", bg: "#1E3A5F" },
  { id: "İncelemede",    renk: "#8B5CF6", bg: "#2D1B69" },
  { id: "Tamamlandı",    renk: "#10B981", bg: "#064E3B" },
  { id: "Engellendi",    renk: "#EF4444", bg: "#450A0A" },
];

const BASLANGIC_TARIHI = new Date("2026-07-01");

const ham_gorevler = [
  // ELK
  { id:"ELK-001", rol:"ELK", adi:"Otomasyon Mimarisi Tasarımı",    faz:"Tasarım",      gun:3,  onk:[],                       teslim:"Mimari blok şema" },
  { id:"ELK-002", rol:"ELK", adi:"Ekipman Listesi ve Ön Seçim",    faz:"Tasarım",      gun:2,  onk:["ELK-001"],              teslim:"Ekipman ön seçim tablosu" },
  { id:"ELK-003", rol:"ELK", adi:"Güç Dağıtım Tek Hat Şeması",     faz:"Tasarım",      gun:3,  onk:["ELK-002"],              teslim:"Onaylı SLD" },
  { id:"ELK-004", rol:"ELK", adi:"Kablo Kesit ve Koruma Hesabı",   faz:"Tasarım",      gun:2,  onk:["ELK-003"],              teslim:"Hesap raporu" },
  { id:"ELK-005", rol:"ELK", adi:"Pano Layout Tasarımı",           faz:"Tasarım",      gun:2,  onk:["ELK-002","ELK-003"],    teslim:"Panel layout" },
  { id:"ELK-006", rol:"ELK", adi:"I/O Listesi (Müh. Sürümü)",      faz:"Tasarım",      gun:2,  onk:["ELK-001"],              teslim:"Master I/O listesi" },
  { id:"ELK-007", rol:"ELK", adi:"Fonksiyonel Tasarım Dok. (FDS)", faz:"Tasarım",      gun:4,  onk:["ELK-001","ELK-006"],    teslim:"Onaylı FDS" },
  { id:"ELK-008", rol:"ELK", adi:"Risk Değerlendirmesi",           faz:"Tasarım",      gun:2,  onk:["ELK-007"],              teslim:"Risk matrisi" },
  { id:"ELK-009", rol:"ELK", adi:"Teknik Şartname Hazırlama",      faz:"Tedarik",      gun:3,  onk:["ELK-003","ELK-004"],    teslim:"Şartname seti" },
  { id:"ELK-010", rol:"ELK", adi:"Malzeme Listesi (BOM) ve Teklif",faz:"Tedarik",      gun:2,  onk:["ELK-009"],              teslim:"BOM + teklif" },
  { id:"ELK-011", rol:"ELK", adi:"Tedarikçi/Teklif Değerlendirme", faz:"Tedarik",      gun:2,  onk:["ELK-010"],              teslim:"Karşılaştırma tablosu" },
  { id:"ELK-012", rol:"ELK", adi:"FAT Planı Hazırlama",            faz:"Test",         gun:2,  onk:["ELK-007"],              teslim:"FAT planı" },
  { id:"ELK-013", rol:"ELK", adi:"FAT Denetimi/Onayı",             faz:"Test",         gun:2,  onk:["ELK-012","PLC-009","SCADA-011"], teslim:"İmzalı FAT" },
  { id:"ELK-014", rol:"ELK", adi:"Devreye Alma Müh. Desteği",      faz:"Devreye Alma", gun:5,  onk:["ELK-013"],              teslim:"Commissioning raporu" },
  { id:"ELK-015", rol:"ELK", adi:"CE/Teknik Dosya Hazırlama",      faz:"Kapanış",      gun:3,  onk:["ELK-014"],              teslim:"Teknik dosya" },
  { id:"ELK-016", rol:"ELK", adi:"As-Built Onayı",                 faz:"Kapanış",      gun:1,  onk:["ELK-015"],              teslim:"Onaylı as-built" },
  // PLC
  { id:"PLC-001", rol:"PLC", adi:"I/O Listesi Hazırlama",          faz:"Tasarım",      gun:3,  onk:["ELK-001","ELK-006"],    teslim:"Excel I/O Listesi" },
  { id:"PLC-002", rol:"PLC", adi:"Tag Veritabanı Oluşturma",       faz:"Tasarım",      gun:2,  onk:["PLC-001"],              teslim:"Tag export" },
  { id:"PLC-003", rol:"PLC", adi:"Ana Program Yapısı",             faz:"Geliştirme",   gun:3,  onk:["PLC-001","ELK-007"],    teslim:"PLC proje v1" },
  { id:"PLC-004", rol:"PLC", adi:"Güvenlik Bloklarının Yazılması", faz:"Geliştirme",   gun:4,  onk:["PLC-003"],              teslim:"Safety FB kütüphanesi" },
  { id:"PLC-005", rol:"PLC", adi:"Sıra Kontrol Programlama",       faz:"Geliştirme",   gun:5,  onk:["PLC-003","PLC-004"],    teslim:"Sequence FB'leri" },
  { id:"PLC-006", rol:"PLC", adi:"Alarm Yönetimi",                 faz:"Geliştirme",   gun:2,  onk:["PLC-003"],              teslim:"Alarm listesi + kod" },
  { id:"PLC-007", rol:"PLC", adi:"HMI Haberleşme Konfigürasyonu",  faz:"Entegrasyon",  gun:2,  onk:["PLC-002","SCADA-003"],  teslim:"Haberleşme test raporu" },
  { id:"PLC-008", rol:"PLC", adi:"Offline Simülasyon ve Test",     faz:"Test",         gun:3,  onk:["PLC-003","PLC-004","PLC-005"], teslim:"Simülasyon raporu" },
  { id:"PLC-009", rol:"PLC", adi:"FAT Hazırlığı ve Uygulama",     faz:"Test",         gun:3,  onk:["PLC-008"],              teslim:"İmzalı FAT" },
  { id:"PLC-010", rol:"PLC", adi:"Saha Devreye Alma",              faz:"Devreye Alma", gun:7,  onk:["PLC-009","SAHA-010"],   teslim:"Commissioning raporu" },
  { id:"PLC-011", rol:"PLC", adi:"SAT Uygulama ve Onay",           faz:"Kabul",        gun:2,  onk:["PLC-010"],              teslim:"İmzalı SAT" },
  { id:"PLC-012", rol:"PLC", adi:"As-Built Dokümantasyon",         faz:"Kapanış",      gun:2,  onk:["PLC-011"],              teslim:"As-built PLC projesi" },
  // SCADA
  { id:"SCADA-001", rol:"SCADA", adi:"Mimari ve Platform Seçimi",    faz:"Tasarım",      gun:2,  onk:["ELK-001"],              teslim:"SCADA mimari dokümanı" },
  { id:"SCADA-002", rol:"SCADA", adi:"Tag İsimlendirme Standardı",   faz:"Tasarım",      gun:1,  onk:["SCADA-001"],            teslim:"Naming convention" },
  { id:"SCADA-003", rol:"SCADA", adi:"Tag Veritabanı Oluşturma",     faz:"Geliştirme",   gun:4,  onk:["SCADA-002","PLC-002"],  teslim:"Tag veritabanı" },
  { id:"SCADA-004", rol:"SCADA", adi:"Ana Mimik Ekranları",           faz:"Geliştirme",   gun:5,  onk:["SCADA-003"],            teslim:"Ana ekranlar" },
  { id:"SCADA-005", rol:"SCADA", adi:"Detay Ekranları",               faz:"Geliştirme",   gun:5,  onk:["SCADA-004"],            teslim:"Detay ekranları" },
  { id:"SCADA-006", rol:"SCADA", adi:"Alarm Konfigürasyonu",          faz:"Geliştirme",   gun:3,  onk:["SCADA-003","PLC-006"],  teslim:"Alarm listesi" },
  { id:"SCADA-007", rol:"SCADA", adi:"Historian Konfigürasyonu",      faz:"Geliştirme",   gun:2,  onk:["SCADA-003"],            teslim:"Historian arşiv planı" },
  { id:"SCADA-008", rol:"SCADA", adi:"Kullanıcı Yetkilendirme",       faz:"Geliştirme",   gun:1,  onk:["SCADA-001"],            teslim:"User role matrisi" },
  { id:"SCADA-009", rol:"SCADA", adi:"OPC/Haberleşme Bağlantısı",    faz:"Entegrasyon",  gun:3,  onk:["SCADA-003","PLC-007"],  teslim:"Haberleşme test raporu" },
  { id:"SCADA-010", rol:"SCADA", adi:"Raporlama Modülü",              faz:"Geliştirme",   gun:3,  onk:["SCADA-007"],            teslim:"Rapor şablonları" },
  { id:"SCADA-011", rol:"SCADA", adi:"FAT Uygulama",                  faz:"Test",         gun:3,  onk:["SCADA-009"],            teslim:"İmzalı SCADA FAT" },
  { id:"SCADA-012", rol:"SCADA", adi:"Saha Devreye Alma",             faz:"Devreye Alma", gun:4,  onk:["SCADA-011","PLC-010"],  teslim:"SCADA canlı sistem" },
  { id:"SCADA-013", rol:"SCADA", adi:"Operatör Eğitimi",              faz:"Kapanış",      gun:2,  onk:["SCADA-012"],            teslim:"Eğitim kaydı" },
  { id:"SCADA-014", rol:"SCADA", adi:"As-Built Dokümantasyon",        faz:"Kapanış",      gun:2,  onk:["SCADA-013"],            teslim:"As-built SCADA" },
  // SAHA
  { id:"SAHA-001", rol:"SAHA", adi:"Saha Ön Keşif ve Ölçüm",       faz:"Tasarım",      gun:1,  onk:[],                       teslim:"Keşif raporu" },
  { id:"SAHA-002", rol:"SAHA", adi:"Malzeme Teslim Alma",           faz:"Tedarik",      gun:1,  onk:["ELK-011"],              teslim:"İrsaliye onaylı liste" },
  { id:"SAHA-003", rol:"SAHA", adi:"Pano/Kabin Mekanik Montajı",    faz:"Geliştirme",   gun:2,  onk:["SAHA-001","SAHA-002"],  teslim:"Montaj fotoğrafları" },
  { id:"SAHA-004", rol:"SAHA", adi:"Kablo Kanal ve Tray Döşeme",    faz:"Geliştirme",   gun:3,  onk:["SAHA-003"],             teslim:"Döşeme fotoğrafları" },
  { id:"SAHA-005", rol:"SAHA", adi:"Güç Kablolarının Çekilmesi",    faz:"Geliştirme",   gun:2,  onk:["SAHA-004"],             teslim:"Kablo listesi" },
  { id:"SAHA-006", rol:"SAHA", adi:"Sinyal/Kontrol Kabloları",      faz:"Geliştirme",   gun:2,  onk:["SAHA-004"],             teslim:"Sinyal kablo listesi" },
  { id:"SAHA-007", rol:"SAHA", adi:"Pano İç Bağlantıları",          faz:"Geliştirme",   gun:2,  onk:["SAHA-005","SAHA-006"],  teslim:"Bağlantı kontrol formu" },
  { id:"SAHA-008", rol:"SAHA", adi:"Saha Cihazları Montajı",        faz:"Geliştirme",   gun:2,  onk:["SAHA-004"],             teslim:"Montaj fotoğrafları" },
  { id:"SAHA-009", rol:"SAHA", adi:"Kablo Test (Süreklilik/İzol.)", faz:"Test",         gun:1,  onk:["SAHA-007"],             teslim:"Kablo test raporu" },
  { id:"SAHA-010", rol:"SAHA", adi:"I/O Checkout (Sinyal Doğr.)",   faz:"Devreye Alma", gun:2,  onk:["SAHA-009","PLC-003"],   teslim:"I/O checkout formu" },
  { id:"SAHA-011", rol:"SAHA", adi:"Cihaz Devreye Alma",            faz:"Devreye Alma", gun:2,  onk:["SAHA-010"],             teslim:"Parametre listesi" },
  { id:"SAHA-012", rol:"SAHA", adi:"Fonksiyonel Test Desteği",      faz:"Test",         gun:2,  onk:["SAHA-011","PLC-008"],   teslim:"Test desteği kaydı" },
  { id:"SAHA-013", rol:"SAHA", adi:"As-Built (Red-line) Güncelleme",faz:"Kapanış",      gun:1,  onk:["SAHA-012"],             teslim:"As-built şemalar" },
  { id:"SAHA-014", rol:"SAHA", adi:"Saha Temizlik ve Teslim",       faz:"Kapanış",      gun:1,  onk:["SAHA-013"],             teslim:"Teslim tutanağı" },
  // PM
  { id:"PM-001", rol:"PM", adi:"Proje Kick-off ve Kapsam",        faz:"Başlangıç",    gun:2,  onk:[],                       teslim:"Kick-off tutanağı" },
  { id:"PM-002", rol:"PM", adi:"Proje Planı ve Gantt",            faz:"Planlama",     gun:2,  onk:["PM-001"],               teslim:"Onaylı proje planı" },
  { id:"PM-003", rol:"PM", adi:"Kaynak Planlaması",               faz:"Planlama",     gun:1,  onk:["PM-002"],               teslim:"Kaynak takvimi" },
  { id:"PM-004", rol:"PM", adi:"Risk Kaydı Oluşturma",            faz:"Planlama",     gun:1,  onk:["PM-001"],               teslim:"Risk matrisi" },
  { id:"PM-005", rol:"PM", adi:"FAT Koordinasyonu",               faz:"Test",         gun:2,  onk:["ELK-012","PLC-009","SCADA-011"], teslim:"FAT davet + gündem" },
  { id:"PM-006", rol:"PM", adi:"Müşteri SAT Koordinasyonu",       faz:"Kabul",        gun:2,  onk:["PLC-010","SCADA-012"],  teslim:"SAT davet + onay paketi" },
  { id:"PM-007", rol:"PM", adi:"Proje Kapanış Raporu",            faz:"Kapanış",      gun:2,  onk:["PLC-012","SCADA-014","ELK-016"], teslim:"Kapanış raporu" },
];

// ── Görev başlangıç günlerini topologik sırayla hesapla ─────────────────────
function hesaplaBaslangiclar(gorevler) {
  const baslangic = {};
  const resolved = new Set();
  let gorevListesi = [...gorevler];
  let iterasyon = 0;
  while (resolved.size < gorevler.length && iterasyon < 200) {
    iterasyon++;
    for (const g of gorevListesi) {
      if (resolved.has(g.id)) continue;
      const onkTam = g.onk.every(o => resolved.has(o));
      if (onkTam) {
        const onkBitis = g.onk.length === 0 ? 0
          : Math.max(...g.onk.map(o => baslangic[o] + gorevler.find(x=>x.id===o).gun));
        baslangic[g.id] = onkBitis;
        resolved.add(g.id);
      }
    }
  }
  return baslangic;
}

// ── Renk yardımcıları ────────────────────────────────────────────────────────
function rolRenk(rolId) {
  return ROLLER.find(r => r.id === rolId)?.renk || "#6B7280";
}
function durumRenk(durum) {
  return DURUMLAR.find(d => d.id === durum)?.renk || "#4B5563";
}
function durumBg(durum) {
  return DURUMLAR.find(d => d.id === durum)?.bg || "#1F2937";
}

// ── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function App() {
  const [gorevler, setGorevler] = useState(() =>
    ham_gorevler.map(g => ({ ...g, durum: "Planlandı", tamamlanma: 0, not: "" }))
  );
  const [aktifGoruntü, setAktifGoruntü] = useState("kanban"); // kanban | gantt | liste
  const [aktifRol, setAktifRol] = useState("HEPSI");
  const [aktifFaz, setAktifFaz] = useState("HEPSI");
  const [secilenGorev, setSecilenGorev] = useState(null);
  const [aramaMetni, setAramaMetni] = useState("");

  const baslangiclar = useMemo(() => hesaplaBaslangiclar(ham_gorevler), []);

  const filtreliGorevler = useMemo(() => gorevler.filter(g => {
    if (aktifRol !== "HEPSI" && g.rol !== aktifRol) return false;
    if (aktifFaz !== "HEPSI" && g.faz !== aktifFaz) return false;
    if (aramaMetni && !g.adi.toLowerCase().includes(aramaMetni.toLowerCase()) && !g.id.toLowerCase().includes(aramaMetni.toLowerCase())) return false;
    return true;
  }), [gorevler, aktifRol, aktifFaz, aramaMetni]);

  function gorevGuncelle(id, alan, deger) {
    setGorevler(prev => prev.map(g => g.id === id ? { ...g, [alan]: deger } : g));
    if (secilenGorev?.id === id) setSecilenGorev(prev => ({ ...prev, [alan]: deger }));
  }

  const toplamGorev = gorevler.length;
  const tamamlanan = gorevler.filter(g => g.durum === "Tamamlandı").length;
  const devamEden = gorevler.filter(g => g.durum === "Devam Ediyor").length;
  const engellenen = gorevler.filter(g => g.durum === "Engellendi").length;
  const ilerlemePct = Math.round((tamamlanan / toplamGorev) * 100);

  const maxGun = useMemo(() => Math.max(...ham_gorevler.map(g => baslangiclar[g.id] + g.gun)), [baslangiclar]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0D14", minHeight: "100vh", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1E2433", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D1117" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#10B981,#3B82F6)", borderRadius: 8, display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>⚙</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>Otomasyon Birimi</div>
            <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 1 }}>PROJE TAKİP SİSTEMİ</div>
          </div>
        </div>
        {/* Genel İlerleme */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { etiket: "Toplam", deger: toplamGorev, renk: "#94A3B8" },
            { etiket: "Tamamlandı", deger: tamamlanan, renk: "#10B981" },
            { etiket: "Devam", deger: devamEden, renk: "#3B82F6" },
            { etiket: "Engel", deger: engellenen, renk: "#EF4444" },
          ].map(s => (
            <div key={s.etiket} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.renk }}>{s.deger}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{s.etiket}</div>
            </div>
          ))}
          <div style={{ width: 80, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#F59E0B" }}>{ilerlemePct}%</div>
            <div style={{ height: 4, background: "#1E2433", borderRadius: 2, marginTop: 4 }}>
              <div style={{ height: "100%", width: `${ilerlemePct}%`, background: "linear-gradient(90deg,#10B981,#3B82F6)", borderRadius: 2, transition:"width 0.5s" }} />
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>İlerleme</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid #1E2433", background: "#0D1117" }}>
        {/* Görünüm seçici */}
        <div style={{ display: "flex", background: "#161B26", borderRadius: 8, padding: 3, gap: 2 }}>
          {[["kanban","🗂 Kanban"],["gantt","📊 Gantt"],["liste","☰ Liste"]].map(([v,l]) => (
            <button key={v} onClick={() => setAktifGoruntü(v)} style={{
              padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: aktifGoruntü === v ? "#1E3A5F" : "transparent",
              color: aktifGoruntü === v ? "#60A5FA" : "#64748B",
              transition: "all 0.15s"
            }}>{l}</button>
          ))}
        </div>
        {/* Rol filtresi */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setAktifRol("HEPSI")} style={filterBtn(aktifRol === "HEPSI", "#64748B")}>Tüm Roller</button>
          {ROLLER.map(r => (
            <button key={r.id} onClick={() => setAktifRol(r.id)} style={filterBtn(aktifRol === r.id, r.renk)}>
              {r.ikon} {r.adi.split("/")[0].trim()}
            </button>
          ))}
        </div>
        {/* Faz filtresi */}
        <select value={aktifFaz} onChange={e => setAktifFaz(e.target.value)} style={{
          background: "#161B26", border: "1px solid #1E2433", color: "#94A3B8",
          borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer"
        }}>
          <option value="HEPSI">Tüm Fazlar</option>
          {FAZLAR.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {/* Arama */}
        <input value={aramaMetni} onChange={e => setAramaMetni(e.target.value)}
          placeholder="Görev ara..." style={{
            background: "#161B26", border: "1px solid #1E2433", color: "#E2E8F0",
            borderRadius: 8, padding: "5px 12px", fontSize: 12, outline: "none", minWidth: 160
          }} />
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>{filtreliGorevler.length} görev gösteriliyor</div>
      </div>

      {/* İçerik */}
      <div style={{ padding: "20px 24px" }}>
        {aktifGoruntü === "kanban" && <KanbanGoruntum gorevler={filtreliGorevler} onGorevTikla={setSecilenGorev} onDurumDegistir={gorevGuncelle} baslangiclar={baslangiclar} />}
        {aktifGoruntü === "gantt" && <GanttGoruntum gorevler={filtreliGorevler} baslangiclar={baslangiclar} maxGun={maxGun} onGorevTikla={setSecilenGorev} />}
        {aktifGoruntü === "liste" && <ListeGoruntum gorevler={filtreliGorevler} onGorevTikla={setSecilenGorev} baslangiclar={baslangiclar} />}
      </div>

      {/* Görev Detay Paneli */}
      {secilenGorev && (
        <GorevDetay gorev={secilenGorev} tumGorevler={gorevler} onKapat={() => setSecilenGorev(null)} onGuncelle={gorevGuncelle} baslangiclar={baslangiclar} />
      )}
    </div>
  );
}

function filterBtn(aktif, renk) {
  return {
    padding: "4px 12px", borderRadius: 20, border: `1px solid ${aktif ? renk : "#1E2433"}`,
    background: aktif ? `${renk}22` : "transparent", color: aktif ? renk : "#64748B",
    cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.15s"
  };
}

// ── Kanban ───────────────────────────────────────────────────────────────────
function KanbanGoruntum({ gorevler, onGorevTikla, onDurumDegistir, baslangiclar }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {DURUMLAR.map(d => {
        const sutunGorevler = gorevler.filter(g => g.durum === d.id);
        return (
          <div key={d.id} style={{ minWidth: 230, flex: "0 0 230px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 10, padding: "6px 10px", background: d.bg, borderRadius: 8, border: `1px solid ${d.renk}44` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.renk }}>{d.id}</span>
              <span style={{ fontSize: 11, background: `${d.renk}33`, color: d.renk, borderRadius: 10, padding: "1px 8px" }}>{sutunGorevler.length}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
              {sutunGorevler.map(g => (
                <KanbanKart key={g.id} gorev={g} onTikla={() => onGorevTikla(g)} onDurumDegistir={onDurumDegistir} baslangiclar={baslangiclar} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanKart({ gorev, onTikla, onDurumDegistir, baslangiclar }) {
  const r = rolRenk(gorev.rol);
  const rol = ROLLER.find(x => x.id === gorev.rol);
  const gunNo = baslangiclar[gorev.id] || 0;
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onTikla} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: hover ? "#161B26" : "#111827", border: `1px solid ${hover ? r+"66" : "#1E2433"}`,
      borderLeft: `3px solid ${r}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer",
      transition: "all 0.15s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: r, fontFamily: "monospace", fontWeight: 700 }}>{gorev.id}</span>
        <span style={{ fontSize: 9, color: "#475569", background:"#1E2433", borderRadius: 4, padding:"1px 5px", whiteSpace:"nowrap" }}>G{gunNo+1}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", lineHeight: 1.4, marginBottom: 8 }}>{gorev.adi}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize: 10, color: "#475569" }}>{rol?.ikon} {gorev.faz}</span>
        <span style={{ fontSize: 10, color: "#64748B" }}>{gorev.gun}g</span>
      </div>
      {gorev.tamamlanma > 0 && (
        <div style={{ marginTop: 6, height: 3, background: "#1E2433", borderRadius: 2 }}>
          <div style={{ height:"100%", width:`${gorev.tamamlanma}%`, background: r, borderRadius: 2 }} />
        </div>
      )}
      {/* Hızlı durum geçişi */}
      <div style={{ display:"flex", gap: 4, marginTop: 8 }} onClick={e => e.stopPropagation()}>
        {DURUMLAR.map(d => (
          <button key={d.id} title={d.id} onClick={() => onDurumDegistir(gorev.id, "durum", d.id)} style={{
            width: 12, height: 12, borderRadius: "50%", border: gorev.durum === d.id ? `2px solid ${d.renk}` : "1px solid #2D3748",
            background: gorev.durum === d.id ? d.renk : "transparent", cursor: "pointer", padding: 0
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Gantt ────────────────────────────────────────────────────────────────────
function GanttGoruntum({ gorevler, baslangiclar, maxGun, onGorevTikla }) {
  const HUCRE_GEN = 18;
  const ROL_COL = 220;
  const haftalar = Math.ceil(maxGun / 5);

  // Kritik yolu bul (en uzun bağımlılık zinciri)
  const kritikYol = useMemo(() => {
    const gecikme = {};
    ham_gorevler.forEach(g => { gecikme[g.id] = (baslangiclar[g.id] || 0) + g.gun; });
    const maxBitis = Math.max(...Object.values(gecikme));
    const kritik = new Set();
    function izle(id) {
      kritik.add(id);
      const g = ham_gorevler.find(x => x.id === id);
      if (!g) return;
      const onkBitis = g.onk.map(o => ({ o, b: gecikme[o] }));
      if (onkBitis.length === 0) return;
      const enGec = Math.max(...onkBitis.map(x => x.b));
      onkBitis.filter(x => x.b === enGec).forEach(x => izle(x.o));
    }
    const sonGorevler = ham_gorevler.filter(g => gecikme[g.id] === maxBitis);
    sonGorevler.forEach(g => izle(g.id));
    return kritik;
  }, [baslangiclar]);

  const gruplar = useMemo(() => {
    const g = {};
    gorevler.forEach(gv => { if (!g[gv.rol]) g[gv.rol] = []; g[gv.rol].push(gv); });
    return Object.entries(g).map(([rolId, gvler]) => ({ rolId, gvler: gvler.sort((a,b) => (baslangiclar[a.id]||0)-(baslangiclar[b.id]||0)) }));
  }, [gorevler, baslangiclar]);

  const toplamGenislik = ROL_COL + maxGun * HUCRE_GEN;

  return (
    <div style={{ overflowX: "auto", background: "#0D1117", borderRadius: 10, border: "1px solid #1E2433" }}>
      {/* Başlık: Hafta numaraları */}
      <div style={{ display: "flex", borderBottom: "1px solid #1E2433", position: "sticky", top: 0, background: "#0D1117", zIndex: 10 }}>
        <div style={{ minWidth: ROL_COL, borderRight: "1px solid #1E2433", padding: "8px 12px", fontSize: 11, color: "#475569", fontWeight: 700 }}>GÖREV</div>
        <div style={{ display: "flex", flex: 1 }}>
          {Array.from({ length: haftalar }).map((_, hi) => (
            <div key={hi} style={{ minWidth: 5 * HUCRE_GEN, borderRight: "1px solid #1E2433", padding: "4px 0", textAlign: "center", fontSize: 10, color: "#475569" }}>
              H{hi + 1}
              <div style={{ display: "flex" }}>
                {[1,2,3,4,5].map(d => (
                  <div key={d} style={{ width: HUCRE_GEN, borderRight: "1px solid #111827", fontSize: 9, color: "#2D3748", textAlign:"center", paddingTop:2 }}>{hi*5+d}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Satırlar */}
      {gruplar.map(({ rolId, gvler }) => {
        const rol = ROLLER.find(r => r.id === rolId);
        return (
          <div key={rolId}>
            {/* Rol başlık satırı */}
            <div style={{ display:"flex", background:"#111827", borderBottom:"1px solid #1E2433" }}>
              <div style={{ minWidth: ROL_COL, padding:"6px 12px", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:14 }}>{rol?.ikon}</span>
                <span style={{ fontSize:11, fontWeight:700, color: rol?.renk }}>{rol?.adi}</span>
                <span style={{ marginLeft:"auto", fontSize:10, color:"#475569" }}>{gvler.length}g</span>
              </div>
              <div style={{ flex:1, minWidth: maxGun*HUCRE_GEN, background:`${rol?.renk}08`, borderLeft:`1px solid ${rol?.renk}33` }} />
            </div>
            {/* Görev satırları */}
            {gvler.map(g => {
              const bs = baslangiclar[g.id] || 0;
              const rkRenk = rolRenk(g.rol);
              const isKritik = kritikYol.has(g.id);
              return (
                <div key={g.id} onClick={() => onGorevTikla(g)} style={{ display:"flex", borderBottom:"1px solid #0F1117", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background="#111827"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{ minWidth: ROL_COL, padding:"5px 12px 5px 20px", borderRight:"1px solid #1E2433", display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:9, color: rkRenk, fontFamily:"monospace", fontWeight:700, minWidth:70 }}>{g.id}</span>
                    <span style={{ fontSize:11, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.adi}</span>
                    {g.durum === "Tamamlandı" && <span style={{marginLeft:"auto",fontSize:10}}>✓</span>}
                    {g.durum === "Engellendi" && <span style={{marginLeft:"auto",fontSize:10,color:"#EF4444"}}>!</span>}
                  </div>
                  {/* Gantt çubuğu */}
                  <div style={{ flex:1, minWidth: maxGun*HUCRE_GEN, position:"relative", height:30 }}>
                    {/* Arka plan grid */}
                    {Array.from({length: maxGun}).map((_,i) => (
                      <div key={i} style={{ position:"absolute", left: i*HUCRE_GEN, top:0, width:HUCRE_GEN, height:"100%",
                        borderRight: (i+1)%5===0 ? "1px solid #1E2433" : "1px solid #111827" }} />
                    ))}
                    {/* Çubuk */}
                    <div style={{
                      position:"absolute", left: bs*HUCRE_GEN+2, top:5, height:20,
                      width: g.gun*HUCRE_GEN-4, borderRadius:4,
                      background: isKritik
                        ? `linear-gradient(90deg,${rkRenk},#EF4444)`
                        : g.durum === "Tamamlandı" ? "#10B981"
                        : g.durum === "Engellendi" ? "#EF444488"
                        : rkRenk+"CC",
                      boxShadow: isKritik ? `0 0 6px #EF444466` : "none",
                      display:"flex", alignItems:"center", paddingLeft:4,
                      overflow:"hidden"
                    }}>
                      <span style={{ fontSize:9, color:"white", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {g.adi}
                      </span>
                    </div>
                    {/* Tamamlanma dolgu */}
                    {g.tamamlanma > 0 && g.durum !== "Tamamlandı" && (
                      <div style={{
                        position:"absolute", left: bs*HUCRE_GEN+2, top:5, height:20,
                        width: (g.gun*HUCRE_GEN-4) * g.tamamlanma/100,
                        borderRadius:4, background:"#ffffff33"
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {/* Kritik yol açıklaması */}
      <div style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:8, borderTop:"1px solid #1E2433" }}>
        <div style={{ width:30, height:6, background:"linear-gradient(90deg,#3B82F6,#EF4444)", borderRadius:3 }} />
        <span style={{ fontSize:10, color:"#475569" }}>Kritik yol görevleri ({kritikYol.size} adet) — Gecikme proje bitiş tarihini etkiler</span>
      </div>
    </div>
  );
}

// ── Liste ────────────────────────────────────────────────────────────────────
function ListeGoruntum({ gorevler, onGorevTikla, baslangiclar }) {
  const gruplar = useMemo(() => {
    const g = {};
    gorevler.forEach(gv => { if (!g[gv.faz]) g[gv.faz] = []; g[gv.faz].push(gv); });
    return FAZLAR.filter(f => g[f]).map(f => ({ faz: f, gvler: g[f] }));
  }, [gorevler]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {gruplar.map(({ faz, gvler }) => (
        <div key={faz}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748B", letterSpacing:2, marginBottom:8, paddingBottom:6, borderBottom:"1px solid #1E2433" }}>
            {faz.toUpperCase()} — {gvler.length} GÖREV
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {gvler.map(g => {
              const rol = ROLLER.find(r => r.id === g.rol);
              const rkRenk = rolRenk(g.rol);
              const bs = baslangiclar[g.id] || 0;
              return (
                <div key={g.id} onClick={() => onGorevTikla(g)} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"8px 12px",
                  borderRadius:8, cursor:"pointer", borderLeft:`3px solid ${rkRenk}`,
                  background:"#111827", transition:"background 0.15s"
                }}
                  onMouseEnter={e=>e.currentTarget.style.background="#161B26"}
                  onMouseLeave={e=>e.currentTarget.style.background="#111827"}>
                  <span style={{ fontSize:11, color:rkRenk, fontFamily:"monospace", fontWeight:700, minWidth:80 }}>{g.id}</span>
                  <span style={{ fontSize:12, color:"#CBD5E1", flex:1 }}>{g.adi}</span>
                  <span style={{ fontSize:10, color:"#475569", minWidth:60 }}>{rol?.ikon} {rol?.adi.split("/")[0].trim()}</span>
                  <span style={{ fontSize:10, color:"#475569", minWidth:40 }}>{g.gun}g / G{bs+1}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, border:`1px solid ${durumRenk(g.durum)}44`, color:durumRenk(g.durum), minWidth:90, textAlign:"center" }}>{g.durum}</span>
                  {g.tamamlanma > 0 && (
                    <div style={{ width:60, height:4, background:"#1E2433", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${g.tamamlanma}%`, background:rkRenk, borderRadius:2 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Görev Detay Paneli ───────────────────────────────────────────────────────
function GorevDetay({ gorev, tumGorevler, onKapat, onGuncelle, baslangiclar }) {
  const r = rolRenk(gorev.rol);
  const rol = ROLLER.find(x => x.id === gorev.rol);
  const bs = baslangiclar[gorev.id] || 0;
  const bsBitis = bs + gorev.gun;

  const baslangicTarihi = new Date(BASLANGIC_TARIHI);
  baslangicTarihi.setDate(baslangicTarihi.getDate() + bs);
  const bitisTarihi = new Date(BASLANGIC_TARIHI);
  bitisTarihi.setDate(bitisTarihi.getDate() + bsBitis);
  const fmtTarih = d => d.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"});

  const onkGorevler = gorev.onk.map(id => tumGorevler.find(g => g.id === id)).filter(Boolean);

  return (
    <div style={{
      position:"fixed", right:0, top:0, bottom:0, width:360, background:"#0D1117",
      borderLeft:"1px solid #1E2433", padding:0, overflowY:"auto", zIndex:50,
      boxShadow:"-10px 0 40px #00000088"
    }}>
      {/* Başlık */}
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #1E2433", position:"sticky", top:0, background:"#0D1117" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <span style={{ fontSize:10, color:r, fontFamily:"monospace", fontWeight:700 }}>{gorev.id}</span>
            <div style={{ fontSize:14, fontWeight:700, color:"#E2E8F0", marginTop:4, lineHeight:1.4 }}>{gorev.adi}</div>
          </div>
          <button onClick={onKapat} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:18, padding:4 }}>✕</button>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <span style={{ fontSize:10, color:r, background:`${r}22`, borderRadius:4, padding:"2px 8px" }}>{rol?.ikon} {rol?.adi}</span>
          <span style={{ fontSize:10, color:"#64748B", background:"#1E2433", borderRadius:4, padding:"2px 8px" }}>{gorev.faz}</span>
        </div>
      </div>

      <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:16 }}>
        {/* Zaman bilgisi */}
        <div style={{ background:"#111827", borderRadius:8, padding:12, border:"1px solid #1E2433" }}>
          <div style={{ fontSize:10, color:"#475569", fontWeight:700, marginBottom:8 }}>ZAMAN</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              ["Başlangıç", `Gün ${bs+1} (${fmtTarih(baslangicTarihi)})`],
              ["Bitiş", `Gün ${bsBitis} (${fmtTarih(bitisTarihi)})`],
              ["Süre", `${gorev.gun} gün`],
              ["Teslim", gorev.teslim],
            ].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize:9, color:"#475569" }}>{k}</div>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Durum güncelleme */}
        <div>
          <div style={{ fontSize:10, color:"#475569", fontWeight:700, marginBottom:8 }}>DURUM</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {DURUMLAR.map(d => (
              <button key={d.id} onClick={() => onGuncelle(gorev.id,"durum",d.id)} style={{
                padding:"4px 12px", borderRadius:20, border:`1px solid ${gorev.durum===d.id ? d.renk : "#1E2433"}`,
                background: gorev.durum===d.id ? `${d.renk}22` : "transparent",
                color: gorev.durum===d.id ? d.renk : "#64748B", cursor:"pointer", fontSize:11, fontWeight:600
              }}>{d.id}</button>
            ))}
          </div>
        </div>

        {/* Tamamlanma */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:10, color:"#475569", fontWeight:700 }}>TAMAMLANMA</div>
            <div style={{ fontSize:11, color:r, fontWeight:700 }}>{gorev.tamamlanma}%</div>
          </div>
          <input type="range" min={0} max={100} step={5} value={gorev.tamamlanma}
            onChange={e => onGuncelle(gorev.id,"tamamlanma",+e.target.value)}
            style={{ width:"100%", accentColor:r }} />
          <div style={{ height:6, background:"#1E2433", borderRadius:3, marginTop:6 }}>
            <div style={{ height:"100%", width:`${gorev.tamamlanma}%`, background:`linear-gradient(90deg,${r},${r}88)`, borderRadius:3, transition:"width 0.3s" }} />
          </div>
        </div>

        {/* Not */}
        <div>
          <div style={{ fontSize:10, color:"#475569", fontWeight:700, marginBottom:8 }}>NOT / ENGEL</div>
          <textarea value={gorev.not} onChange={e => onGuncelle(gorev.id,"not",e.target.value)}
            placeholder="Görev notu veya engel açıklaması..." rows={3} style={{
              width:"100%", background:"#111827", border:"1px solid #1E2433",
              color:"#94A3B8", borderRadius:8, padding:10, fontSize:12, resize:"vertical",
              outline:"none", fontFamily:"inherit", boxSizing:"border-box"
            }} />
        </div>

        {/* Önkoşullar */}
        {onkGorevler.length > 0 && (
          <div>
            <div style={{ fontSize:10, color:"#475569", fontWeight:700, marginBottom:8 }}>ÖNKOŞULlar</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {onkGorevler.map(og => {
                const ork = rolRenk(og.rol);
                const tamam = og.durum === "Tamamlandı";
                return (
                  <div key={og.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
                    background:"#111827", borderRadius:8, border:`1px solid ${tamam?"#10B98133":"#1E2433"}` }}>
                    <span style={{ fontSize:14 }}>{tamam ? "✅" : "⏳"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, color:ork, fontFamily:"monospace" }}>{og.id}</div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>{og.adi}</div>
                    </div>
                    <span style={{ fontSize:9, color:durumRenk(og.durum) }}>{og.durum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

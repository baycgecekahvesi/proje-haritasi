"""
Gerçekçi teknik döküman ve teknik şartname örnek verisi oluşturur.
Kullanım:
    python manage.py seed_docs
    python manage.py seed_docs --reset
"""
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.documents.models import TechnicalDocument, TechnicalSpec


# ---------------------------------------------------------------------------
# Teknik Döküman içerikleri (.txt olarak kaydedilir)
# ---------------------------------------------------------------------------
TECH_DOCS = [
    {
        "title": "Fanuc R-2000iC Robot Teknik Özellikleri ve Bakım Kılavuzu",
        "category": "robot",
        "description": "Fanuc R-2000iC serisinin teknik parametreleri, bakım periyotları ve arıza giderme prosedürleri.",
        "filename": "fanuc_r2000ic_bakim_kilavuzu.txt",
        "content": """\
FANUC R-2000iC SERİSİ - TEKNİK ÖZELLİKLER VE BAKIM KILAVUZU
Versiyon: 3.2 | Tarih: 2025-09

══════════════════════════════════════════════════
1. TEKNİK ÖZELLİKLER
══════════════════════════════════════════════════

Model           : Fanuc R-2000iC/210F
Eksen Sayısı    : 6 (J1-J6)
Taşıma Kapasitesi: 210 kg
Ulaşım Mesafesi : 2655 mm
Tekrar Hassasiyeti: ±0.05 mm
Ağırlık (robot kolu): 1130 kg
Kontrol Ünitesi : R-30iB Plus
Montaj           : Zemine / Tavana / Duvara

Eksen Hareket Aralıkları:
  J1: ±185°  (200°/s)
  J2: -70° / +85°  (175°/s)
  J3: -280° / +70°  (180°/s)
  J4: ±360°  (400°/s)
  J5: ±130°  (400°/s)
  J6: ±360°  (600°/s)

IP Sınıfı (Bilek): IP67
Çevre Sıcaklığı : 0°C - 45°C

══════════════════════════════════════════════════
2. GÜVENLİK GEREKSİNİMLERİ
══════════════════════════════════════════════════

- ISO 10218-1:2011 standardına uygun güvenlik kategorisi 3, PL=d
- Güvenlik kafesi minimum 1200 mm yüksekliğinde olmalıdır
- Acil durdurma butonları: Kontrol panosu + Öğretme kutusu + Çevre güvenlik çitleri
- Güvenlik kilitleme: Kapı açıkken robot otomatik durur (ESTOP devresi)
- Minimum güvenlik mesafesi: Maksimum hızdaki robot için EN ISO 13855 hesabı yapılmalı

══════════════════════════════════════════════════
3. BAKIM PERİYOTLARI
══════════════════════════════════════════════════

3.1 Günlük Kontroller
  □ Yağ kaçağı kontrolü (bilek ve redüktörler)
  □ Hava basıncı (varsa pnömatik sistem): 0.5-0.7 MPa
  □ Kablo hasarı görsel kontrolü
  □ Acil durdurma testi

3.2 3 Aylık Bakım
  □ J1-J6 redüktör yağ seviyesi kontrolü
  □ Tüm bağlantı noktaları sıkılık kontrolü (moment anahtarı ile)
  □ Bilek yağlama (Fanuc A98L-0040-0174 gres)
  □ Öğretme kutusu kablo bütünlüğü

3.3 Yıllık Bakım
  □ Redüktör yağ değişimi (Fanuc A98L-0040-0174)
    - J1: 1.5 L
    - J2: 1.0 L
    - J3: 0.85 L
    - J4-J5-J6: 0.3 L her biri
  □ Pil değişimi (SRAM backup): Lithium 3V CR14250SE
  □ Fan filtresi temizliği (kontrol panosu)
  □ Termal kamera ile ısınma noktaları kontrolü

══════════════════════════════════════════════════
4. ARIZA GİDERME
══════════════════════════════════════════════════

SRVO-001 Operator panel E-stop: Acil durdurma butonu aktif → Kontrol et ve reset
SRVO-002 Teach pendant E-stop: TP acil durdurma aktif → TP bağlantısını kontrol et
SRVO-023 Stop error: Hareket sırasında servo hatası → Parametreleri kontrol et
SRVO-038 Pulse not established: Enkoder haberleşme hatası → Kablo ve konnektör kontrol
INTP-101 Memory overflow: Program belleği dolu → Gereksiz programları sil
PRIO-001 Fence open: Güvenlik kapısı açık → Kapıyı kapat ve reset

══════════════════════════════════════════════════
5. YEDEK PARÇA LİSTESİ (ÖNERİLEN STOK)
══════════════════════════════════════════════════

Parça No         | Açıklama                      | Adet
A06B-6114-H303   | Servo amplifikatür J1-J2-J3   | 1
A06B-6114-H103   | Servo amplifikatür J4-J5-J6   | 1
A98L-0031-0012   | SRAM pil modülü               | 2
A660-2005-T505   | TP bağlantı kablosu (10m)     | 1
A06B-0373-B577   | J1 servo motor                | 1
A97L-0218-0558   | Yedek sigorta seti            | 1
""",
    },
    {
        "title": "Siemens S7-1500 PLC Konfigürasyon ve Programlama Rehberi",
        "category": "plc_scada",
        "description": "S7-1500 CPU seçim kriterleri, TIA Portal konfigürasyonu, Profinet haberleşme ve güvenli programlama pratikleri.",
        "filename": "siemens_s71500_programlama_rehberi.txt",
        "content": """\
SİEMENS S7-1500 PLC - KONFİGÜRASYON VE PROGRAMLAMA REHBERİ
TIA Portal V18 | IEC 61131-3 Uyumlu
Versiyon: 2.1 | Tarih: 2025-06

══════════════════════════════════════════════════
1. CPU SEÇİM KRİTERLERİ
══════════════════════════════════════════════════

Model         | İşlem Süresi | Bellek  | Özellikler
CPU 1511-1 PN | 60 ns/talimat | 150 KB | Standart, Profinet 1x
CPU 1513-1 PN | 40 ns/talimat | 300 KB | Orta ölçek, 3 PN arayüz
CPU 1515-2 PN | 30 ns/talimat | 500 KB | Büyük ölçek, Motion Control
CPU 1516-3 PN | 10 ns/talimat | 1 MB   | Yüksek performans, IRT
CPU 1518-4 PN | 1 ns/talimat  | 4 MB   | Maksimum performans, OPC UA

Seçim Kriterleri:
- I/O nokta sayısı: <500 → CPU 1511, 500-2000 → CPU 1513/1515
- Cycle time gereksinimi: <1ms → CPU 1516+
- Motion Control: CPU 1515T veya üzeri
- Fonksiyonel güvenlik (SIL 3): CPU 1516F / 1517F

══════════════════════════════════════════════════
2. DONANIM YAPILANDIRMASI (TIA PORTAL)
══════════════════════════════════════════════════

2.1 Raf Düzeni (Önerilen)
  Slot 0: Güç modülü (PS 60W 24VDC)
  Slot 1: CPU (1515-2 PN)
  Slot 2: Sinyal modülü DI 32x24VDC (6ES7521-1BL00-0AB0)
  Slot 3: Sinyal modülü DO 32x24VDC/0.5A (6ES7522-1BL01-0AB0)
  Slot 4: Sinyal modülü AI 8x U/I/RTD (6ES7531-7KF00-0AB0)
  Slot 5: Sinyal modülü AO 4x U/I (6ES7532-5HD00-0AB0)
  Slot 6: Teknoloji modülü TM PTO 4 (Step/Direction)

2.2 Profinet Ağ Yapısı
  - CPU Profinet arayüzü: 192.168.1.10/24 (OT ağı)
  - ET200SP dağıtık I/O: 192.168.1.20-50
  - HMI (TP1200 Comfort): 192.168.1.100
  - PC Station (SCADA/MES): 192.168.1.200

══════════════════════════════════════════════════
3. PROGRAMLAMA STANDARTLARİ
══════════════════════════════════════════════════

3.1 Program Blokları
  OB1  - Ana döngü (Main) - Cycle time: 10ms
  OB35 - Döngüsel kesme - 100ms (PID döngüleri)
  OB82 - Teşhis kesmesi (I/O arızaları)
  OB86 - Rack arızası
  FC1  - Motorlar (genel motor kontrol FB)
  FC2  - Valf kontrol (genel valf FB)
  FB10 - PID kontrol (PID_Compact)
  DB1  - Üretim verileri global DB
  DB2  - Alarm ve hata yönetimi DB

3.2 Değişken İsimlendirme Kuralları
  - Girişler : I_[Tanım]_[Numara]  → I_MotorCalisma_01
  - Çıkışlar : O_[Tanım]_[Numara]  → O_ValfAc_03
  - Bellek   : M_[Tanım]           → M_HattaCalisma
  - DB Tag   : DB[X].[Tanım]       → DB1.UretimSayaci

3.3 IEC 61131-3 Dil Seçimi
  - LAD (Ladder): Standart motor/valf kontrol
  - FBD (Function Block): PID ve sinyal işleme
  - SCL (Structured Text): Hesaplamalar, veri işleme
  - GRAPH: Sıralı adım kontrolü (Step Sequence)

══════════════════════════════════════════════════
4. OPC-UA SUNUCU KONFİGÜRASYONU
══════════════════════════════════════════════════

S7-1500 dahili OPC-UA sunucu aktifleştirme:
1. TIA Portal → PLC Özellikleri → OPC UA → Sunucu aktif
2. Port: 4840 (varsayılan)
3. Güvenlik politikası: Basic256Sha256 (minimum)
4. Kullanıcı yetkilendirme: Kullanıcı adı + şifre

MES/SCADA bağlantısı için:
  opc.tcp://192.168.1.10:4840
  Namespace: urn:Siemens:S7-1500:PLC_1

Erişilebilir DB taglar: DB1 → "OPC UA erişimi" işaretlenmeli
""",
    },
    {
        "title": "OEE Hesaplama Metodolojisi ve Uygulama Kılavuzu",
        "category": "mes",
        "description": "OEE (Overall Equipment Effectiveness) hesaplama formülleri, kayıp analizi, MES entegrasyonu ve iyileştirme stratejileri.",
        "filename": "oee_hesaplama_metodolojisi.txt",
        "content": """\
OEE HESAPLAMA METODOLOJİSİ VE UYGULAMA KILAVUZU
MESA-11 Standartlarına Uygun | MES Entegrasyonu
Versiyon: 1.4 | Tarih: 2025-08

══════════════════════════════════════════════════
1. OEE NEDİR?
══════════════════════════════════════════════════

OEE (Overall Equipment Effectiveness - Toplam Ekipman Etkinliği),
üretim ekipmanlarının ne kadar verimli kullanıldığını ölçen evrensel
bir performans göstergesidir.

Dünya Standardı OEE Değerleri:
  OEE > %85  → Dünya sınıfı (World Class)
  OEE 60-85% → Tipik endüstri ortalaması
  OEE < %60  → İyileştirme öncelikli

══════════════════════════════════════════════════
2. OEE HESAPLAMA FORMÜLÜ
══════════════════════════════════════════════════

OEE = Kullanılabilirlik × Performans × Kalite

2.1 Kullanılabilirlik (Availability)
  Kullanılabilirlik = Çalışma Süresi / Planlanan Üretim Süresi

  Çalışma Süresi = Planlanan Üretim Süresi - Duruş Süreleri
  Duruş Nedenleri: Arıza, ayar, malzeme eksikliği, operatör yokluğu

  Örnek:
  Planlanan süre = 480 dk (1 vardiya)
  Toplam duruş  = 47 dk
  Çalışma süresi = 433 dk
  Kullanılabilirlik = 433/480 = %90.2

2.2 Performans (Performance)
  Performans = (Gerçek Üretim Miktarı / İdeal Üretim Miktarı) × 100

  İdeal Üretim = Çalışma Süresi / İdeal Cycle Time

  Örnek:
  İdeal cycle time = 1.0 dk/parça
  Gerçek üretim   = 390 parça
  İdeal üretim     = 433 dk / 1.0 = 433 parça
  Performans       = 390/433 = %90.1

2.3 Kalite (Quality)
  Kalite = İyi Parça Sayısı / Toplam Üretim Miktarı

  Örnek:
  Toplam üretim = 390 parça
  Hurda/fire    = 8 parça
  İyi parça     = 382 parça
  Kalite        = 382/390 = %97.9

OEE = 90.2% × 90.1% × 97.9% = %79.7

══════════════════════════════════════════════════
3. 6 BÜYÜK KAYIP ANALİZİ
══════════════════════════════════════════════════

Kullanılabilirlik Kayıpları:
  1. Ekipman Arızaları: Planlanmamış bakım durmaları
  2. Kurulum & Ayar: Ürün değişimi, takım değişimi

Performans Kayıpları:
  3. Küçük Duruşlar: <5 dk süren çevrimsel duruşlar (sensör, tıkanma)
  4. Hız Kayıpları: İdeal hızın altında çalışma

Kalite Kayıpları:
  5. Üretim Hurdaları: Başlangıç / ısınma kayıpları
  6. Kalite Hataları: Reddedilen ve yeniden işlenen parçalar

══════════════════════════════════════════════════
4. MES ENTEGRASYONU VERİ AKIŞI
══════════════════════════════════════════════════

PLC → MES OEE Modülü veri haberleşmesi:

Sinyal           | PLC Çıkışı     | MES Etiketi
Makine Çalışıyor | Q0.0 (24VDC)  | Machine.Running
Parça Sayacı     | DB1.PartCount  | Production.Count
Hurda Sayacı     | DB1.ScrapCount | Quality.Scrap
Duruş Nedeni     | DB1.StopCode  | Downtime.Reason
Cycle Time Akt.  | DB1.CycleTime  | Performance.ActCT

OPC-UA Tag Adresleri (S7-1500):
  ns=3;s="OEE_Data"."MachineRunning"
  ns=3;s="OEE_Data"."PartCount"
  ns=3;s="OEE_Data"."ScrapCount"

══════════════════════════════════════════════════
5. KPI DASHBOARD ÖNERİLEN GÖSTERGELER
══════════════════════════════════════════════════

Gerçek Zamanlı:
  - Anlık OEE (%)
  - Mevcut cycle time vs. ideal cycle time
  - Son 1 saatlik üretim sayısı
  - Aktif duruş süresi ve nedeni

Vardiya Bazlı:
  - Vardiya OEE trendi (saat bazlı grafik)
  - Duruş pareto analizi
  - Hurda/fire oranı

Aylık:
  - Makine bazlı OEE karşılaştırma
  - En kritik 3 kayıp nedeni
  - OEE iyileştirme hedefi takibi (Kaizen)
""",
    },
    {
        "title": "Endüstriyel Görüntü İşleme ve Vizyon Sistemi Tasarım Rehberi",
        "category": "vizyon",
        "description": "Kamera seçimi, aydınlatma tasarımı, görüntü işleme algoritmaları ve kalite kontrol entegrasyonu.",
        "filename": "vizyon_sistemi_tasarim_rehberi.txt",
        "content": """\
ENDÜSTRİYEL GÖRÜNTÜ İŞLEME VE VİZYON SİSTEMİ TASARIM REHBERİ
Cognex / Keyence / Omron Uyumlu
Versiyon: 2.0 | Tarih: 2025-07

══════════════════════════════════════════════════
1. KAMERA SEÇİM KRİTERLERİ
══════════════════════════════════════════════════

1.1 Çözünürlük Hesabı
  Gerekli piksel/mm = Muayene Alanı (mm) / Çözünürlük (mm)

  Örnek:
  Muayene alanı: 100mm × 80mm
  Min. ölçüm hassasiyeti: 0.1mm
  Gereken çözünürlük: 100/0.1 = 1000 piksel (yatay)
  → 1.3 MP kamera (1280×1024) yeterli

1.2 Sensör Formatı ve Piksel Boyutu
  1/3"  sensör: 4.8mm × 3.6mm  | Düşük maliyet, kompakt
  1/2"  sensör: 6.4mm × 4.8mm  | Orta performans
  2/3"  sensör: 8.8mm × 6.6mm  | Yüksek hassasiyet
  1"    sensör: 12.8mm × 9.6mm | Geniş alan, büyük lens

1.3 Önerilen Kamera Modelleri
  Uygulama        | Model              | Çözünürlük
  Genel muayene   | Cognex IS-9902M    | 5 MP
  Hızlı hat       | Keyence CV-X480F   | 8 MP
  Ölçüm hassas    | Basler acA2040     | 4 MP, GigE
  Renkli kontrol  | Cognex IS-9902C    | 5 MP Renkli

══════════════════════════════════════════════════
2. AYDINLATMA TASARIMI
══════════════════════════════════════════════════

2.1 Aydınlatma Geometrisi
  Koaksiyel (Coaxial): Yansımalı yüzeyler, baskı, etiket okuma
  Ön Aydınlatma 45°: Genel amaçlı yüzey muayenesi
  Karanlık Alan (Dark Field): Çizik, kenar, kabartma tespiti
  Arka Aydınlatma: Kontur, delik tespiti, şekil ölçüm
  Kubbe (Dome): Parlak/kıvrımlı yüzeyler, etiket okuma

2.2 Aydınlatma Renk Seçimi
  Beyaz LED : Genel amaçlı, renkli görüntüleme
  Kırmızı   : Mavi/yeşil nesneleri karartır
  Mavi/UV   : Floresan, florasan boya tespiti
  Kızılötesi: Cam/plastik nüfuz, gizli baskı

2.3 Titreşim Periyodu
  Strobe (flaş) süresi < Exposure time
  → Motion blur ortadan kalkar
  → Yüksek güç, uzun ömür

══════════════════════════════════════════════════
3. LENS HESAPLAMALARI
══════════════════════════════════════════════════

Odak Uzaklığı (f) = (Çalışma Mesafesi × Sensör Boyutu) / Görüş Alanı

Örnek:
  WD = 300 mm
  Sensör (yatay) = 6.4 mm
  FOV (yatay) = 100 mm
  f = (300 × 6.4) / 100 = 19.2 mm → 25mm lens seç

Derinlik Keskinliği (DOF):
  DOF = 2 × f-sayısı × piksel boyutu × (WD/f)²
  DOF artırmak için: f-sayısını artır (diyafram kapat) veya
                     daha küçük piksel boyutlu sensör kullan

══════════════════════════════════════════════════
4. PLC ENTEGRASYONU
══════════════════════════════════════════════════

Vizyon Sistemi ↔ PLC Haberleşme Protokolleri:
  EtherNet/IP : Allen-Bradley PLC ile
  Profinet    : Siemens PLC ile
  Modbus TCP  : Evrensel
  Dijital I/O : Pass/Fail tetikleme (En basit, en hızlı)

Tipik I/O Yapısı:
  PLC → Vizyon: Trigger (tetikleme sinyali, Q0.0)
  Vizyon → PLC: Pass (I0.0), Fail (I0.1), Ready (I0.2)
  Vizyon → PLC: Ölçüm verisi (OPC-UA veya Modbus register)

Zaman Diyagramı:
  1. PLC parça gelişini algılar (sensör)
  2. PLC vizyon sistemine trigger gönderir (<1ms)
  3. Vizyon görüntüyü alır (exposure: 1-10ms)
  4. Vizyon işleme yapar (50-200ms)
  5. Vizyon Pass/Fail sinyali gönderir
  6. PLC reddedilen parçayı ayırır

══════════════════════════════════════════════════
5. KALİBRASYON PROSEDÜRü
══════════════════════════════════════════════════

Mekanik Kalibrasyon:
  □ Kamera optik ekseninin konveyör/parçaya dik olması
  □ Kamera sabitleme (titreşim izolasyonu gerekirse)
  □ Çalışma mesafesi sabitlenmesi

Yazılım Kalibrasyonu:
  □ Piksel-mm dönüşüm faktörü (referans cetveli ile)
  □ Perspektif düzeltme (kamera eğim varsa)
  □ Aydınlatma homojenliği düzeltme (shading correction)
  □ Referans parça öğretimi (Golden Sample)

Periyodik Kontrol (Önerilir: Her vardiya başı):
  □ Kalibrasyon parçası ile otomatik doğrulama
  □ Uyarı limiti: ±2 piksel sapma
""",
    },
    {
        "title": "ISA-95 MES-ERP Entegrasyon Mimarisi ve Veri Modeli",
        "category": "mes",
        "description": "ISA-95 standardına göre MES ve ERP sistemleri arasındaki veri akışı, arayüz tanımları ve entegrasyon senaryoları.",
        "filename": "isa95_mes_erp_entegrasyon.txt",
        "content": """\
ISA-95 MES-ERP ENTEGRASYON MİMARİSİ VE VERİ MODELİ
ANSI/ISA-95 Standart Ailesi | B2MML (XML) Uyumlu
Versiyon: 1.2 | Tarih: 2025-05

══════════════════════════════════════════════════
1. ISA-95 REFERANS MİMARİSİ
══════════════════════════════════════════════════

Seviye 4 (ERP)  : SAP S/4HANA, Oracle EBS, Microsoft Dynamics
    ↕  [ISA-95 Arayüzü]
Seviye 3 (MES)  : Üretim yönetimi, kalite, izlenebilirlik
    ↕  [OPC-UA / Profinet]
Seviye 2 (SCADA): Süpervizör kontrol, HMI
    ↕  [Profinet / Modbus]
Seviye 1 (PLC)  : Gerçek zamanlı kontrol
    ↕  [Digital I/O / Analog]
Seviye 0 (Saha) : Sensör, aktüatör, motor

══════════════════════════════════════════════════
2. TEMEL VERİ NESNELERİ (ISA-95 Part 2)
══════════════════════════════════════════════════

2.1 Üretim Emri (Production Order)
ERP → MES gönderilen bilgiler:
  - WorkOrderID       : Benzersiz üretim emri no
  - ProductID         : Mamul kodu
  - PlannedQuantity   : Planlanan miktar
  - PlannedStartTime  : Planlanan başlangıç
  - PlannedEndTime    : Planlanan bitiş
  - RoutingID         : Üretim güzergahı
  - BOMRevision       : Malzeme listesi revizyonu

MES → ERP gönderilen bilgiler:
  - ActualQuantity    : Gerçek üretim miktarı
  - GoodQuantity      : Kaliteli ürün
  - ScrapQuantity     : Hurda miktarı
  - ActualStartTime   : Gerçek başlangıç
  - ActualEndTime     : Gerçek bitiş
  - OperatorID        : Üretimi yapan operatör

2.2 Malzeme İzlenebilirlik (Material Traceability)
  - LotID / SerialNo  : Parti veya seri no
  - ComponentLotID    : Kullanılan malzeme partisi
  - EquipmentID       : Üretim yapan makine
  - ProcessParameters : Kritik proses parametreleri

══════════════════════════════════════════════════
3. ENTEGRASYON SENARYOLARI
══════════════════════════════════════════════════

Senaryo 1: Üretim Emri Aktarımı (ERP → MES)
  Tetikleyici  : SAP PP modülünde üretim emri serbest bırakma
  Yöntem       : REST API / RFC / IDocs
  Frekans      : Anlık (push) veya 5 dakika polling
  Format       : JSON / B2MML XML
  Hata yönetimi: Kuyruklama + retry (3 deneme, 1 saat bekle)

Senaryo 2: Üretim Bildirimi (MES → ERP)
  Tetikleyici  : MES'te üretim emri kapatma
  Yöntem       : REST API (POST)
  Frekans      : Anlık (vardiya/iş emri bitişinde)
  İçerik       : Gerçek miktar, hurda, saat, malzeme tüketimi

Senaryo 3: Kalite Bildirimi (MES → ERP)
  Tetikleyici  : QM kontrolü sonucu
  Yöntem       : REST API
  İçerik       : Kontrol parti, sonuç (kabul/red), ölçüm değerleri
  ERP etkisi   : Otomatik kalite kontrol partisi (QM01)

══════════════════════════════════════════════════
4. TEKNİK ENTEGRASYON MİMARİSİ
══════════════════════════════════════════════════

Önerilen Middleware: ESB (Enterprise Service Bus) veya API Gateway

ERP (SAP) ←→ [API Gateway / MQ] ←→ MES

Haberleşme Güvenliği:
  - TLS 1.3 şifrelemesi (tüm API çağrıları)
  - OAuth 2.0 / API Key kimlik doğrulama
  - IP beyaz listesi (OT/IT firewall)
  - Mesaj imzalama (HMAC-SHA256)

Performans Hedefleri:
  - API yanıt süresi < 500ms (p95)
  - Üretim emri aktarım gecikmesi < 30 saniye
  - Sistem erişilebilirliği > %99.5 (production hours)
  - Veri kaybı: Sıfır tolerans (kuyruk + onay mekanizması)

══════════════════════════════════════════════════
5. TEST SENARYOLARI (SAT)
══════════════════════════════════════════════════

TC-001: SAP'tan üretim emri gönder → MES'te görünür mü?
TC-002: MES'te üretim başlat → SAP'ta durum güncellendi mi?
TC-003: MES'te üretim kapat → SAP'ta miktar onaylandı mı?
TC-004: Ağ kesintisi simülasyonu → Kuyruk çalışıyor mu?
TC-005: Hatalı veri gönder → Hata yönetimi doğru mu?
TC-006: 1000 eş zamanlı üretim emri → Performans kabul edilebilir mi?
TC-007: Malzeme lot takibi → Uçtan uca izlenebilirlik doğru mu?
""",
    },
    {
        "title": "Servo Motor ve Sürücü Seçim Kriterleri",
        "category": "servo",
        "description": "AC servo motor tork/hız hesabı, sürücü seçimi, haberleşme protokolleri ve devreye alma prosedürü.",
        "filename": "servo_motor_secim_kriterleri.txt",
        "content": """\
SERVO MOTOR VE SÜRÜCÜ SEÇİM KRİTERLERİ
IEC 60034 Uyumlu | EtherCAT/Profinet Haberleşme
Versiyon: 1.5 | Tarih: 2025-09

══════════════════════════════════════════════════
1. TORK HESABI
══════════════════════════════════════════════════

Toplam gerekli tork:
  T_toplam = T_ivme + T_sürtünme + T_yük

1.1 İvme Torku
  T_ivme = J_toplam × α
  J_toplam = J_motor + J_yük (motora yansıtılmış)
  α = (ω_maks - ω_0) / t_ivme  [rad/s²]

  Yük ataletinin motora yansıtılması:
  J_yük_yansıtılmış = J_yük / i²  (i = dişli oranı)

  Kural: J_yük_yansıtılmış ≤ 3 × J_motor (enerji verimliliği)
         J_yük_yansıtılmış ≤ 10 × J_motor (maksimum)

1.2 Doğrusal Hareket Yük Torku
  Yük kütlesi (m) → Motor şaftına:
  J_lineer = m × (p/2π)²  [p = vida adımı, m]

  Örnek: m=50kg, vida adımı=10mm, dişli=1:1
  J_lineer = 50 × (0.01/2π)² = 1.27×10⁻⁴ kg·m²

══════════════════════════════════════════════════
2. MOTOR SEÇİM TABLOSU
══════════════════════════════════════════════════

Marka     | Model           | Güç  | Tork  | Hız    | Enkoder
Siemens   | 1FK7063-2AF71   | 2kW  | 12Nm  | 3000rpm | 22bit abs
Siemens   | 1FK7083-2AF71   | 4kW  | 25Nm  | 2000rpm | 22bit abs
Fanuc     | αiF 4/5000      | 4kW  | 22Nm  | 5000rpm | Serial abs
Yaskawa   | SGMGV-30ADA61   | 3kW  | 18Nm  | 2000rpm | 20bit abs
Bosch Rex | MSK061C-0600    | 3kW  | 16Nm  | 6000rpm | EnDat 2.2
Mitsubishi| HG-SR352        | 3.5kW| 22Nm  | 3000rpm | 26bit abs

Seçim Kriteri:
  - Sürekli çalışma noktası: T-n eğrisinin S1 bölgesinde
  - Pik tork ihtiyacı: Motor pik torkun %80'i aşılmamalı
  - Termal: Servo sürücünün I²t hesabı yapılmalı

══════════════════════════════════════════════════
3. SÜRÜCÜ - MOTOR EŞLEŞMESİ
══════════════════════════════════════════════════

Siemens SINAMICS S210 Eşleşme Tablosu:
  1FK7022 → S210 0.5A  (6SL3210-5HB10-2UF0)
  1FK7032 → S210 1A    (6SL3210-5HB10-4UF0)
  1FK7042 → S210 3A    (6SL3210-5HB11-0UF0)
  1FK7063 → S210 5A    (6SL3210-5HB12-5UF0)
  1FK7083 → S210 9A    (6SL3210-5HB13-2UF0)

Haberleşme Seçimi:
  DRIVE-CLiQ  : Siemens dahili (otomatik parametre)
  EtherCAT    : Yüksek hızlı senkron kontrol (<125μs)
  Profinet IRT: Siemens ekosistemi, ≤250μs
  EtherNet/IP : Rockwell ekosistemi

══════════════════════════════════════════════════
4. DEVREYE ALMA PROSEDÜRü
══════════════════════════════════════════════════

Adım 1: Mekanik Kontrol
  □ Motor ve yük bağlantısı (kaplin hizalaması <0.05mm)
  □ Kablo bağlantıları (güç + enkoder + fren)
  □ Güvenlik devreleri (STO, SBC fonksiyonları)

Adım 2: Parametre Ayarı
  □ Motor kodunu gir (otomatik motor tanıma)
  □ Enkoder tipi ayarı
  □ Limit switch ve yazılımsal sınırlar
  □ Referans alımı (homing) prosedürü

Adım 3: Oto-tuning
  □ Atalet ölçümü (inertia identification)
  □ Hız regülatörü kazanç ayarı
  □ Pozisyon kazancı (Kp) ayarı
  □ Titre/rezonans testi (Bode analizi)

Adım 4: Performans Doğrulama
  □ Adım yanıt testi (step response)
  □ Tekrar konumlanma hassasiyeti (±2 enkoder adımı)
  □ Maksimum hız ve ivme testi
  □ Termal test (2 saat nominal yükte)
""",
    },
    {
        "title": "FAT/SAT Test Protokolü Şablonu - Endüstriyel Otomasyon",
        "category": "genel",
        "description": "Fabrika Kabul Testi (FAT) ve Saha Kabul Testi (SAT) için standart test protokolü şablonu ve checklist.",
        "filename": "fat_sat_test_protokolu.txt",
        "content": """\
FAT/SAT TEST PROTOKOLÜ ŞABLONU
ENDÜSTRİYEL OTOMASYON SİSTEMLERİ
Rev: 1.0 | Tarih: ________________
Proje: __________________ | Müşteri: __________________

══════════════════════════════════════════════════
A. FAT (FACTORY ACCEPTANCE TEST - FABRİKA KABUL TESTİ)
══════════════════════════════════════════════════

FAT Tarihi    : ____________________
FAT Yeri      : ____________________
Katılımcılar  :
  Tedarikçi   : ____________________
  Müşteri     : ____________________

A1. DONANIM KONTROLLERİ
┌─────────────────────────────────────────────────┬────────┬────────┐
│ Kontrol Kalemi                                   │ Sonuç  │ Notlar │
├─────────────────────────────────────────────────┼────────┼────────┤
│ Pano mekanik kontrol (hasar, temizlik, kablolama)│ □ OK   │        │
│ Güç bileşenleri doğrulama (sigorta, kesici)     │ □ OK   │        │
│ PLC CPU ve modüller (firmware versiyonu)         │ □ OK   │        │
│ HMI ekran boyutu ve çözünürlük                  │ □ OK   │        │
│ UPS kapasitesi ve test                          │ □ OK   │        │
│ İletişim portları (Profinet, OPC-UA)            │ □ OK   │        │
│ IP sınıfı doğrulama (pano etiketi)              │ □ OK   │        │
│ CE uygunluk belgesi                             │ □ OK   │        │
└─────────────────────────────────────────────────┴────────┴────────┘

A2. FONKSİYONEL TESTLER
┌─────────────────────────────────────────────────┬────────┬────────┐
│ Test Senaryosu                                  │ Sonuç  │ Notlar │
├─────────────────────────────────────────────────┼────────┼────────┤
│ Açma/kapama sekansı (normal start/stop)         │ □ OK   │        │
│ Acil durdurma (ESTOP) tüm noktalarda            │ □ OK   │        │
│ Güvenlik kilitlemeleri (kapı, ışık perdesi)     │ □ OK   │        │
│ Manuel mod operasyonu                           │ □ OK   │        │
│ Otomatik mod operasyonu                         │ □ OK   │        │
│ Alarm ve hata yönetimi                          │ □ OK   │        │
│ HMI ekran sayfaları ve navigasyon               │ □ OK   │        │
│ Tarih/saat senkronizasyonu                     │ □ OK   │        │
│ Kullanıcı yetkilendirme seviyeleri              │ □ OK   │        │
│ Veri kayıt ve raporlama                        │ □ OK   │        │
└─────────────────────────────────────────────────┴────────┴────────┘

A3. PERFORMANS TESTLERİ
  □ Cycle time ölçümü: Hedef ____ms, Ölçülen ____ms
  □ Pozisyon hassasiyeti: Hedef ±____mm, Ölçülen ±____mm
  □ Haberleşme gecikme süresi: Hedef <____ms, Ölçülen ____ms
  □ 4 saat kesintisiz çalışma testi: □ Başarılı

FAT Sonucu: □ KABUL  □ KOŞULLU KABUL  □ RED
Koşullar (varsa): _______________________________________________
Müşteri imzası: _________________ Tarih: _______________________

══════════════════════════════════════════════════
B. SAT (SITE ACCEPTANCE TEST - SAHA KABUL TESTİ)
══════════════════════════════════════════════════

SAT Tarihi    : ____________________
SAT Yeri (Fabrika): _________________
Katılımcılar  :
  Tedarikçi   : ____________________
  Müşteri     : ____________________

B1. KURULUM KONTROLLERİ
  □ Mekanik montaj (zemin bağlantısı, hizalama)
  □ Elektrik bağlantıları (topraklama dahil)
  □ Haberleşme kabloları (Profinet, OPC-UA)
  □ Güç kalitesi ölçümü (gerilim, harmonik)
  □ Çevre koşulları (sıcaklık, nem, toz)

B2. DEVREYEALma TESTLERİ
  □ Güç açma sekansı (ilk açma)
  □ Tüm I/O nokta testi (loop test)
  □ Haberleşme (PLC ↔ SCADA ↔ MES) testi
  □ Güvenlik fonksiyonları saha testi
  □ Operatör eğitimi tamamlandı

B3. ÜRETİM DOĞRULAMA
  □ Örnek üretim koşuşu: ______ parça, ______ saat
  □ OEE ölçümü (hedef >%80): Ölçülen %______
  □ Kalite oranı (hedef >%99): Ölçülen %______
  □ Alarm yönetimi (yanlış alarm <5/vardiya): Ölçülen ____

SAT Sonucu: □ KABUL  □ KOŞULLU KABUL  □ RED
Garanti Başlangıç Tarihi: ___________________________________
Müşteri imzası: _________________ Tarih: _______________________
""",
    },
    {
        "title": "Profinet Ağ Tasarımı ve Sorun Giderme Kılavuzu",
        "category": "plc_scada",
        "description": "Profinet ağ topolojisi, IRT/RT konfigürasyonu, ağ analizi araçları ve yaygın sorunların giderilmesi.",
        "filename": "profinet_ag_tasarimi.txt",
        "content": """\
PROFINET AĞ TASARIMI VE SORUN GİDERME KILAVUZU
IEC 61158 / IEC 61784 Uyumlu
Versiyon: 1.3 | Tarih: 2025-04

══════════════════════════════════════════════════
1. PROFINET PERFORMANS SINIFLARI
══════════════════════════════════════════════════

Sınıf       | Güncelleme Süresi | Jitter   | Uygulama
RT (IRT→RT) | 1-512ms          | <1ms     | Standart I/O
IRT          | 31.25μs - 4ms    | <1μs     | Servo/CNC Motion
TCP/IP       | >100ms           | Sınırsız | Konfigürasyon/Data

══════════════════════════════════════════════════
2. AĞ TOPOLOJİSİ TASARIMI
══════════════════════════════════════════════════

2.1 Yıldız Topoloji (Önerilen)
  Avantaj: Tek cihaz arızası ağı etkilemez
  Dezavantaj: Daha fazla switch portu gerekir

  PLC (Controller)
      │
   [Managed Switch - Catalyst/Scalance]
   ├── ET200SP No.1 (192.168.1.20)
   ├── ET200SP No.2 (192.168.1.21)
   ├── Robot Controller (192.168.1.30)
   ├── Servo Sürücü No.1 (192.168.1.40)
   ├── HMI Panel (192.168.1.100)
   └── Vision System (192.168.1.110)

2.2 Halka Topoloji (Media Redundancy Protocol - MRP)
  Arıza toleransı: Kablo kopması durumunda <200ms geçiş
  Siemens SCALANCE X208 switch gerekir (MRM - Media Redundancy Manager)

3. IP ADRESLEME ŞEMASI
  Ağ     : 192.168.1.0/24
  PLC    : 192.168.1.10
  Switch : 192.168.1.1  (yönetim)
  I/O    : 192.168.1.20-99
  HMI    : 192.168.1.100-149
  SCADA  : 192.168.1.200-220
  Geçit yolu: 192.168.1.254 (IT/OT firewall)

══════════════════════════════════════════════════
4. YAKIN SORUNLAR VE ÇÖZÜMLER
══════════════════════════════════════════════════

Sorun: "Station failure - device not reachable"
  Neden 1: IP adresi çakışması → Ağ tarama aracıyla kontrol
  Neden 2: Kablo hasarı → TDR testi veya fiziksel kontrol
  Neden 3: Cihaz firmware uyumsuzluğu → Firmware güncelle
  Çözüm: TIA Portal → Diagnostics → Module Status

Sorun: "Profinet cycle time aşımı" (jitter)
  Neden 1: Unmanaged switch kullanımı → Managed switch koy
  Neden 2: Çok fazla ağ yükü → Ağı segmentle (VLAN)
  Neden 3: Ağ döngüsü (loop) → STP/RSTP kontrol et
  Çözüm: Wireshark + PRONETA ile trafik analizi

Sorun: "Sporadic communication errors"
  Neden 1: EMI/EMC sorunu (motor kabloları yakınlığı)
  Neden 2: Topraklama hatası → Ekranlı kablo + toprak
  Neden 3: Kablo uzunluğu aşımı → Cat5e max 100m
  Çözüm: Fiber optik segmentlere ayır (>100m için)

══════════════════════════════════════════════════
5. TANI ARAÇLARI
══════════════════════════════════════════════════

Siemens PRONETA:
  - Profinet ağını tarar (tüm cihazları bulur)
  - IP adresi çakışması tespiti
  - Cihaz firmware versiyonu kontrolü
  - Ücretsiz indirilebilir

Wireshark + PROFINET Eklentisi:
  - Paket seviyesi analiz
  - Cycle time ve jitter ölçümü
  - Hata paketlerinin filtrelenmesi
  Filter: eth.type == 0x8892 (Profinet RT paketleri)

TIA Portal Diagnostics:
  Online & Diagnostics → Module Status
  → I/O cihaz durumu, bağlantı kalitesi
  → Arıza buffer (son 64 hata kaydı)
""",
    },
    {
        "title": "Elektrik Pano Tasarım Standartları ve Bileşen Seçimi",
        "category": "elektrik",
        "description": "IEC 61439 uyumlu pano tasarımı, bileşen seçim kriterleri, kısa devre hesabı ve topraklama standartları.",
        "filename": "elektrik_pano_tasarim_standartlari.txt",
        "content": """\
ELEKTRİK PANO TASARIM STANDARTLARI VE BİLEŞEN SEÇİMİ
IEC 61439-1/2 | IEC 60204-1 | TS EN 60529 (IP)
Versiyon: 2.2 | Tarih: 2025-03

══════════════════════════════════════════════════
1. PANO SINIFLANDIRMASI (IEC 61439)
══════════════════════════════════════════════════

Tip           | Tanım                          | Uygulama
PTTA          | Kısmen test edilmiş            | Endüstriyel
TPTT          | Tamamen test edilmiş           | Enerji dağıtım
Sütun pano    | Açık raf, erişim önlü          | MCC / MDB
Duvar tipi    | Kapalı, zemin üstü             | Makine panosu
Dağıtım kutusu: Küçük alan, DIN ray            | PLC/kontrol

IP Derecesi Seçimi:
  IP20: Kapalı, temiz ortam (ofis)
  IP54: Endüstriyel, toz korumalı (üretim)
  IP65: Toz + su jeti korumalı (gıda/ilaç)
  IP67: Su altı kısa süreli korumalı (yıkama)
  IP69K: Basınçlı su/buhar (ağır yıkama)

══════════════════════════════════════════════════
2. BARA SİSTEMİ HESABI
══════════════════════════════════════════════════

2.1 Nominal Akım Hesabı
  I_nominal = P_toplam / (√3 × V × cos φ)
  Derating faktörü uygula: %80 (güvenlik payı)
  I_bara = I_nominal / 0.80

  Örnek: P = 150kW, V = 400V, cos φ = 0.85
  I = 150000 / (1.732 × 400 × 0.85) = 255 A
  I_bara = 255 / 0.80 = 319 A → 400A bara seç

2.2 Kısa Devre Akımı (Icc)
  Şebeke Icc değeri elektrik dağıtım şirketinden alınır.
  Tipik değerler:
    OG (10kV): 10-25 kA
    AG (400V enerji nakil hattı): 10-16 kA
    AG (trafoya yakın): 25-50 kA

  Tüm bileşenler Icc değerinin üzerinde kısa devre dayanım
  kapasitesine sahip olmalı (kesiçiler, sigorta, baralar)

══════════════════════════════════════════════════
3. KOMPONENTSEÇİM KRİTERLERİ
══════════════════════════════════════════════════

3.1 Güç Kesici (MCCB/MCB)
  □ Nominal akım ≥ hesaplanan akım
  □ Kısa devre kırma kapasitesi ≥ Icc
  □ Seçicilik (coordination) ana-kol arasında
  Önerilen: Schneider Compact NSX, Siemens 3VA, ABB Tmax

3.2 Kontaktör Seçimi (IEC 60947-4-1)
  AC-3 kullanım kategorisi (endüksiyonlu motor)
  Kontaktör nominal akımı ≥ Motor nominal akımı × 1.15
  Yardımcı kontak ihtiyacı: Kilitleme ve sinyal için

3.3 Motor Koruma Rölesi (Termik)
  Ayar aralığı: Motor I_nom × 0.9 - 1.1 arası
  Faz dengesizliği koruması: >%10 fark → trip
  Termistör girişi (≥45°C motorlar için)

3.4 24VDC Güç Kaynağı
  Toplam DC yükü hesapla + %20 reserve
  Siemens SITOP PSU 24V / Phoenix Contact TRIO / ABB CP-E
  UPS gereksinimi: PLC ve güvenlik devreleri için min 30 dk

══════════════════════════════════════════════════
4. TOPRAKLAMA VE BONDING
══════════════════════════════════════════════════

IEC 60204-1 Gereksinimi:
  - Pano gövdesi topraklama: ≤4Ω (ölçüm gerekli)
  - PE (Koruyucu Toprak) kesiti: Faz kesiti ile eşit (≤16mm²)
  - Toprak barası: En az faz barası kesitinde

EMC Topraklama (Gürültü azaltma):
  □ 360° ekranlı kablo sıkıştırmaları (kablo girişlerinde)
  □ Dijital ve güç kablolarının ayrı kanallardan geçirilmesi
  □ Toprak düzlemli DIN ray (gümüş kaplama)
  □ Filtre kapasitörleri (24VDC + ve - arasında)

══════════════════════════════════════════════════
5. PANO KABELLEMESİ STANDARTLARİ
══════════════════════════════════════════════════

Renk Kodlaması (IEC 60446):
  Faz L1: Siyah / Kahverengi
  Faz L2: Siyah / Siyah
  Faz L3: Siyah / Gri
  Nötr N : Mavi
  PE      : Sarı-Yeşil
  DC+ 24V : Kırmızı
  DC- 0V  : Mavi (veya siyah)

Kablo Kesit Seçimi:
  Güç kablosu: ≥0.75mm² (bağlantı noktaları), termal hesap
  Kontrol kablosu: 0.5mm² (sinyal), 0.75mm² (24V güç)
  Minimum: %80 kapasite kullanımı hedefi

Etiketleme:
  Her kablo her iki ucunda etiketlenmeli (kablo numarası)
  Klemens etiketleri: Şema numarası ile uyumlu
  Bileşen etiketleri: Şema sembolü (KM1, QF1 vs.)
""",
    },
]


# ---------------------------------------------------------------------------
# Teknik Şartname içerikleri
# ---------------------------------------------------------------------------
TECH_SPECS = [
    {
        "title": "Bursa Otomotiv Tesisi Kaynak Robotu Entegrasyonu Teknik Şartnamesi",
        "spec_type": "robot",
        "customer": "Bursa Otomotiv A.Ş.",
        "contract_no": "BO-2025-047",
        "revision": "Rev.2",
        "status": "onaylı",
        "scope": "Bu teknik şartname, Bursa Otomotiv A.Ş. gövde kaynak hattı için tedarik edilecek 6 eksenli endüstriyel kaynak robotu entegrasyon sisteminin (robot, kaynak ekipmanı, güvenlik sistemi, PLC entegrasyonu ve MES bağlantısı dahil) teknik gereksinimlerini kapsar. Sistem kapasitesi: günde 3 vardiya × 8 saat, saatte 60 gövde kapasite.",
        "standards": "- ISO 10218-1:2011 Robot güvenliği (endüstriyel robot tasarımı)\n- ISO 10218-2:2011 Robot güvenliği (entegrasyon)\n- ISO/TS 15066:2016 Collaborative robot güvenliği\n- IEC 62061:2021 Fonksiyonel güvenlik (SIL 2)\n- ISO 9283:1998 Performans kriterleri ve test yöntemleri\n- AWS D1.1 Yapısal çelik kaynak standardı\n- IEC 60974-1 Kaynak ekipmanı güvenliği",
        "system_requirements": "Ortam Koşulları:\n- Çalışma sıcaklığı: +10°C ile +45°C\n- Bağıl nem: %10-%90 (yoğunlaşmasız)\n- IP koruma sınıfı: Robot IP54, Kontrol panosu IP54\n- Titreşim: IEC 60068-2-6 Fc testi geçmeli\n\nPerformans Gereksinimleri:\n- Kaynak döngü süresi (cycle time): ≤ 65 saniye/gövde\n- Tekrar konumlanma hassasiyeti: ±0.05 mm (ISO 9283)\n- Kaynak kalitesi: AWS D1.1 sınıf B kabul kriterleri\n- Sistem erişilebilirliği (availability): ≥ %98.5 (üretim saatleri)\n- MTBF: ≥ 2000 saat\n- MTTR: ≤ 4 saat\n\nGüvenlik:\n- Fonksiyonel güvenlik seviyesi: SIL 2 / PLd (ISO 13849)\n- Acil durdurma devreleri: IEC 60204-1 kategori 0 ve 1 stop\n- Güvenlik ışık perdesi: Çalışma alanı her girişinde\n- Eklem tork sınırlaması: İzinsiz temas algılama",
        "hardware_specs": "Robot Kolları (2 adet):\n- Marka/Model: Fanuc R-2000iC/210F veya eşdeğeri\n- Eksen sayısı: 6\n- Taşıma kapasitesi: 210 kg (kaynak torcu dahil)\n- Ulaşım mesafesi: min. 2650 mm\n- Tekrar hassasiyeti: ±0.05 mm\n- Kontrol ünitesi: Fanuc R-30iB Plus\n\nKaynak Ekipmanı:\n- Kaynak prosesi: MIG/MAG (GMAW)\n- Güç kaynağı: Fronius TPS 500i veya Lincoln PowerWave S500\n- Torç soğutma: Su soğutmalı\n- Tel besleyici kapasitesi: 15-25 kg spool\n- Kaynak akımı aralığı: 50-500A\n\nGüvenlik Sistemi:\n- Güvenlik PLC: Siemens S7-1500F veya Pilz PSS 4000\n- Işık perdesi: Sick deTec4 Core veya Keyence GL-R seri\n- Kilitleme kapı şalteri: Schmersal AZM300\n- Güvenlik ızgarası: min 1500mm yüksek, tel kafes\n\nKontrol Panosu:\n- IP54, 2000×800×400mm (G×Y×D)\n- UPS: 30 dakika PLC ve güvenlik devresi yedekleme\n- Profinet ağ anahtarı: Siemens Scalance XB008G",
        "software_specs": "PLC Yazılımı:\n- IEC 61131-3 uyumlu (LAD + SCL)\n- Program dili: TIA Portal V18\n- Standart FB kütüphanesi (motor, valf, alarm)\n- Recipe management: Ürün bazlı kaynak parametreleri\n- Logging: Son 10000 kaynak kaydı (EWI, WFS, Voltaj)\n\nHMI/SCADA:\n- Platform: Siemens WinCC Advanced\n- Ekran: 21\" dokunmatik endüstriyel panel\n- Sayfalar: Ana görüntü, alarm listesi, üretim raporu, bakım\n- Kullanıcı seviyeleri: Operatör, Teknisyen, Mühendis, Admin\n\nMES Bağlantısı:\n- Protokol: OPC-UA (port 4840)\n- Gönderilen veriler: Üretim sayısı, hurda, cycle time, OEE\n- Alınan veriler: Üretim emri, ürün tipi, kaynak parametreleri\n- Güncelleme sıklığı: Her kaynak sonrası (≤5 saniye gecikme)",
        "communication": "Ağ Mimarisi:\n- OT ağ segmenti: 192.168.10.0/24 (Profinet)\n- DMZ ağı: 192.168.20.0/24 (MES erişimi)\n- OT/IT firewall: Fortinet Industrial 60F veya Cisco IE3400\n\nProfinet Haberleşmesi:\n- PLC ↔ Robot: Profinet RT (güncelleme süresi 8ms)\n- PLC ↔ ET200SP I/O: Profinet RT\n- PLC ↔ Kaynak ekipmanı: Profinet (EWI arayüzü)\n\nOPC-UA Sunucu:\n- S7-1500 dahili OPC-UA sunucu\n- Güvenlik: Basic256Sha256\n- Namespace: urn:BursaOtomotiv:KaynakHatti1\n\nUzaktan Erişim:\n- VPN: IPSec IKEv2 (tedarikçi uzak bakım)\n- Uzak erişim: Sadece müşteri onayıyla (anahtar switch)",
        "acceptance_tests": "FAT (Fabrika Kabul Testi):\n- Yer: Tedarikçi tesisi, Bursa\n- Süre: 3 iş günü\n- Katılımcılar: Müşteri mühendisi + kalite sorumlusu\n\nFAT Test Kriterleri:\n1. 100 adet kaynak döngüsü başarısız hatasız tamamlanmalı\n2. Tüm güvenlik fonksiyonları test edilmeli (E-stop, ışık perdesi)\n3. OPC-UA haberleşme (test MES sunucusu ile) doğrulanmalı\n4. Kaynak kalitesi: Referans parça üzerinde UT/VT muayenesi\n5. Cycle time ölçümü: 10 döngü ortalaması ≤65 saniye\n\nSAT (Saha Kabul Testi):\n- Yer: Bursa Otomotiv A.Ş. fabrikası\n- Süre: 5 iş günü\n- Kurulum + devreye alma + doğrulama\n\nSAT Kabul Kriterleri:\n1. 8 saatlik kesintisiz üretim koşuşu\n2. OEE ≥ %85 (8 saatlik test periyodu)\n3. Kaynak hatası < %0.5 (UT muayene sonucu)\n4. MES veri akışı gerçek zamanlı doğrulama",
        "documentation_req": "Teslim Edilecek Belgeler:\n1. Proje Yönetimi:\n   - Proje programı (MS Project)\n   - Haftalık ilerleme raporları\n\n2. Mekanik Belgeler:\n   - Yerleşim planı (AutoCAD DWG, PDF)\n   - Robot çalışma zarfı çizimi\n   - Güvenlik kafesi tasarım çizimi\n\n3. Elektrik Belgeleri:\n   - Elektrik şemaları (EPLAN Electric P8, PDF)\n   - Kablo listesi (Excel)\n   - Klemens diyagramları\n   - Topraklama planı\n\n4. Yazılım Belgeleri:\n   - PLC kaynak kodu (TIA Portal + yedek USB)\n   - Robot programları (LS formatında + açıklama)\n   - HMI proje dosyaları\n   - Fonksiyonel açıklama belgesi (FDS)\n\n5. Güvenlik Belgeleri:\n   - Risk değerlendirmesi (ISO 12100)\n   - CE uygunluk beyanı\n   - Güvenlik fonksiyon dokümanı\n\n6. Bakım Belgeleri:\n   - Operatör kılavuzu (Türkçe)\n   - Bakım kılavuzu (Türkçe + İngilizce)\n   - Yedek parça listesi (katalog no ile)\n   - FAT/SAT protokol raporları",
        "training_warranty": "Eğitim Planı:\n\nOperatör Eğitimi (8 saat):\n- Güvenli çalışma prosedürleri\n- Manuel/Otomatik mod değiştirme\n- Alarm yönetimi ve reset\n- Bakım uyarıları ve günlük kontroller\n- Katılımcı sayısı: 6 kişi\n\nTeknisyen Eğitimi (16 saat):\n- Robot programı öğretme (teaching)\n- PLC arıza giderme\n- Kaynak parametre optimizasyonu\n- Yedek parça değişimi prosedürleri\n- Katılımcı sayısı: 3 kişi\n\nGaranti:\n- Süre: 24 ay (SAT tarihinden itibaren)\n- Kapsam: Tüm yedek parçalar ve işçilik\n- Müdahale süresi: Kritik arıza ≤4 saat, rutin ≤24 saat\n- Uzaktan destek: 7/24, VPN üzerinden\n\nBakım Sözleşmesi (Opsiyonel - 3 yıl):\n- Yılda 2 önleyici bakım ziyareti\n- 7/24 telefon desteği\n- Yedek parça stok taahhüdü (kritik: 48 saat)\n- Yazılım güncellemeleri dahil",
    },
    {
        "title": "İstanbul Elektronik Fabrikası MES Üretim Takip Sistemi Teknik Şartnamesi",
        "spec_type": "mes",
        "customer": "İstanbul Elektronik San. A.Ş.",
        "contract_no": "IE-MES-2025-003",
        "revision": "Rev.1",
        "status": "inceleme",
        "scope": "Bu teknik şartname, İstanbul Elektronik San. A.Ş. SMT (Surface Mount Technology) üretim hattı için tedarik edilecek MES (Manufacturing Execution System) yazılımının teknik gereksinimlerini kapsar. Sistem; üretim emri yönetimi, malzeme izlenebilirliği (Lot/Seri No), OEE takibi, kalite yönetimi ve SAP S/4HANA ERP entegrasyonunu kapsar. Hat kapasitesi: 4 SMT hattı, günlük 50.000 bileşen.",
        "standards": "- ISA-95 Part 1-5: MES/ERP entegrasyon standardı\n- MESA-11: MES fonksiyonları tanımı\n- IPC-7711/7721: PCB üretim ve onarım standardı\n- IEC 62264: Kurumsal-kontrol sistem entegrasyonu\n- ISO 9001:2015: Kalite yönetim sistemi\n- IATF 16949: Otomotiv kalite standardı (müşteri gereksinimi)\n- 21 CFR Part 11: Elektronik kayıt ve imza (FDA gereksinimi yok, best practice)\n- GDPR: Operatör verilerinin korunması",
        "system_requirements": "Fonksiyonel Gereksinimler:\n- Üretim emri yönetimi (ERP'den otomatik aktarım)\n- İş merkezi ve hat bazlı üretim takibi\n- Gerçek zamanlı OEE hesaplama (Kullanılabilirlik × Performans × Kalite)\n- Lot ve seri no bazlı malzeme izlenebilirliği\n- Kalite kontrolü: SPC grafikleri, NCR yönetimi\n- Duruş takibi: Neden kodları, pareto analizi\n- Operatör yönetimi: Giriş/çıkış, yetki, üretim takibi\n\nPerformans Gereksinimleri:\n- Veri tabanı kapasitesi: 5 yıl üretim verisi\n- Eşzamanlı kullanıcı: 50 kullanıcı\n- Web arayüzü yanıt süresi: <2 saniye (%95 percentile)\n- API yanıt süresi: <500ms\n- Sistem erişilebilirliği: ≥%99.5 (üretim saatleri, 7×24)\n- Veri yedekleme: Günlük otomatik, 30 gün saklama\n\nTeknik Altyapı:\n- Sunucu: Fiziksel veya VMware sanallaştırma\n- İşletim sistemi: Windows Server 2022 veya RHEL 9\n- Veri tabanı: Microsoft SQL Server 2022 veya PostgreSQL 15\n- Web sunucu: IIS 10 veya Nginx",
        "hardware_specs": "Sunucu Donanım (Minimum):\n- CPU: Intel Xeon Silver 4316 (20 çekirdek, 2.3GHz)\n- RAM: 64 GB ECC DDR4\n- Depolama: 2× 960GB NVMe SSD (RAID 1) + 4TB HDD (veri)\n- NIC: 2× 10GbE (bonding/teaming)\n- UPS: 2 saat yedek güç\n\nSaha Donanımı (Hat başına):\n- Operatör paneli: 15\" dokunmatik endüstriyel PC (IP54)\n- Barkod okuyucu: Zebra DS3678 (2D, Bluetooth)\n- Yazıcı (etiket): Zebra ZT421 (seri no etiketi)\n- Ağ: Managed switch, Cat6A kablo\n\nSCADA/PLC Entegrasyon Arayüzü:\n- OPC-UA Client: Makinelerden gerçek zamanlı veri\n- Desteklenen protokoller: OPC-UA, Modbus TCP, MQTT\n- SMT hat ekipmanı: Fuji NXT, Yamaha YSM, Juki FX-3\n  → Genium/Valor entegrasyonu veya OPC-UA",
        "software_specs": "MES Modülleri (Zorunlu):\n\n1. Üretim Emri Yönetimi:\n   - SAP PP → MES otomatik aktarım (<30 saniye)\n   - İş emri serbest bırakma ve izleme\n   - Kısmi üretim (split order) desteği\n\n2. Malzeme İzlenebilirlik:\n   - Lot ve seri no bazlı ileriye/geriye takip\n   - Komponent lot takibi (SMT besleme reel no)\n   - IPC-2591 (CFX) standardı desteği (opsiyonel)\n\n3. OEE Modülü:\n   - Gerçek zamanlı: Kullanılabilirlik, Performans, Kalite\n   - Duruş takibi: Neden ağacı (4 seviye)\n   - Hedef vs. gerçek karşılaştırma\n   - Vardiya sonu otomatik OEE raporu\n\n4. Kalite Yönetimi:\n   - SPC grafikleri (X-bar, R, IMR chart)\n   - Kontrol limitleri (UCL, LCL, ±3σ)\n   - NCR (Nonconformance Report) yönetimi\n   - AOI entegrasyonu (hata kodu eşleştirme)\n\n5. SAP Entegrasyonu:\n   - Üretim emri aktarımı: SAP PP → MES (PP01)\n   - Üretim bildirimi: MES → SAP (CO11N, MB31)\n   - Kalite bildirimi: MES → SAP QM (QA32)\n   - Protokol: SAP RFC / REST API",
        "communication": "Ağ Mimari:\n- OT Ağ (VLAN 10): SMT hatları, 192.168.10.0/24\n- MES Sunucu (VLAN 20): 192.168.20.0/24\n- IT/ERP Ağı (VLAN 30): 10.0.0.0/8 (SAP)\n- Firewall: Palo Alto PA-3260 (endüstriyel profil)\n\nMakineden MES Veri Akışı:\n- Fuji NXT3 → MES: Üretim sayısı, hız, hata (Fuji FCS protokolü)\n- AOI Makinesi → MES: Hata kodu ve koordinatları\n- Lehim pastası yazıcısı → MES: Stencil, pasta lot no\n- Reflow fırını → MES: Sıcaklık profili log\n\nSAP Bağlantısı:\n- Bağlantı: RFC (Remote Function Call) veya REST API\n- Güvenlik: SAP SNC şifreleme, servis hesabı\n- Retry mekanizması: 3 deneme, 5 dakika aralık\n- Kuyruk: RabbitMQ veya Azure Service Bus",
        "acceptance_tests": "FAT Kriterleri (Tedarikçi tesisinde):\n1. Demo veri tabanı ile tüm modüllerin demo gösterimi\n2. SAP entegrasyonu: Test SAP sistemine bağlantı\n3. OPC-UA bağlantısı: Simüle PLC ile test\n4. 100 adet üretim emri oluşturma, takip, kapatma\n5. Performans testi: 50 eşzamanlı kullanıcı simülasyonu\n6. Güvenlik testi: Kullanıcı yetki seviyeleri\n\nSAT Kriterleri (İstanbul Elektronik A.Ş. fabrikası):\n1. Gerçek SAP sistemiyle üretim emri aktarımı\n2. Tüm SMT hatlarından gerçek zamanlı OPC-UA verisi\n3. 1 tam vardiya (8 saat) sorunsuz üretim\n4. OEE hesaplama doğrulaması (manuel hesap ile karşılaştır)\n5. Izlenebilirlik: 1 PCB'nin tüm komponentlerini lot takip\n6. Kullanıcı eğitimi tamamlama",
        "documentation_req": "Yazılım Belgeleri:\n- Sistem mimarisi belgesi (SRS - System Requirements Spec)\n- Kullanıcı kılavuzu (Türkçe, rol bazlı: operatör, teknisyen, yönetici)\n- Sistem yöneticisi kılavuzu (kurulum, yedekleme, güncelleme)\n- API dokümantasyonu (REST API Swagger/OpenAPI)\n- SAP entegrasyon arayüz belgesi\n- Veri tabanı şema belgeleri\n\nTest Belgeleri:\n- FAT test protokolü ve sonuçları\n- SAT test protokolü ve sonuçları\n- Performans test raporu\n- Güvenlik test raporu\n\nProje Belgeleri:\n- Proje programı\n- Aylık ilerleme raporları\n- Değişiklik yönetimi kayıtları",
        "training_warranty": "Eğitim Planı:\n\nSistem Yöneticisi Eğitimi (2 gün):\n- Sunucu kurulum ve konfigürasyon\n- Kullanıcı yönetimi\n- Yedekleme ve geri yükleme\n- Performans izleme\n- Katılımcı: 2 BT personeli\n\nKey User Eğitimi (2 gün):\n- Tüm modüllerin detaylı kullanımı\n- SAP entegrasyon akışları\n- Raporlama ve dashboard konfigürasyonu\n- Katılımcı: 4 üretim mühendisi\n\nOperatör Eğitimi (1 gün):\n- Günlük kullanım (üretim takibi, duruş bildirimi)\n- Alarm yönetimi\n- Katılımcı: 20 operatör (2 grup, hat bazlı)\n\nGaranti:\n- Süre: 12 ay yazılım garantisi\n- Kapsam: Yazılım hataları (bug fix), minor güncellemeler\n- SLA: Kritik hata ≤4 saat, major hata ≤1 iş günü\n- Destek kanalı: Telefon + uzaktan erişim (TeamViewer)\n\nBakım (Yıllık sözleşme):\n- Major yazılım güncellemeleri\n- Veritabanı optimizasyonu\n- Yıllık sistem sağlığı kontrolü\n- Yeni modül entegrasyonları (ayrıca fiyatlandırılır)",
    },
    {
        "title": "İzmir Gıda Tesisi SCADA ve PLC Otomasyon Sistemi Teknik Şartnamesi",
        "spec_type": "plc_scada",
        "customer": "İzmir Gıda Sanayi A.Ş.",
        "contract_no": "IG-SCADA-2025-011",
        "revision": "Rev.0",
        "status": "taslak",
        "scope": "Bu teknik şartname, İzmir Gıda Sanayi A.Ş. makarna üretim tesisinin karıştırma, yoğurma, pişirme ve ambalajlama hatları için tedarik edilecek PLC tabanlı otomasyon ve SCADA süpervizyon sisteminin teknik gereksinimlerini kapsar. Tesis kapasitesi: 10 ton/saat makarna üretimi, 3 bağımsız üretim hattı.",
        "standards": "- IEC 61131-3: PLC programlama dilleri\n- IEC 61511: Proses endüstrisi güvenlik enstrümanlı sistemleri\n- ISA 88: Batch proses kontrol\n- EHEDG: Gıda endüstrisi hijyen tasarım rehberi\n- 3-A Standartları: Sanitasyon standartları\n- IEC 60529: IP koruma sınıfları\n- EN ISO 22000: Gıda güvenliği yönetimi\n- FDA 21 CFR Part 11: Elektronik kayıt (ihracat için)",
        "system_requirements": "Gıda Endüstrisi Özel Gereksinimleri:\n- Tüm saha ekipmanları: min. IP65 koruma sınıfı\n- Islak alan ekipmanları: IP69K (CIP/SIP uyumlu)\n- Malzemeler: AISI 316L paslanmaz çelik, gıda onaylı\n- Temizlenebilirlik: Kimyasal dezenfektan uyumlu yüzeyler\n- ATEX: Toz patlaması değerlendirmesi (un deposu: Zone 21)\n\nProses Kontrol Gereksinimleri:\n- Hamur sıcaklığı kontrolü: ±0.5°C hassasiyet\n- Nem ölçümü: ±0.5% bağıl nem\n- Pişirme hattı sıcaklık: PID kontrol, ±1°C\n- Ekstrüzyon basıncı: 4-20mA transmiter, PID\n\nSistem Erişilebilirliği: ≥%99.0 (üretim saatleri)\nVeri Saklama: 5 yıl proses kayıtları (FDA uyumu)",
        "hardware_specs": "PLC Sistemi:\n- Marka: Siemens S7-1500 veya Schneider M340\n- CPU: CPU 1515-2 PN (Siemens) veya BMEP342020 (Schneider)\n- Redundancy: CPU hot-standby (kritik hatlar için)\n- I/O Modülleri: Dağıtık ET200SP (her hat için ayrı kutu)\n- Analog giriş hassasiyeti: 16-bit minimum\n\nSaha Cihazları:\n- Sıcaklık transmiterleri: Pt100, HART 4-20mA\n- Nem sensörleri: Vaisala HMT310\n- Basınç transmiterleri: Endress+Hauser PMP71\n- Akış ölçer: Coriolis (ana su hattı), elektromanyetik\n- Motor sürücüler: Siemens G120C veya Schneider ATV320\n\nHMI/SCADA:\n- SCADA yazılımı: Siemens WinCC V7.5 veya Wonderware System Platform\n- Sunucu: Redundant server (primary + backup)\n- Operatör istasyonları: 3 adet 24\" dokunmatik PC\n- Tarihsel veri (historian): Min. 5 yıl proses kaydı\n\nKabinet:\n- IP54 ana kontrol panosu\n- IP65 saha dağıtım kutuları (ıslak alan için IP66)",
        "software_specs": "PLC Yazılım Gereksinimleri:\n- ISA 88 Batch modeli (faz, operasyon, prosedür)\n- Recipe management: Min. 200 ürün reçetesi\n- Otomatik CIP (Clean-in-Place) sekansı\n- Alarm yönetimi: ISA 18.2 standardına uygun\n- Alarm önceliklendirme: Kritik, Acil, Uyarı, Bilgi\n- Veri kayıt: Her 1 saniyede proses değerleri\n\nSCADA Gereksinimleri:\n- Gerçek zamanlı proses görüntüleme\n- Trend grafikler (anlık + geçmiş)\n- Alarm listesi ve geçmiş\n- Üretim raporları (vardiya, günlük, aylık)\n- Kullanıcı yönetimi: Rol bazlı erişim (5 seviye)\n- Audit trail: Tüm operatör işlemleri kayıt altında\n- 21 CFR Part 11 uyumlu elektronik kayıt\n\nBatch Yönetimi:\n- Ürün bazlı reçete yönetimi\n- Batch kaydı: Başlangıç/bitiş zamanı, kullanılan malzemeler\n- Elektronic batch record (EBR) üretimi",
        "communication": "Haberleşme Protokolleri:\n- PLC ↔ Sürücüler: Profinet veya Modbus TCP\n- PLC ↔ SCADA: OPC-DA / OPC-UA\n- SCADA ↔ Historian: OPC-HDA\n- SCADA ↔ ERP/LIMS: REST API veya OPC-UA\n\nAğ Segmentasyonu:\n- Kontrol ağı (VLAN 10): PLC, sürücüler, transmiterler\n- SCADA ağı (VLAN 20): SCADA sunucu, operatör istasyonları\n- Yönetim ağı (VLAN 30): Uzaktan erişim, IT\n\nUzaktan Destek:\n- VPN bağlantısı (Cisco AnyConnect)\n- Uzaktan PLC bağlantısı yalnızca yetkili personele\n- Bağlantı log kaydı zorunlu",
        "acceptance_tests": "FAT Kriterleri:\n1. Tüm I/O nokta testi (loop test): Her kart 100%\n2. Motor yön ve hız testi (sürücü ile)\n3. PID kontrol parametresi doğrulama\n4. Alarm yönetimi (tüm alarm senaryoları)\n5. Recipe management: 10 farklı reçete yükleme ve çalıştırma\n6. CIP sekansı testi\n7. SCADA ekran doğrulaması (tüm sayfalar)\n8. Historian veri kaydı doğrulama\n\nSAT Kriterleri (İzmir Gıda tesisi):\n1. Saha I/O kalibrasyon doğrulaması\n2. Gerçek hammadde ile proses testi (2 batch)\n3. CIP otomasyonu çalışma testi\n4. Ağ haberleşme performans testi\n5. 48 saatlik sorunsuz üretim testi\n6. Üretim raporu doğrulaması",
        "documentation_req": "Belge Gereksinimleri:\n1. P&ID (Boru ve Enstrüman Diyagramı): AutoCAD, PDF\n2. Elektrik şemaları (EPLAN): Tüm pano ve saha bağlantıları\n3. Kablo listeleri: Tüm enstrüman ve güç kablolarının listesi\n4. PLC programı: TIA Portal projesi + yorumlu kaynak kod\n5. SCADA projesi: WinCC proje dosyaları\n6. Fonksiyonel açıklama belgesi (FDS): Her prosesin tanımı\n7. Operatör kılavuzu (Türkçe, resimli)\n8. Bakım kılavuzu: Kalibrasyon prosedürleri dahil\n9. Yedek parça listesi\n10. Kalibrasyon sertifikaları (transmiterler)\n11. FAT/SAT protokol raporları",
        "training_warranty": "Eğitim:\n\nOperatör Eğitimi (2 gün):\n- SCADA kullanımı\n- Alarm yönetimi ve müdahale\n- Reçete değiştirme\n- CIP başlatma prosedürü\n- Katılımcı: 8 operatör (4+4, iki grup)\n\nTeknisyen Eğitimi (3 gün):\n- PLC arıza giderme\n- Kalibrasyon prosedürleri\n- Yedek parça değişimi\n- SCADA sistem yönetimi\n- Katılımcı: 2 bakım teknisyeni\n\nGaranti:\n- Süre: 24 ay (SAT tarihinden)\n- Kapsam: Yazılım + donanım hataları\n- Acil müdahale: ≤8 saat (mesai saatleri)\n- Uzak destek: 7/24 telefon + VPN\n\nBakım Sözleşmesi (2 yıl, opsiyonel):\n- Yılda 2 önleyici bakım (PM) ziyareti\n- Tüm transmiterlerin yıllık kalibrasyonu\n- Sürücü ve PLC ürün yazılımı güncelleme\n- 7/24 uzaktan destek hattı",
    },
]


class Command(BaseCommand):
    help = "Gerçekçi teknik döküman ve şartname örnek verisi oluşturur"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true",
                            help="Mevcut teknik döküman ve şartnameleri sil")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            TechnicalDocument.objects.all().delete()
            TechnicalSpec.objects.all().delete()
            self.stdout.write("  Mevcut teknik dokumanlar ve sartnameler silindi.")

        admin = User.objects.filter(username="admin").first()
        if not admin:
            self.stdout.write(self.style.ERROR(
                "admin kullanicisi bulunamadi. Once seed_demo calistirin."
            ))
            return

        # ---- Teknik Dökümanlar ----
        self.stdout.write("Teknik dokumanlar olusturuluyor...")
        created_docs = 0
        for d in TECH_DOCS:
            if TechnicalDocument.objects.filter(title=d["title"]).exists():
                continue
            content_bytes = b"\xef\xbb\xbf" + d["content"].encode("utf-8")  # UTF-8 BOM
            doc = TechnicalDocument(
                title=d["title"],
                category=d["category"],
                description=d["description"],
                uploaded_by=admin,
            )
            doc.file.save(d["filename"], ContentFile(content_bytes), save=True)
            created_docs += 1

        # ---- Teknik Şartnameler ----
        self.stdout.write("Teknik sartnameler olusturuluyor...")
        created_specs = 0
        for s in TECH_SPECS:
            if TechnicalSpec.objects.filter(title=s["title"]).exists():
                continue
            TechnicalSpec.objects.create(created_by=admin, **s)
            created_specs += 1

        self.stdout.write(self.style.SUCCESS(
            f"[OK] {created_docs} teknik dokuman, {created_specs} teknik sartname olusturuldu."
        ))

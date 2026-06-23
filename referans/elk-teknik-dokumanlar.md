# Teknik Dokümanlar Rehberi
**Kapsam**: FDS, URS, DDS, BOM, Teknik Şartname | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [Doküman Hiyerarşisi](#1-hiyerarsi)
2. [FDS — Fonksiyonel Tasarım Dokümanı](#2-fds)
3. [URS — Kullanıcı Gereksinim Dokümanı](#3-urs)
4. [Teknik Şartname Yazım Kılavuzu](#4-sartname)
5. [BOM — Malzeme Listesi](#5-bom)
6. [As-Built Dokümantasyon](#6-as-built)
7. [Doküman Kontrol ve Revizyon Yönetimi](#7-revizyon)

---

## 1. Doküman Hiyerarşisi

```
Proje Doküman Piramidi:
                    ┌───────────────┐
                    │  URS / SRS    │  ← Ne istendiği
                    │(User Req. Spec)│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │      FDS      │  ← Nasıl yapılacağı
                    │ (Fonk. Tasarım│
                    └───────┬───────┘
                            ↓
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────────────┐       ┌─────────────────┐
    │ Yazılım Tasarım │       │ Donanım Tasarım │
    │  (SW Design)    │       │  (HW Design)    │
    └────────┬────────┘       └────────┬────────┘
             ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │  PLC Yazılımı   │       │  Elektrik Şema  │
    │  SCADA Projesi  │       │  Pano Layout    │
    │  Alarm Listesi  │       │  I/O Listesi    │
    └─────────────────┘       └─────────────────┘
             ↓                         ↓
              └─────────────┬─────────────────┘
                            ↓
                    ┌───────────────┐
                    │ FAT / SAT     │  ← Doğrulama
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │  As-Built     │  ← Teslim
                    └───────────────┘
```

### Doküman Numaralama Standardı

```
Format: [PROJE]-[TIP]-[BÖLÜM]-[SIRA]

Örnekler:
  ABC2024-FDS-001   → Proje ABC 2024, FDS, 1. doküman
  ABC2024-ELK-003   → Elektrik şema, 3. dosya
  ABC2024-BOM-001   → Malzeme listesi
  ABC2024-FAT-001   → FAT protokolü

Doküman Tipleri:
  URS = Kullanıcı Gereksinim
  FDS = Fonksiyonel Tasarım
  SLD = Tek Hat Şeması
  SCH = Detay Şema (elektrik)
  LAY = Layout (yerleşim planı)
  IOL = I/O Listesi
  BOM = Malzeme Listesi
  ALM = Alarm Listesi
  FAT = FAT Protokolü
  SAT = SAT Protokolü
  TRN = Eğitim Materyali
  ABT = As-Built
```

---

## 2. FDS — Fonksiyonel Tasarım Dokümanı

### FDS Tam Şablonu

```
╔══════════════════════════════════════════════════════════════╗
║         FONKSİYONEL TASARIM DOKÜMANI (FDS)                 ║
╠══════════════════════════════════════════════════════════════╣
║ Doküman No  : [PROJE]-FDS-001                               ║
║ Proje Adı   :                                               ║
║ Müşteri     :                                               ║
║ Hazırlayan  :                     Tarih:                    ║
║ Kontrol Eden:                     Tarih:                    ║
║ Onaylayan   :                     Tarih:                    ║
╚══════════════════════════════════════════════════════════════╝

REVİZYON GEÇMİŞİ:
─────────────────────────────────────────────────────────────
Rev. │ Tarih      │ Açıklama              │ Hazırlayan
─────┼────────────┼───────────────────────┼─────────────────
 A   │ GG.AA.YYYY │ İlk yayın             │
 B   │            │                       │
─────────────────────────────────────────────────────────────


1. AMAÇ VE KAPSAM
─────────────────────────────────────────────────────────────
1.1 Amaç
Bu doküman, [Sistem/Makine Adı] için otomasyon sisteminin
fonksiyonel tasarımını tanımlar. PLC yazılımı, HMI/SCADA
ekranları ve saha aletleri için temel referans dokümanıdır.

1.2 Kapsam
Bu FDS kapsamındadır:
• [Kapsam dahili madde 1]
• [Kapsam dahili madde 2]

Bu FDS kapsamında DEĞİLDİR:
• [Kapsam dışı madde 1]

1.3 Referans Dokümanlar
• URS No: [PROJE]-URS-001
• Elektrik Şema: [PROJE]-SCH-001
• P&ID: [PROJE]-PID-001


2. SİSTEM GENEL BAKIŞ
─────────────────────────────────────────────────────────────
2.1 Sistem Tanımı
[Sistemin ne yaptığını, hangi prosesi kontrol ettiğini,
nerede kullanıldığını kısaca anlat — max 1 sayfa]

2.2 Otomasyon Mimarisi
[Blok diyagram veya metin:
 PLC ↔ SCADA ↔ MES/ERP bağlantıları,
 Fieldbus yapısı,
 Network mimarisi]

2.3 Ekipman Listesi
─────────────────────────────────────────────────────────────
Tag No   │ Açıklama            │ Marka/Model       │ Konum
─────────┼─────────────────────┼───────────────────┼────────
PLC-001  │ Ana PLC             │ Siemens CPU 1515  │ Panel-A
HMI-001  │ Operatör Paneli     │ Siemens TP1200    │ Panel-A
VFD-001  │ Konveyör Sürücüsü  │ Siemens G120      │ MCC-1


3. ÇALIŞMA MODLARı
─────────────────────────────────────────────────────────────
3.1 Manuel Mod (MAN)
• Kim seçer: Operatör (HMI ekranından)
• Ne yapar: Her ekipman bağımsız kontrol edilir
• Kısıtlamalar: Güvenlik interlockları aktiftir
• Kullanım durumu: Test, bakım

3.2 Otomatik Mod (AUTO)
• Kim seçer: Operatör (HMI ekranından)
• Ne yapar: Sistem önceden tanımlı sekans ile çalışır
• Başlatma koşulları: Tüm hazırlık koşulları sağlanmalı
• Durdurma: Normal durdurma sekansı uygulanır

3.3 Yarı Otomatik (SEMI)
[Varsa tanımla]

3.4 Acil Durdurma (E-Stop)
• Tetikleyici: Donanım E-stop düğmesi veya güvenlik devresi
• Yanıt süresi: < 100ms
• Sistem davranışı: Tüm çıkışlar enerjisiz, güvenli konuma git
• Reset koşulu: Manuel reset + operatör onayı


4. I/O LİSTESİ ÖZETİ
─────────────────────────────────────────────────────────────
  Dijital Giriş  (DI): ___ adet
  Dijital Çıkış  (DO): ___ adet
  Analog Giriş   (AI): ___ adet (4-20mA: ___, PT100: ___, TC: ___)
  Analog Çıkış   (AO): ___ adet
  Haberleşme Cihazı  : ___ adet (Profinet/Modbus/OPC-UA)
  
  Detaylı I/O listesi: Bkz. [PROJE]-IOL-001


5. FONKSİYONEL AÇIKLAMALAR
─────────────────────────────────────────────────────────────
[Her alt sistem için ayrı bölüm yaz]

5.1 [Alt Sistem 1 Adı — örn: Konveyör Sistemi]
─────────────────────────────────────────────────────────────
5.1.1 Genel Tanım
[Bu alt sistem ne yapıyor?]

5.1.2 Başlatma Sekansı
Adım  │ Aksiyon                  │ Koşul / Kontrol
──────┼──────────────────────────┼──────────────────────────
  1   │ Uyarı sinyali çal (3 sn) │ Başlatma komutu alındı
  2   │ Konveyör 1'i başlat      │ Adım 1 tamamlandı
  3   │ Geri bildirim bekle       │ FBK gelmezse → Adım 999
  4   │ Konveyör 2'yi başlat     │ Konveyör 1 çalışıyor
  ...
 900  │ Sistem ÇALIŞIYOR         │ Tüm adımlar OK
 999  │ ARIZA — Sistem dur       │ Herhangi bir hata

5.1.3 Normal Durdurma Sekansı
[Adım adım tanımla]

5.1.4 Acil Durdurma Davranışı
[E-stop anında ne olur?]

5.1.5 İnterlock Listesi
─────────────────────────────────────────────────────────────
Interlock No │ Açıklama                  │ Etki
─────────────┼───────────────────────────┼─────────────────
  IL-001      │ Kapı açık → Konveyör dur │ Konveyör 1,2 STOP
  IL-002      │ Tank dolu → Besleme dur  │ Besleme pompası STOP

5.1.6 Alarm ve Uyarılar
─────────────────────────────────────────────────────────────
Alarm ID │ Açıklama          │ Tetikleme         │ Öncelik
─────────┼───────────────────┼───────────────────┼─────────
ALM-001  │ Motor arızası     │ FBK yok > 10s     │ 2 (Yüksek)
ALM-002  │ Yüksek sıcaklık   │ TT-101 > 80°C    │ 3 (Orta)

5.2 [Alt Sistem 2 Adı]
[Aynı yapıda devam et...]


6. HMI / SCADA GEREKSİNİMLERİ
─────────────────────────────────────────────────────────────
6.1 Ekran Listesi
─────────────────────────────────────────────────────────────
Ekran No │ Ekran Adı         │ Seviye │ Erişim       │ Not
─────────┼───────────────────┼────────┼──────────────┼──────
SCR-001  │ Ana Genel Bakış   │ L1     │ Herkes       │
SCR-002  │ Konveyör Detay    │ L2     │ Herkes       │
SCR-003  │ Alarm Listesi     │ L2     │ Herkes       │
SCR-004  │ PID Tuning        │ L4     │ Mühendis     │ Şifreli

6.2 Kullanıcı Yetki Matrisi
─────────────────────────────────────────────────────────────
Eylem                │ Operatör │ Vardiya Amiri │ Mühendis
─────────────────────┼──────────┼───────────────┼──────────
Sistem başlat/durdur │    ✅    │      ✅       │    ✅
Mod değiştir         │    ✅    │      ✅       │    ✅
SP değiştir          │    ❌    │      ✅       │    ✅
Alarm acknowledge    │    ✅    │      ✅       │    ✅
PID parametresi      │    ❌    │      ❌       │    ✅
Sistemi shelve       │    ❌    │      ✅       │    ✅

6.3 Trend Gereksinimleri
─────────────────────────────────────────────────────────────
Tag               │ Örnekleme │ Arşiv Süresi │ Görüntüleme
──────────────────┼───────────┼──────────────┼─────────────
TANK1_LVL_PV      │ 1 sn      │ 1 yıl        │ Anlık + trend
BOILER1_TEMP_PV   │ 1 sn      │ 1 yıl        │ Anlık + trend


7. RAPORLAMA GEREKSİNİMLERİ
─────────────────────────────────────────────────────────────
7.1 Otomatik Raporlar
─────────────────────────────────────────────────────────────
Rapor Adı        │ Periyot   │ İçerik                │ Format
─────────────────┼───────────┼───────────────────────┼────────
Üretim Raporu    │ Günlük    │ Toplam üretim, OEE    │ PDF/Excel
Alarm Raporu     │ Haftalık  │ En çok alarm, süre    │ Excel
Enerji Raporu    │ Aylık     │ kWh tüketim, maliyet  │ PDF


8. ENTEGRASYON GEREKSİNİMLERİ
─────────────────────────────────────────────────────────────
8.1 MES/ERP Entegrasyonu
  Protokol       : OPC-UA
  Sunucu         : PLC OPC-UA server (192.168.1.10:4840)
  Yazılan taglar : Reçete SP'leri (MES → PLC)
  Okunan taglar  : Üretim sayaçları, kalite verileri (PLC → MES)

8.2 Historian
  Platform       : [WinCC Historian / Ignition Historian / PI System]
  Arşiv periyodu : ___ yıl
  Yedekleme      : [RAID / Bulut / Harici]


9. ONAY SAYFASI
─────────────────────────────────────────────────────────────
Hazırlayan :              │ İmza: │ Tarih:
Kontrol    :              │ İmza: │ Tarih:
Müşteri Onay:             │ İmza: │ Tarih:
─────────────────────────────────────────────────────────────
```

---

## 3. URS — Kullanıcı Gereksinim Dokümanı

### URS Şablonu (Kısa Versiyon)

```
KULLANICI GEREKSİNİM DOKÜMANI (URS)
Doküman No: [PROJE]-URS-001 | Tarih: _________ | Rev: A

1. SİSTEM TANIMI
   Sistemin amacı: ________________________________
   Mevcut durum: ________________________________
   Beklenen iyileşme: ________________________________

2. FONKSİYONEL GEREKSİNİMLER
   FR-001: Sistem [ne yapmalı] — [kabul kriteri]
   FR-002: ...
   FR-003: ...

3. PERFORMANS GEREKSİNİMLERİ
   PR-001: Sistem kapasitesi: ___ adet/saat minimum
   PR-002: Sistem yanıt süresi: < ___ saniye
   PR-003: Sistem uptime: ≥ %95

4. GÜVENLİK GEREKSİNİMLERİ
   SR-001: Makine direktifi 2006/42/EC uyumu
   SR-002: Risk değerlendirmesi tamamlanmış olmalı
   SR-003: Acil durdurma < 100ms

5. ORTAM GEREKSİNİMLERİ
   ER-001: Çalışma sıcaklığı: ___ – ___ °C
   ER-002: Çalışma nemi: %___ – %___
   ER-003: IP koruma sınıfı: IP___
   ER-004: ATEX bölge: [Var / Yok — Zone: ___]

6. EĞİTİM VE DESTEK
   TR-001: Operatör eğitimi: ___ kişi, ___ gün
   TR-002: Bakım eğitimi: ___ kişi, ___ gün
   TR-003: Garanti süresi: ___ ay

ONAY: Müşteri: _____________ | Tarih: _____________
```

---

## 4. Teknik Şartname Yazım Kılavuzu

### Şartname Dili Kuralları

```
YANLIŞ (belirsiz):
  "Sistem hızlı yanıt vermeli"
  "Kaliteli bileşenler kullanılacak"
  "Yeterli kapasite olmalı"

DOĞRU (ölçülebilir):
  "Alarm tepki süresi < 500ms olmalıdır"
  "IP65 min., IEC 60529 uyumlu bileşenler kullanılacaktır"
  "CPU yükü %60'ı aşmamalıdır"

KURAL: Her gereksinim SMART olmalı:
  S — Specific (belirli)
  M — Measurable (ölçülebilir)
  A — Achievable (ulaşılabilir)
  R — Relevant (ilgili)
  T — Testable (test edilebilir)
```

### PLC Teknik Şartname Bölümleri

```
1. KAPSAM VE UYGULAMA ALANI
2. GENEL GEREKSİNİMLER
   • Standart uyumu (IEC 61131-3)
   • Çalışma sıcaklığı aralığı
   • Gerilim toleransı
3. CPU GEREKSİNİMLERİ
   • Min. program belleği (KB)
   • Min. veri belleği (KB)
   • Haberleşme portları
   • Tarama süresi
4. I/O GEREKSİNİMLERİ
   • DI adet ve tip (NPN/PNP, 24VDC)
   • DO adet ve tip (transistör/röle)
   • AI adet ve çözünürlük (bit)
   • AO adet
   • %20 yedek kapasite zorunlu
5. HABERLEŞME
   • Fieldbus protokolü
   • Ethernet port sayısı
   • Haberleşme hızı
6. YAZILIM GEREKSİNİMLERİ
   • Programlama ortamı versiyonu
   • Kaynak kodu teslimi
   • Yorum dili
7. TEST VE KABUL
   • FAT zorunlu mu?
   • Kabul kriterleri
8. GARANTİ VE SERVİS
   • Garanti süresi
   • Yedek parça stok gereksinimleri
   • Servis tepki süresi
```

---

## 5. BOM — Malzeme Listesi

### BOM Yapısı ve Seviyeleri

```
Seviye 0 — Proje (toplam)
  Seviye 1 — Panel/Alt sistem
    Seviye 2 — Ekipman grubu
      Seviye 3 — Bireysel kalem
```

### BOM Şablonu

```
MALZEME LİSTESİ (BOM)
Proje: _________________ | Revizyon: A | Tarih: _____________

Sıra │ BOM Kodu   │ Tanım                    │ Üretici  │ Model       │ Miktar │ Birim │ Not
─────┼────────────┼──────────────────────────┼──────────┼─────────────┼────────┼───────┼──────────
     │            │ PANEL A — PLC PANELİ      │          │             │        │       │
001  │ PLT-001    │ PLC CPU                  │ Siemens  │ 6ES7515-2AM │   1    │ Adet  │
002  │ PLT-002    │ CPU Güç Kaynağı           │ Siemens  │ 6EP1...     │   1    │ Adet  │
003  │ PLT-003    │ DI 16×24VDC Modül        │ Siemens  │ 6ES7521-... │   2    │ Adet  │
004  │ PLT-004    │ DO 16×24VDC Transistör   │ Siemens  │ 6ES7522-... │   1    │ Adet  │
005  │ PLT-005    │ AI 8× 4-20mA             │ Siemens  │ 6ES7531-... │   1    │ Adet  │
006  │ PLT-006    │ HMI TP1200 Comfort 12"   │ Siemens  │ 6AV2124-... │   1    │ Adet  │
007  │ PLT-007    │ Managed Switch 8 port     │ Moxa     │ EDS-308     │   1    │ Adet  │
008  │ PLT-008    │ UPS 24VDC 20A             │ Phoenix  │ QUINT-UPS   │   1    │ Adet  │
─────┼────────────┼──────────────────────────┼──────────┼─────────────┼────────┼───────┼──────────
     │            │ MCC-1 — MOTOR KONTROL     │          │             │        │       │
020  │ MCC-001    │ Ana MCB 3P 63A            │ Siemens  │ 5SL6 363-7  │   1    │ Adet  │
021  │ MCC-002    │ VFD 7.5 kW               │ Siemens  │ G120 7.5kW  │   3    │ Adet  │
022  │ MCC-003    │ Kontaktör 18A             │ Siemens  │ 3RT2018-... │   2    │ Adet  │
─────┼────────────┼──────────────────────────┼──────────┼─────────────┼────────┼───────┼──────────
     │            │ KABLO VE AKSESUAR         │          │             │        │       │
050  │ KBL-001    │ NYY 3×2.5mm² kablo       │ Prysmian │ —           │  250   │ Metre │ Motor güç
051  │ KBL-002    │ OLFLEX 7G1.5 kontrol kbl │ Lapp     │ —           │  400   │ Metre │ Kontrol
052  │ KBL-003    │ Li2YCY 2×1 ekranlı       │ Lapp     │ —           │  300   │ Metre │ Analog
```

---

## 6. As-Built Dokümantasyon

### As-Built Kontrol Listesi

```
AS-BUILT DOKÜMANTASYON — TESLİM LİSTESİ
Proje: _________________ | SAT Tarihi: _____________

ELEKTRİK DOKÜMANLARI:
□ Tek hat şeması (SLD) — as-built (rev. __)
□ Pano güç şemaları — as-built
□ Kontrol devresi şemaları — as-built
□ Saha alet yerleşim planı — as-built
□ Topraklama planı — as-built
□ I/O listesi — as-built

OTOMASYON DOKÜMANLARI:
□ PLC yazılımı — son versiyon arşivi (.zap / .L5K / .tpzip)
□ HMI/SCADA projesi — son versiyon arşivi
□ Alarm listesi — as-built
□ Tag listesi / değişken listesi
□ Haberleşme konfigürasyonu

SİSTEM DOKÜMANLARI:
□ Fonksiyonel tasarım dokümanı (FDS) — onaylı son versiyon
□ FAT protokolü — imzalı
□ SAT protokolü — imzalı
□ Risk değerlendirmesi — onaylı
□ CE beyanı / DoC (gerekirse)
□ Makine güvenlik raporları

KULLANICI DOKÜMANLARI:
□ Kullanım ve operasyon kılavuzu (Türkçe)
□ Bakım talimatı (Türkçe)
□ Arıza giderme kılavuzu
□ Yedek parça listesi
□ Eğitim katılımcı formu

ONAY: Entegratör: _______________ | Müşteri: _______________ | Tarih: ___
```

---

## 7. Doküman Kontrol ve Revizyon Yönetimi

### Revizyon Harfleri ve Anlamları

| Rev | Durum | Açıklama |
|-----|-------|----------|
| 0 veya A | İlk Taslak | İç inceleme için |
| B, C... | Revize Taslak | Yorum sonrası revizyon |
| 1 | İlk Yayın | Müşteri onaylı, uygulamaya alındı |
| 2, 3... | Revize Yayın | Onaylı değişiklik sonrası |
| AS-BUILT | As-Built | Nihai gerçekleşen durum |

### Değişiklik Yönetimi (MOC)

```
Değişiklik Talep Süreci:
1. Değişiklik Talebi (CR) oluştur
   Kimin talebi? Müşteri / Proje ekibi
   Ne değişecek? Kapsam, süre, maliyet etkisi?

2. Teknik değerlendirme
   Mevcut tasarımla çakışıyor mu?
   Güvenlik etkisi var mı?
   Test gerektirir mi?

3. Etki analizi
   Maliyet etkisi: +/- ___ TL
   Süre etkisi: +/- ___ gün
   Doküman etkisi: Hangi dokümanlar güncellenir?

4. Onay
   Küçük değişiklik (< 1 gün etki): Proje Mühendisi onayı
   Orta değişiklik (1-5 gün): Proje Müdürü onayı
   Büyük değişiklik (> 5 gün): Müşteri + Proje Müdürü onayı

5. Uygula ve dokümanları güncelle
   Revizyon notu ekle: "CR-005 gereği değiştirildi"
```

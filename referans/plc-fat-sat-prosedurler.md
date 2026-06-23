# FAT / SAT Prosedürleri Referansı
**Standart**: IEC 61511 / GAMP 5 uyumlu | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [FAT ve SAT Farkı](#1-fat-sat-farkı)
2. [FAT Hazırlık Süreci](#2-fat-hazırlık)
3. [FAT Uygulama Adımları](#3-fat-uygulama)
4. [SAT Hazırlık ve Uygulama](#4-sat)
5. [Test Kategorileri ve Örnekleri](#5-test-kategorileri)
6. [Kabul Kriterleri](#6-kabul-kriterleri)
7. [FAT Protokol Formu](#7-fat-formu)
8. [SAT Protokol Formu](#8-sat-formu)
9. [Sık Karşılaşılan Sorunlar](#9-sorunlar)

---

## 1. FAT ve SAT Farkı

| | FAT (Factory Acceptance Test) | SAT (Site Acceptance Test) |
|---|---|---|
| **Nerede** | Üretici/entegratör tesisi | Müşteri sahası / fabrika |
| **Ne zaman** | Teslimattan önce | Devreye almadan sonra |
| **Ortam** | Simüle edilmiş I/O | Gerçek saha bağlantıları |
| **Katılımcı** | Üretici + müşteri temsilcisi | Müşteri + entegratör |
| **Amaç** | Yazılım/donanım doğrulama | Sahada çalışma doğrulama |
| **Süre** | 1–5 gün | 1–3 gün |
| **Teslimati** | İmzalı FAT protokolü | İmzalı SAT protokolü + devir teslim |

---

## 2. FAT Hazırlık Süreci

### 2 Hafta Önce

- [ ] FAT planı müşteriye gönderildi (tarih, yer, katılımcılar)
- [ ] Test prosedür dokümanı hazırlandı ve onaylandı
- [ ] I/O simülasyon düzeneği kuruldu (jump wire, test butonu, potans.)
- [ ] Güncel yazılım versiyonu yüklendi ve arşivlendi
- [ ] FAT öncesi iç test tamamlandı (punch list temizlendi)

### 1 Hafta Önce

- [ ] HMI/SCADA ekranları tamamlandı
- [ ] Alarm listesi finalize edildi
- [ ] Network ve haberleşme testleri tamamlandı
- [ ] Test araçları hazırlandı (multimetre, sinyal simülatörü)
- [ ] FAT protokol formları baskıya hazır

### FAT Günü Sabahı

- [ ] Ekipman gücü kontrol edildi
- [ ] UPS ve güç kaynakları kontrol edildi
- [ ] Son yazılım backup alındı (FAT_pre_GGAAYYY)
- [ ] Katılımcı listesi teyit edildi
- [ ] Test ortamı müşteriye gösterildi

---

## 3. FAT Uygulama Adımları

### Adım 1 — Donanım Gözden Geçirme (≈1 saat)

| Kontrol | Beklenen | Sonuç |
|---------|---------|-------|
| PLC CPU modeli ve firmware versiyonu | [Şartname ile eşleşmeli] | |
| Modül tipi ve slot konumları | [I/O listesi ile eşleşmeli] | |
| Güç kaynağı voltajı | 24VDC ±%5 | |
| UPS test (güç kesilmesi simülasyonu) | Alarm + kesintisiz devam | |
| Topraklama direnci | <1 Ω | |
| IP koruma sınıfı (pano kapağı) | [Şartname ile eşleşmeli] | |

### Adım 2 — Yazılım Konfigürasyon Kontrolü

| Kontrol | Beklenen | Sonuç |
|---------|---------|-------|
| CPU IP adresi | [Şartname değeri] | |
| Profinet/EIP cihaz isimleri | [I/O listesi ile eşleşmeli] | |
| Saat/tarih senkronizasyonu | NTP aktif | |
| Bellek kullanımı (RAM/WORK) | < %80 | |
| Program cycle time | < Belirlenen limit | |

### Adım 3 — I/O Checkout (Her sinyal tek tek)

**Dijital Giriş (DI) Testi:**
1. Test butonunu bağla
2. Butona bas → PLC tag'i `1` (TRUE) oluyor mu? Kontrol et
3. Bırak → `0` (FALSE) oluyor mu? Kontrol et
4. HMI'da görünüyor mu? Kontrol et
5. Formu imzala

**Dijital Çıkış (DO) Testi:**
1. HMI veya test ekranından çıkışı zorla (force)
2. Saha cihazında (röle, solenoid) hareket var mı?
3. Kontrol et ve force'u kaldır
4. Çıkış `0`'a döndü mü?

**Analog Giriş (AI) Testi:**
1. Sinyal simülatörü bağla (4mA → 0%, 20mA → 100%)
2. 4mA ver → PLC'de 0.0 EU görünüyor mu?
3. 12mA ver → %50 görünüyor mu? (±%0.5 kabul)
4. 20mA ver → %100 görünüyor mu?
5. HMI trendinde görünüyor mu?

**Analog Çıkış (AO) Testi:**
1. HMI'dan %0 SP ver → çıkışta 4mA ölç
2. %50 SP → 12mA ölç (±0.1mA kabul)
3. %100 SP → 20mA ölç

### Adım 4 — Fonksiyonel Test (Senaryo Bazlı)

Her fonksiyon için senaryo:

```
Senaryo No : FT-001
Açıklama   : Normal Başlatma Sekansı
Ön Koşul   : Acil stop serbest, tüm izinler verilmiş
Test Adımı : HMI'dan "START" butonuna bas
Beklenen   : 1. Uyarı sinyali 3 sn çalar
              2. Konveyör 1 çalışır (fbk 5 sn içinde)
              3. Konveyör 2 çalışır (fbk 5 sn içinde)
              4. HMI'da "RUNNING" durumu gösterilir
Sonuç      : GEÇTI / KALDI
Notlar     :
```

### Adım 5 — Alarm ve İnterlock Testleri

```
Alarm No  : ALM-012
Alarm Adı : Tank Seviye Yüksek
Tetikleme : LT-101 > 90%
Test      : AI simülatörden 91% ver
Beklenen  : - PLC alarmı aktif eder
              - HMI'da sarı alarm mesajı çıkar
              - Besleme vanası kapanır (interlock)
              - Alarm sayfasında timestamp ile görünür
Sonuç     :
```

### Adım 6 — Acil Stop Testi

> ⚠️ Bu test her devreye almada zorunludur. Atlanamaz.

| Test | Adım | Beklenen |
|------|------|---------|
| Donanım E-Stop | Fiziksel E-stop butonuna bas | Tüm çıkışlar <100ms içinde kapanır |
| E-Stop ring testi | Hattaki tüm E-stop butonları sırayla test | Her biri aynı sonucu vermelidir |
| E-Stop reset | Butonu serbest bırak + reset | Sistem otomatik başlamamalı |
| Güvenlik kategorisi | Safety relay çıkışını ölç | İki kanal bağımsız kesilmeli |

---

## 4. SAT Hazırlık ve Uygulama

### SAT Öncesi Kontrol Listesi

- [ ] FAT protokolü imzalanmış ve teslim edilmiş
- [ ] Saha montajı tamamlanmış (SAHA-014 onaylı)
- [ ] I/O checkout (SAHA-010) tamamlanmış
- [ ] Tüm saha cihazları devreye alınmış
- [ ] Network bağlantıları test edilmiş
- [ ] SAT tarih ve katılımcılar teyit edilmiş

### SAT Uygulama Sırası

```
SAT Günü 1:
  08:00  Açılış toplantısı — kapsam ve güvenlik kuralları
  09:00  Saha tur (walk-down) — montaj gözden geçirme
  10:00  Güç verme sekansı (ilk enerji prosedürü)
  11:00  I/O doğrulama (gerçek saha sinyalleri)
  14:00  Fonksiyonel testler (üretim simülasyonu)
  16:00  Alarm ve interlock testleri
  17:00  Günlük değerlendirme toplantısı

SAT Günü 2 (gerekirse):
  09:00  Punch list kalemlerinin düzeltilmesi
  11:00  Operatör eğitimi
  14:00  Final run (gerçek üretim koşullarında)
  16:00  SAT protokolünün imzalanması
  17:00  Devir teslim toplantısı
```

---

## 5. Test Kategorileri ve Örnekleri

### Kategori A — Zorunlu (FAT ve SAT'ta her zaman)
- Tüm I/O sinyalleri
- Acil stop ve güvenlik devreleri
- Temel çalışma/durdurma sekansı
- Kritik alarm ve interlocklar

### Kategori B — Önemli (FAT'ta tam, SAT'ta örnekleme)
- Tüm alarm ve uyarılar
- Ekipman koruma mantığı
- PID kontrol döngüleri
- HMI navigasyon ve ekranlar

### Kategori C — Fonksiyonel (SAT'ta)
- Reçete/program seçimi
- Raporlama ve historian
- Uzaktan erişim (VPN/remote)
- Operatör yetkisi ve şifre

---

## 6. Kabul Kriterleri

### Geçti / Kaldı Kuralları

| Durum | Kriter |
|-------|--------|
| ✅ GEÇTI | Test beklenen sonuçla tam eşleşiyor |
| ⚠️ KOŞULLU | Küçük sapma var, yazılı kabul edildi + düzeltme tarihi |
| ❌ KALDI | Beklenen sonuç sağlanamadı — düzeltme + yeniden test |
| ➡️ ERTELENDI | Test ortamı uygun değil, SAT'a ertelendi |

### Kategorik Kabul Kuralları

| Kategori | Kural |
|----------|-------|
| Acil stop / güvenlik | **%100 geçmeli** — tek hata bile imzalanmaz |
| I/O checkout | **%100 geçmeli** |
| Fonksiyonel testler | **%95 geçmeli** — kalan kalemler yazılı taahhütle |
| Kategori C testler | **%90 geçmeli** |

---

## 7. FAT Protokol Formu

```
╔══════════════════════════════════════════════════════════╗
║            FAT (FABRİKA KABUL TESTİ) PROTOKOLÜ          ║
╠══════════════════════════════════════════════════════════╣
║ Proje Adı   :                                            ║
║ Müşteri     :                                            ║
║ Entegratör  :                                            ║
║ Test Tarihi :                   Test Yeri:               ║
║ PLC Modeli  :                   SW Versiyonu:            ║
╚══════════════════════════════════════════════════════════╝

A. DONANIM KONTROLÜ
──────────────────────────────────────────────────────────
 No │ Kontrol Kalemi                │ Sonuç │ Not
────┼───────────────────────────────┼───────┼────────────
 1  │ PLC CPU modeli                │       │
 2  │ I/O modül tipi ve sayısı      │       │
 3  │ Güç kaynağı voltajı           │       │
 4  │ UPS testi                     │       │
 5  │ Topraklama direnci            │       │
 6  │ Pano IP sınıfı                │       │

B. I/O CHECKOUT — ÖZET
──────────────────────────────────────────────────────────
 Toplam DI :        Test Edilen:        Geçti:        Kaldı:
 Toplam DO :        Test Edilen:        Geçti:        Kaldı:
 Toplam AI :        Test Edilen:        Geçti:        Kaldı:
 Toplam AO :        Test Edilen:        Geçti:        Kaldı:

 Detay liste eki: I/O Checkout Formu (Ek-1)

C. FONKSİYONEL TEST — ÖZET
──────────────────────────────────────────────────────────
 Toplam Senaryo:        Geçti:        Kaldı:        Ertelendi:

 Detay liste eki: Fonksiyonel Test Formu (Ek-2)

D. ACİL STOP TESTİ
──────────────────────────────────────────────────────────
 Sonuç: ☐ GEÇTI (tüm E-stop noktaları)   ☐ KALDI

E. PUNCH LİST (Açık Kalemler)
──────────────────────────────────────────────────────────
 No │ Açıklama │ Kategori (A/B/C) │ Termin │ Sorumlu
────┼──────────┼──────────────────┼────────┼─────────
  1 │          │                  │        │
  2 │          │                  │        │

F. GENEL SONUÇ
──────────────────────────────────────────────────────────
 ☐ ONAYLANDI — Punch list kalemlerine koşullu
 ☐ KISMI ONAY — Sadece onaylı bölümler teslim alındı
 ☐ REDDEDİLDİ — Yeniden test gerekli

ONAYLAR
──────────────────────────────────────────────────────────
 Entegratör                    Müşteri Temsilcisi

 Ad/Soyad: _______________     Ad/Soyad: _______________
 Ünvan   : _______________     Ünvan   : _______________
 İmza    : _______________     İmza    : _______________
 Tarih   : _______________     Tarih   : _______________
```

---

## 8. SAT Protokol Formu

```
╔══════════════════════════════════════════════════════════╗
║            SAT (SAHA KABUL TESTİ) PROTOKOLÜ             ║
╠══════════════════════════════════════════════════════════╣
║ Proje Adı   :                                            ║
║ Müşteri     :                                            ║
║ Entegratör  :                                            ║
║ Test Tarihi :                   Saha Konumu:             ║
╚══════════════════════════════════════════════════════════╝

A. FAT PUNCH LİST DOĞRULAMA
──────────────────────────────────────────────────────────
 FAT'ta açık kalan tüm A ve B kategorisi kalemler
 kapatıldı mı?
 ☐ Evet — Tüm kalemler kapatıldı
 ☐ Hayır — Detay: ________________________________

B. SAHA I/O DOĞRULAMA (Örnekleme)
──────────────────────────────────────────────────────────
 Örnekleme oranı: %20 (veya kritik sinyallerin tamamı)
 Test Edilen:          Geçti:          Kaldı:

C. FONKSİYONEL TEST — SAHA KOŞULLARI
──────────────────────────────────────────────────────────
 ☐ Normal başlatma/durdurma sekansı     Sonuç:
 ☐ Acil stop (tüm noktalar)             Sonuç:
 ☐ Kritik alarm ve interlocklar         Sonuç:
 ☐ Üretim simülasyonu (tam çevrim)      Sonuç:

D. DEVİR TESLİM KONTROLLERİ
──────────────────────────────────────────────────────────
 ☐ As-built PLC projesi teslim edildi
 ☐ As-built elektrik şemaları teslim edildi
 ☐ Kullanım kılavuzu teslim edildi
 ☐ Bakım talimatı teslim edildi
 ☐ Yedek parça listesi teslim edildi
 ☐ Operatör eğitimi tamamlandı (katılımcı listesi ekte)
 ☐ Remote erişim bilgileri teslim edildi

E. GARANTİ BİLGİLERİ
──────────────────────────────────────────────────────────
 Garanti Başlangıcı : _______________
 Garanti Bitiş      : _______________ (__ ay)
 Garanti Kapsamı    : ________________________________
 Servis İletişim    : ________________________________

F. GENEL SONUÇ
──────────────────────────────────────────────────────────
 ☐ SİSTEM TESLİM ALINDI
 ☐ KOŞULLU TESLİM — Açık kalem(ler): _______________

ONAYLAR
──────────────────────────────────────────────────────────
 Entegratör                    Müşteri Temsilcisi

 Ad/Soyad: _______________     Ad/Soyad: _______________
 Ünvan   : _______________     Ünvan   : _______________
 İmza    : _______________     İmza    : _______________
 Tarih   : _______________     Tarih   : _______________
```

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Olası Neden | Çözüm |
|-------|-------------|-------|
| Analog sinyal ölçekleme hatalı | Yanlış raw min/max değeri | FC_Scale parametrelerini kontrol et |
| Geri bildirim timeout alarmı | Kablo hatası veya cihaz arızası | I/O ile saha cihazını ayrı test et |
| E-Stop reset sonrası otomatik start | Reset mantığı hatalı | Reset → onay → start sekansını gözden geçir |
| Alarm geçmişi kayboldu | Historian bağlantısı kesilmiş | OPC bağlantısını ve buffer ayarlarını kontrol et |
| HMI-PLC iletişim kopuyor | Network yükü yüksek | Cycle time ve scan rate ayarlarını optimize et |
| Profinet cihaz bulunamıyor | Device name uyuşmuyor | GSD dosyası ve device name eşleşmesini kontrol et |

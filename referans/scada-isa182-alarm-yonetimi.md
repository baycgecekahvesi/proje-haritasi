# ISA-18.2 Alarm Yönetim Sistemi Referansı
**Standart**: ANSI/ISA-18.2-2016 | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [Alarm Yönetim Yaşam Döngüsü](#1-yasam-dongusu)
2. [Alarm Önceliklendirme](#2-onceliklendirme)
3. [Alarm Konfigürasyon Parametreleri](#3-parametreler)
4. [Kötü Alarm Belirtileri ve Çözümleri](#4-kotu-alarm)
5. [Alarm Rasyonalizasyonu](#5-rasyonalizasyon)
6. [KPI ve Performans Ölçütleri](#6-kpi)
7. [Alarm Veritabanı Şablonu](#7-veritabani)
8. [Alarm Konfigürasyon Örnekleri](#8-ornekler)

---

## 1. Alarm Yönetim Yaşam Döngüsü

```
          ┌──────────────┐
          │  1. Felsefe  │  ← Alarm nedir? Tanım
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │2. Tanımlama  │  ← Hangi alarmlar olmalı?
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │3. Rasyonel.  │  ← Her alarm neden var?
          └──────┬───────┘     HAZOP / FMEA ile
                 ↓
          ┌──────────────┐
          │4. Tasarım    │  ← Limit, öncelik, setpoint
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │ 5. Uygulama  │  ← SCADA'ya gir
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │ 6. Çalıştırma│  ← Operatör kullanımı
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │7. İzleme/KPI │  ← Chattering, flood kontrolü
          └──────┬───────┘
                 ↓
          ┌──────────────┐
          │ 8. İyileştirme│ ← Sorunlu alarmları düzelt
          └──────────────┘
```

### Alarm Tanımı (ISA-18.2)

> Alarm: Bir proses değişkeninin operatörün müdahalesini gerektiren kritik bir koşula ulaştığını bildiren **sesli ve/veya görsel uyarı.**

**Alarm OLMAYAN şeyler:**
- Bilgi mesajları ("Pompa başlatıldı" — bu bir EVENT)
- Operatörün müdahale etmesine gerek olmayan uyarılar
- Her 30 saniyede bir tetiklenen "chattering" sinyaller

---

## 2. Alarm Önceliklendirme

### 4 Seviyeli Öncelik Sistemi

| Öncelik | Renk | Tepki Süresi | Tanım |
|---------|------|-------------|-------|
| **1 — Kritik** | 🔴 Kırmızı | < 5 dakika | Güvenlik, çevre, büyük ekipman hasarı riski. Anında müdahale. |
| **2 — Yüksek** | 🟠 Turuncu | 5–15 dakika | Önemli üretim kaybı veya ekipman hasarı riski. |
| **3 — Orta** | 🟡 Sarı | 15–60 dakika | Ürün kalitesi veya verimlilik etkisi. |
| **4 — Düşük** | ⚪ Beyaz/Gri | > 60 dakika | Düzeltici aksiyon gerekli ama zamanı var. |

### Önceliklendirme Karar Ağacı

```
Bu alarm tetiklendiğinde ne olur?
         │
         ├─ Kişi yaralanabilir / çevre zarar görür?
         │         → Öncelik 1 (KRİTİK)
         │
         ├─ Büyük ekipman hasarı / uzun süreli duruş?
         │         → Öncelik 1 (KRİTİK)
         │
         ├─ Anında müdahale (< 15 dk) yapılmazsa üretim durur?
         │         → Öncelik 2 (YÜKSEK)
         │
         ├─ 1 saat içinde müdahale edilmezse kayıp var?
         │         → Öncelik 3 (ORTA)
         │
         └─ Bilgi amaçlı, müdahale süresi > 1 saat?
                   → Öncelik 4 (DÜŞÜK) veya EVENT

```

### Öncelik Dağılımı Hedefleri (ISA-18.2)

| Öncelik | Hedef Dağılım |
|---------|--------------|
| Kritik (1) | ≤ %5 |
| Yüksek (2) | ≤ %15 |
| Orta (3) | ≤ %30 |
| Düşük (4) | ≥ %50 |

> **Dikkat**: Kritik alarm oranı %20'yi aşıyorsa rasyonalizasyon şart.

---

## 3. Alarm Konfigürasyon Parametreleri

### Her Alarm İçin Tanımlanması Gereken Parametreler

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `Tag` | PLC tag adı | `TANK1_LVL_PV` |
| `Alarm Tipi` | HH, H, L, LL, DevH, DevL, RoC | `H` |
| `Setpoint` | Alarm tetikleme değeri | `85.0` |
| `Birim` | Mühendislik birimi | `%` |
| `Dead-band` | Histerezis (salınım önleme) | `2.0` |
| `Öncelik` | 1-4 | `2` |
| `Mesaj` | Türkçe açıklama | `Tank-1 Yüksek Seviye` |
| `Operatör Aksiyonu` | Ne yapmalı | `Besleme vanasını kapat` |
| `Delay (On)` | Gecikme (milisaniye) | `5000` ms |
| `Suppression` | Hangi koşulda bastırılır | `TANK1_DRAIN_CMD` |
| `Shelving` | İzin verilen max süre | `8 saat` |
| `Rasyonalizasyon` | Neden var, ne için | `Taşma önleme` |

### Alarm Tipleri

```
HH  = High High (Çok Yüksek)      — genellikle Öncelik 1
H   = High (Yüksek)               — genellikle Öncelik 2-3
L   = Low (Düşük)                 — genellikle Öncelik 2-3
LL  = Low Low (Çok Düşük)         — genellikle Öncelik 1
DevH = Positive Deviation High    — SP'den sapma (+)
DevL = Negative Deviation Low     — SP'den sapma (-)
RoC  = Rate of Change             — hızlı değişim
```

### Dead-band (Histerezis) Ayarı

```
Dead-band olmadan (KÖTÜ):
  Değer = 85.1%  → ALARM AKTİF
  Değer = 84.9%  → alarm cleared
  Değer = 85.1%  → ALARM AKTİF  ← 5 saniyede 100 kez!
  → Chattering!

Dead-band = 2% ile (İYİ):
  Değer = 85.1%  → ALARM AKTİF  (setpoint: 85%)
  Değer = 84.9%  → hâlâ aktif   (dead-band içinde)
  Değer = 82.9%  → alarm cleared (85 - 2 = 83%)
  → Kararlı!
```

### On-Delay Kullanımı

```
On-Delay (gecikme) ne zaman kullanılır:
  ✓ Kısa süreli (geçici) tetiklemeler alarm üretiyorsa
  ✓ Start-up sırasında geçici anomaliler bekleniyor
  ✓ Mekanik salınım (vibrasyon sensörleri)

Tipik değerler:
  Basınç, sıcaklık alarmları : 3–10 saniye
  Seviye alarmları            : 10–30 saniye
  Akış alarmları              : 5–15 saniye
  Acil stop / güvenlik        : 0 ms (anında)
```

---

## 4. Kötü Alarm Belirtileri ve Çözümleri

### Chattering Alarm

**Tanım**: Aynı alarm 10 dakika içinde 3'ten fazla kez tetikleniyor.

```
Belirtiler:
  → Alarm listesi sürekli değişiyor
  → Operatör "bu alarmı hep ignore ediyoruz" diyor
  → Alarm log'da binlerce satır aynı alarm

Çözümler:
  1. Dead-band artır
  2. On-delay ekle veya artır
  3. Alarm kaldır (gerekli değilse)
  4. EVENT'e dönüştür (operatör müdahalesi gerekmiyorsa)
```

### Alarm Flood (Sel)

**Tanım**: 10 dakikada 10'dan fazla alarm (ISA-18.2 kriteri).

```
Belirtiler:
  → Başlatma/kapanma sırasında yüzlerce alarm
  → Bir arıza sonrası "alarm yağmuru"
  → Operatör "hangi alarmı önce bakayım?" diyor

Çözümler:
  1. Neden-sonuç analizi — kök alarm kimdir?
  2. Kök alarm aktifken yan alarmları bastır (suppression)
  3. Başlatma/kapanma modu: bazı alarmları geçici devre dışı bırak
  4. State-based alarming uygula
```

### Nuisance (Rahatsız Edici) Alarm

**Tanım**: Operatörün düzenli olarak acknowledge edip geçtiği, müdahale etmediği alarm.

```
Belirtiler:
  → Operatör "bu alarm hep var, önemli değil" diyor
  → Acknowledge edildiğinde hiçbir aksiyon alınmıyor
  → Aynı alarm her vardiyanın yarısında aktif

Çözümler:
  1. Setpoint'i gerçekçi değere çek
  2. Önceliği düşür veya EVENT'e dönüştür
  3. Suppression koşulu ekle
  4. Kalıcı olarak kaldır
```

---

## 5. Alarm Rasyonalizasyonu

### Her Alarm İçin Sorulacak Sorular

```
1. Bu alarm neden var?
   → Hangi tehlike veya kayıpı önlüyor?

2. Operatör ne yapacak?
   → Müdahale talimatı var mı ve uygulanabilir mi?

3. Tepki süresi yeterli mi?
   → Alarm tetiklendikten sonra operatörün hareket etmesi için zaman var mı?

4. Öncelik doğru mu?
   → Müdahale süresine göre öncelik belirlendi mi?

5. Setpoint doğru mu?
   → Normal çalışma bandı dışında mı?

6. Dead-band ayarlandı mı?
   → Chattering riski var mı?
```

### Rasyonalizasyon Formu

```
Alarm Rasyonalizasyon Kaydı
─────────────────────────────────────────────────────
Tag          : TANK1_LVL_H
Alarm Tipi   : High (H)
Setpoint     : 85 %
Dead-band    : 2 %
Öncelik      : 2 (Yüksek)

SEBEP (Why does this alarm exist?):
  Tank-1 kapasitesi 90%'de taşmaya başlar.
  Operatöre 15 dakika önceden uyarı verilmeli.

OPERATÖR AKSİYONU:
  1. Besleme pompasını yavaşlat (FIC-101 SP'yi düşür)
  2. Tank-2'ye transfer başlat (XV-201 aç)
  3. 5 dakika içinde azalmıyorsa Şef'i ara

TEPKI SÜRESİ: 15 dakika (yeterli ✓)

ONAYLAYAN: [Ad] | TARİH: __.__.____
─────────────────────────────────────────────────────
```

---

## 6. KPI ve Performans Ölçütleri

### ISA-18.2 Hedef Değerleri

| KPI | Hedef | Ölçüm Periyodu |
|-----|-------|----------------|
| Alarm hızı (normal çalışma) | < 1 alarm / 10 dakika | Sürekli |
| Alarm hızı (maksimum kabul) | < 10 alarm / 10 dakika | Sürekli |
| Alarm flood süresi | < %1 çalışma zamanı | Aylık |
| Chattering alarm sayısı | 0 (hedef) | Haftalık |
| En kötü 10 alarm | İzle, azalt | Aylık |
| Shelved alarm süresi | < 24 saat tipik | Haftalık |
| Alarm öncelik dağılımı | Kritik ≤ %5 | Aylık |

### Aylık Alarm Performans Raporu Şablonu

```
AYLIK ALARM PERFORMANS RAPORU
Proje: _______ | Dönem: __.____

1. GENEL İSTATİSTİKLER
   Toplam alarm sayısı      : ___
   Ortalama alarm/10dk      : ___ (Hedef: <1)
   Flood olay sayısı        : ___ (Hedef: 0)
   Chattering alarm sayısı  : ___ (Hedef: 0)

2. ÖNCELİK DAĞILIMI
   Kritik (1): ___ % (Hedef: ≤5%)
   Yüksek (2): ___ % (Hedef: ≤15%)
   Orta   (3): ___ % (Hedef: ≤30%)
   Düşük  (4): ___ % (Hedef: ≥50%)

3. EN SORUNLU 10 ALARM (Chattering/Nuisance)
   1. [Tag] — [Açıklama] — [Tetiklenme sayısı]
   ...

4. AÇIK AKSİYONLAR
   [Geçen ay belirlenen sorunlarda ilerleme]

5. YENİ AKSİYONLAR
   [Bu ay çözülmesi gereken sorunlar]
```

---

## 7. Alarm Veritabanı Şablonu

```
ALARM VERİTABANI — [Proje Adı]
Versiyon: 1.0 | Tarih: GG.AA.YYYY

Kolon açıklaması:
AlarmID    : Benzersiz alarm numarası (ALM-0001)
Tag        : PLC tag adı
Alan       : Sistem/alan adı
AlarmTipi  : HH/H/L/LL/DevH/DevL/RoC
SP         : Setpoint değeri
Birim      : Mühendislik birimi
DeadBand   : Histerezis değeri
OnDelay_ms : Tetikleme gecikmesi (ms)
Oncelik    : 1/2/3/4
Mesaj_TR   : Türkçe alarm mesajı
Aksiyon    : Operatör yapması gereken
Suppressed : Hangi koşulda bastırılır
MaxShelf_h : Max shelving süresi (saat)
Rasyonel   : Neden var (kısa)

──────────────────────────────────────────────────────────────────────
AlarmID   │ Tag             │ Tip │ SP    │ DB  │ Önc │ Mesaj
──────────┼─────────────────┼─────┼───────┼─────┼─────┼────────────
ALM-0001  │ TANK1_LVL_PV   │ HH  │ 92%   │ 1%  │  1  │ Tank-1 Çok Yüksek Seviye — Taşma Riski
ALM-0002  │ TANK1_LVL_PV   │ H   │ 85%   │ 2%  │  2  │ Tank-1 Yüksek Seviye
ALM-0003  │ TANK1_LVL_PV   │ L   │ 20%   │ 2%  │  2  │ Tank-1 Düşük Seviye
ALM-0004  │ TANK1_LVL_PV   │ LL  │ 10%   │ 1%  │  1  │ Tank-1 Çok Düşük Seviye — Pompa Koruması
ALM-0005  │ BOILER1_TEMP_PV│ HH  │ 180°C │ 2°C │  1  │ Kazan-1 Aşırı Sıcaklık — Acil Durdur
ALM-0006  │ BOILER1_TEMP_PV│ H   │ 165°C │ 3°C │  2  │ Kazan-1 Yüksek Sıcaklık
ALM-0007  │ PUMP1_RUN_FBK  │ DevH│ —     │ —   │  2  │ Pompa-1 Çalışma Geri Bildirimi Yok
```

---

## 8. Alarm Konfigürasyon Örnekleri

### WinCC Alarm Konfigürasyonu

```
WinCC Alarm Logging → Analog Alarm Ekleme:
  Tag        : TANK1_LVL_PV
  Limit      : 85.0
  Dead-band  : 2.0
  Delay      : 10000 ms
  Priority   : 2
  Group      : TANKLAR
  Message    : "Tank-1 Yüksek Seviye - Beslemeyi Azalt"
  Class      : ALARM (sarı arka plan)
  
  Gelişmiş → Suppression:
    Condition tag: TANK1_DRAIN_CMD
    Condition    : = 1
```

### Ignition Alarm Konfigürasyonu

```
Tag → Alarm → + Ekle
  Mode       : Above setpoint
  Setpoint   : 85.0
  Dead-band  : 2.0
  Time On    : 10s
  Priority   : High
  Display path: Tanklar/Tank-1/Seviye
  Label      : Tank-1 Yüksek Seviye
  Notes      : Besleme pompasını yavaşlat (FIC-101)
  
  Active Pipeline  : AlarmNotification
  Clear Pipeline   : (boş)
  Ack Pipeline     : (boş)
```

### Tipik Analog Alarm Seti (Sıcaklık)

```
Tag: BOILER1_TEMP_PV | Normal Çalışma: 140–165°C

Alarm   │ Setpoint │ Dead-band │ Delay │ Öncelik
────────┼──────────┼───────────┼───────┼─────────
HH      │ 180 °C   │ 2 °C      │ 2 sn  │ 1 (KRİTİK)
H       │ 165 °C   │ 3 °C      │ 10 sn │ 2 (YÜKSEK)
L       │ 140 °C   │ 3 °C      │ 10 sn │ 3 (ORTA)
LL      │ 120 °C   │ 2 °C      │ 2 sn  │ 2 (YÜKSEK)
RoC+    │ +5°C/dk  │ 1°C/dk    │ 30 sn │ 3 (ORTA)

Mesajlar:
HH → "Kazan-1 Aşırı Sıcaklık! Acil Durdur Prosedürü Uygula"
H  → "Kazan-1 Yüksek Sıcaklık — Yakıt Debisini Azalt"
L  → "Kazan-1 Düşük Sıcaklık — Yakıt Debisini Artır"
LL → "Kazan-1 Çok Düşük Sıcaklık — Isıtma Verimini Kontrol Et"
```

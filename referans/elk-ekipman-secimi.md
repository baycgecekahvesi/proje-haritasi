# Ekipman Seçimi Rehberi
**Kapsam**: PLC / HMI / SCADA / VFD / Motor / Sensör | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [PLC Platform Seçimi](#1-plc)
2. [HMI / Operatör Panel Seçimi](#2-hmi)
3. [Frekans Sürücüsü (VFD) Seçimi ve Boyutlandırma](#3-vfd)
4. [Motor Seçimi](#4-motor)
5. [Sensör Seçimi](#5-sensor)
6. [Genel Ekipman Karşılaştırma Şablonu](#6-karsilastirma)

---

## 1. PLC Platform Seçimi

### Karar Kriterleri

| Kriter | Düşük Öncelik | Orta Öncelik | Yüksek Öncelik |
|--------|--------------|-------------|---------------|
| I/O noktası sayısı | <64 | 64–512 | >512 |
| İşlem hızı | ms yanıt yeterli | <10ms | <1ms (motion) |
| Safety gerekliliği | Yok | SIL 1 | SIL 2–3 |
| Haberleşme | Modbus yeterli | Profinet/EIP | Yoğun network |
| Mühendis deneyimi | — | — | En önemli faktör |
| Servis ağı | — | — | Türkiye'de mevcut mu? |

### Ana Platformlar Karşılaştırması

| Kriter | Siemens S7-1200/1500 | Allen-Bradley 5069/5380 | Beckhoff CX/EK | Schneider M340/580 |
|--------|---------------------|------------------------|----------------|-------------------|
| Market payı (TR) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Programlama aracı | TIA Portal | Studio 5000 | TwinCAT 3 | Unity Pro/EcoStruxure |
| Fieldbus | Profinet (natif) | EtherNet/IP (natif) | EtherCAT (natif) | Modbus/Profibus |
| Motion control | Entegre (S7-1500T) | Kinetix entegrasyon | Güçlü (servo) | Sınırlı |
| Safety | F-CPU ayrı | GuardLogix entegre | TwinSAFE | SIL2 modüller |
| Maliyet endeksi | Orta-Yüksek | Yüksek | Orta | Orta |
| Türkiye servisi | Çok iyi | İyi | Orta | İyi |

### Siemens S7 CPU Seçim Rehberi

```
S7-1200:
  CPU 1211C → 6 DI / 4 DO / 2 AI — Çok küçük uygulamalar
  CPU 1212C → 8 DI / 6 DO / 2 AI
  CPU 1214C → 14 DI / 10 DO / 2 AI — Küçük/orta makine
  CPU 1215C → 14 DI / 10 DO / 2 AI + 2 AO + 2 haberleşme
  CPU 1217C → 14 DI / 10 DO / Yüksek hızlı sayıcı + motion

S7-1500:
  CPU 1511   → Orta büyüklük, Profinet
  CPU 1513   → Büyük tesis, yüksek performans
  CPU 1515   → Çok büyük, çoklu Profinet port
  CPU 1516   → En yüksek performans
  CPU 1518   → 4 core, paralel işlem
  CPU 1511F  → Safety (SIL2/3) — F-CPU
  CPU 1515T  → Technology (motion + standart birlikte)

ET 200SP (Uzak I/O):
  → S7-1200 ve S7-1500 ile Profinet üzerinden
  → 64'e kadar I/O modülü
  → CPU modülü de takılabilir (standalone)
```

### I/O Modül Seçimi

```
Dijital Giriş (DI):
  24VDC sinyal: SM 1221 (S7-1200) / DI 16×24VDC (S7-1500)
  120/230VAC sinyal: SM 1221 AC modülü
  Yüksek hızlı sayıcı: CPU üzerindeki HSC girişler

Dijital Çıkış (DO):
  Transistör çıkış (24VDC yük): Hızlı, elektrikli, uzun ömür
  Röle çıkış (AC/DC yük, 230VAC'a kadar): Yavaş, mekanik aşınma var

Analog Giriş (AI):
  4-20mA veya 0-10V: SM 1231 / AI 8×13Bit
  PT100/PT1000 (RTD): SM 1231 RTD modülü
  Termokopl (J/K/T tipi): SM 1231 TC modülü
  Yüksek çözünürlük: 16-bit modüller (hassas kontrol için)

Analog Çıkış (AO):
  4-20mA: SM 1232 / AO 4×16Bit
  0-10V + 4-20mA kombo: Çoğu modül ikisini de destekler
```

---

## 2. HMI / Operatör Panel Seçimi

### Panel Tipi Karar Ağacı

```
Sabit montaj mı, seyyar mı?
├── Sabit (makine panosu veya kontrol odası)
│   ├── <7": Basit görüntüleme → Dokunmatik KTP / Siemens TP
│   ├── 7"–12": Orta uygulamalar → Multi-touch TP700/900/1200
│   ├── 15"–22": Karmaşık makine → Industrial PC veya büyük panel
│   └── >24": Kontrol odası → PC tabanlı SCADA istasyonu
│
└── Seyyar (el tipi)
    ├── ATEX bölge: Özel IS onaylı panel
    └── Normal bölge: Mobile Panel 277/700 IWLAN
```

### Siemens HMI Seçim Rehberi

| Model | Ekran | Haberleşme | Kullanım |
|-------|-------|-----------|---------|
| KTP400 Basic | 4.3" TFT | Profinet | Basit görev paneli |
| KTP700 Basic | 7" TFT | Profinet | Küçük makine |
| KTP900 Basic | 9" TFT | Profinet | Orta makine |
| TP700 Comfort | 7" TFT | Profinet + MPI | Tarih, alarm, trend |
| TP900 Comfort | 9" TFT | Profinet + MPI | Endüstriyel standart |
| TP1200 Comfort | 12" TFT | Profinet + RS-422/485 | Büyük makine |
| IPC277D | 15" PC | Ethernet + RS-232/485 | SCADA lite |

### IP ve Ortam Koruması

```
Ön panel: IP65 (su jeti koruması) — fabrika standardı
Arka taraf: IP20 (pano içi)

Gıda/ilaç sektörü: IP69K (yüksek basınçlı su jeti)
Kimya / ATEX: Ex sınıfı panel (özel tedarikçi)
```

---

## 3. Frekans Sürücüsü (VFD) Seçimi ve Boyutlandırma

### Boyutlandırma Adımları

**ADIM 1 — Motor Akımını Tespit Et**
```
Motor etiketi FLA (Full Load Amps) değerini kullan.
Hesapla: I_motor = P / (√3 × V × cosφ × η)
```

**ADIM 2 — Sürücü Akım Seçimi**
```
Normal yük (konveyör, fan, pompa):
  I_sürücü ≥ I_motor × 1.0

Ağır yük (ezici, karıştırıcı, yüksek atalet):
  I_sürücü ≥ I_motor × 1.1 – 1.2

Aşırı yük (kompresör, vince):
  Yüksek aşırı yük kapasiteli sürücü seç (150% × 60s)
```

**ADIM 3 — Kablo ve Reaktör**
```
Motor kablosu > 50m → Output reaktör ekle
Motor kablosu > 100m → du/dt filtresi veya sinus filtresi
Harmonik sorunu bekleniyor → Input reaktör veya AHF
EMC gereksinimi → EMC filtresi (dahili veya harici)
```

### VFD Parametre Kontrol Listesi (Devreye Almada)

```
MOTOR PARAMETRELERİ (motor etiketinden):
  □ Motor gücü (kW): _____
  □ Motor gerilimi (V): 400V Y / 690V D
  □ Motor akımı (A — FLA): _____
  □ Motor frekansı (Hz): 50
  □ Motor hızı (rpm): _____
  □ Motor cosφ: _____

KONTROL PARAMETRELERİ:
  □ Kontrol modu: V/f / Vektör / Kapalı çevrim
  □ Min. frekans (Hz): _____  (tipik: 5 Hz)
  □ Max. frekans (Hz): _____ (tipik: 50 Hz)
  □ Hızlanma süresi (s): _____ (tipik: 5–30 s)
  □ Yavaşlama süresi (s): _____
  □ Aşırı akım koruması (A): _____ (= FLA × 1.05)

HABERLEŞME PARAMETRELERİ (eğer varsa):
  □ Profinet device name: _____
  □ IP adresi: _____
  □ Kontrol kelimesi format: _____
  □ Hız referans format: _____ (Hz × 10 veya %)

AUTO-TUNE:
  □ Statik Auto-tune yapıldı (motor dönmeden)
  □ Dinamik Auto-tune yapıldı (motor dönerek — mümkünse)
```

### Popüler VFD Modelleri (Türkiye Pazarı)

| Marka / Model | Güç Aralığı | Öne Çıkan Özellik | Haberleşme |
|---|---|---|---|
| Siemens G120 / G120C | 0.37–250 kW | TIA entegrasyonu, Safety | Profinet, Profibus |
| ABB ACS580 / ACS880 | 0.75–500 kW | Genel amaç / endüstri | Profinet, EIP, Modbus |
| Danfoss FC302 | 0.25–1400 kW | Pompa/fan optimize | Profibus, EIP, Modbus |
| Schneider ATV320/630 | 0.18–800 kW | EcoStruxure entegrasyon | Modbus, Profinet |
| Yaskawa GA700 | 0.4–630 kW | Yüksek tork, hız kontrolü | EtherNet/IP, Modbus |
| Delta C2000 | 0.75–355 kW | Ekonomik, geniş ürün yelpazesi | Modbus TCP |

---

## 4. Motor Seçimi

### Motor Tipi Karar Ağacı

```
Uygulama tipi nedir?
│
├── Sabit hız, basit başlatma
│   → Asenkron motor + direkt start veya Y/Δ start
│
├── Değişken hız gerekli
│   → Asenkron motor + VFD (en yaygın)
│   → Senkron relüktans motor + VFD (verimli)
│
├── Hassas konum/hız kontrolü
│   → Servo motor + servo sürücü
│
├── Yüksek tork, düşük hız (redüktörsüz)
│   → Tork motoru veya DD (direct drive)
│
└── ATEX / Patlayıcı ortam
    → Ex d (flameproof) veya Ex e (increased safety) motor
```

### Motor Boyutlandırma

```
GÜÇ HESABI:
  P_motor = (F × v) / η_mekanik        [Lineer hareket]
  P_motor = (T × n) / (9550 × η)       [Döner hareket]
  P_motor = (Q × ΔP) / (η_pompa × η_motor × 1000)  [Pompa]
  P_motor = (Q × ΔP) / (η_fan × η_motor × 1000)    [Fan]

GÜVENLIK FAKTÖRÜ:
  Hafif yük (fan, pompa): × 1.15
  Normal yük (konveyör): × 1.20
  Ağır yük (karıştırıcı): × 1.25
  Darbe yükü (viye, pres): × 1.30 – 1.50

STANDART GÜÇ SERİSİ (kW):
  0.09, 0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2,
  3.0, 4.0, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75,
  90, 110, 132, 160, 200, 250, 315, 400, 500 kW
```

### Verimlilik Sınıfları (IEC 60034-30-1)

| Sınıf | Tanım | Zorunluluk |
|-------|-------|----------|
| IE1 | Standard Efficiency | AB'de yeni satışa yasak (>0.75 kW) |
| IE2 | High Efficiency | 2011'den itibaren AB standardı |
| IE3 | Premium Efficiency | Direktife göre VFD'li IE2 = IE3 |
| IE4 | Super Premium | Yeni nesil, hızlı yaygınlaşıyor |
| IE5 | Ultra Premium | Senkron relüktans veya PM motor |

> **AB direktifi**: 0.75–1000 kW arası motorlar IE3 olmalı (2021'den itibaren)

### Motor Koruma Seçimi

```
Doğrudan başlatma (direkt start):
  → Termik manyetik MCB (motor tip, eğri D veya K)
  → Termik röle (bimetal, ayrı)
  → Kontaktör + termik röle kombino (IEC 60947-4-1)

VFD ile başlatma:
  → Sadece VFD girişine MCB (şebeke tarafı kısa devre koruması)
  → VFD kendi akım korumasını yapar
  → Motor tarafında sigorta veya termik röle KOYMA

Soft starter ile başlatma:
  → MCB + Soft starter + Termik röle (veya soft starter dahili koruma)
```

---

## 5. Sensör Seçimi

### Sensör Tipi Hızlı Karar Tablosu

| Ölçüm | Teknoloji | Kısa Bilgi |
|-------|-----------|----------|
| Sıcaklık (genel) | PT100 / PT1000 | -200 – +850°C, hassas |
| Sıcaklık (yüksek) | Termokopl K tipi | -200 – +1260°C, dayanıklı |
| Sıcaklık (temas yok) | IR pyrometer | Hareketli veya sıcak yüzey |
| Basınç (sıvı/gaz) | Piezorezistif transmitter | 4-20mA çıkış, 0.5% doğruluk |
| Seviye (sürekli) | Ultrasonik | Temasız, 0.5–8m |
| Seviye (sürekli) | Radar (GWR) | Gıda, kimya, köpüklü |
| Seviye (nokta) | Kapasitif | Katı/sıvı, ekonomik |
| Seviye (nokta) | Float switch | Basit, mekanik |
| Akış (sıvı) | Elektromanyetik | İletken sıvı, 4-20mA |
| Akış (sıvı) | Ultrasonic (clamp-on) | Temasız, mevcut boru |
| Akış (gaz/buhar) | Vortex | Yüksek sıcaklık |
| Konum (doğrusal) | Potansiyometre / LVDT | Hassas konum |
| Konum (döner) | Enkoder (incremental/abs.) | Motor hız/konum |
| Nesne algılama | Endüktif | Metal, ±1mm hassasiyet |
| Nesne algılama | Kapasitif | Her malzeme |
| Nesne algılama | Optik (fotosel) | Uzun mesafe, renk bağımsız |

### 4-20mA Transmitter Bağlantı Tipleri

```
2-Telli (2-wire) — En yaygın:
  PLC AI+ → [transmitter +] → [transmitter -] → PLC AI-
  Transmitter beslemesi loop üzerinden (15-35V)
  Avantaj: Az kablo, basit bağlantı

3-Telli (3-wire):
  24V+ → Transmitter Vcc
  0V   → Transmitter GND
  Sinyal çıkışı → PLC AI+
  PLC AI- → 0V
  Avantaj: Daha yüksek çıkış akımı kapasitesi

4-Telli (4-wire):
  AC veya DC besleme ayrı
  Sinyal çıkışı ayrı (izoleli)
  Avantaj: Gürültü izolasyonu, uzun mesafe
```

### Sensör Koruma Sınıfı ve Ortam

| Ortam | IP | Malzeme | Özel |
|-------|-----|---------|------|
| Kuru fabrika | IP65 | Plastik | — |
| Islatma / yıkama | IP67–69K | Paslanmaz | Gıda onaylı |
| Kimyasal | IP67 | PVDF / PEEK | Kimyasal direnci kontrol et |
| ATEX Zone 1 | IP65 + Ex ia | — | ATEX sertifikası zorunlu |
| Yüksek sıcaklık | IP65 | — | T max. değerini kontrol et |

---

## 6. Genel Ekipman Karşılaştırma Şablonu

```
EKIPMAN KARŞILAŞTIRMA FORMU
Proje: _________________ | Ekipman Tipi: _____________ | Tarih: _________
Gereksinimler: ___________________________________________________

PUANLAMA: 1=Yetersiz, 3=Yeterli, 5=Mükemmel

Kriter              │ Ağırlık │ [Marka A / Model] │ [Marka B / Model] │ [Marka C / Model]
────────────────────┼─────────┼──────────────────┼──────────────────┼──────────────────
Teknik uyum         │  25%    │        /5         │        /5         │        /5
Fiyat               │  20%    │        /5         │        /5         │        /5
Yerli servis ağı    │  20%    │        /5         │        /5         │        /5
Teslimat süresi     │  15%    │        /5         │        /5         │        /5
Referans / deneyim  │  10%    │        /5         │        /5         │        /5
Yazılım entegrasyonu│  10%    │        /5         │        /5         │        /5
────────────────────┼─────────┼──────────────────┼──────────────────┼──────────────────
Ağırlıklı TOPLAM    │ 100%    │       /5          │       /5          │       /5

Fiyat (KDV hariç)   │         │      ___ TL       │      ___ TL       │      ___ TL
Teslimat süresi     │         │    ___ hafta       │    ___ hafta      │    ___ hafta
Garanti             │         │     ___ ay         │     ___ ay        │     ___ ay

ÖNERİ: [Marka/Model]
GEREKÇE: ______________________________________________________
ONAYLAYAN: _________________ | TARİH: _____________
```

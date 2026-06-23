# Elektrik Tasarım Referansı
**Standart**: IEC 60364 / EN 60204-1 / TS EN 61439 | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [Tek Hat Şeması (SLD) Tasarım Kuralları](#1-sld)
2. [Kablo Kesit Hesabı](#2-kablo-kesit)
3. [Koruma Koordinasyonu](#3-koruma)
4. [Topraklama ve Yıldırım Koruma](#4-topraklama)
5. [Pano Tasarım Standartları (EN 61439)](#5-pano)
6. [EMC ve Kablo Düzeni](#6-emc)
7. [Güç Kalitesi](#7-guc-kalitesi)
8. [Hesap Şablonları](#8-sablonlar)

---

## 1. Tek Hat Şeması (SLD) Tasarım Kuralları

### SLD Hiyerarşisi

```
Ana Dağıtım (MDB - Main Distribution Board)
│   Trafo çıkışı → Ana sigorta → Busbar
│
├── Motor Kontrol Merkezi (MCC)
│   │   Besleme sigortası → Kontaktör → Termik röle → Motor
│   │
│   ├── Motor 1 (Fan, Pompa, Konveyör...)
│   ├── Motor 2
│   └── ...
│
├── PLC Panosu
│   │   İzolasyon trafosu (önerilir) → UPS → PLC güç kaynağı
│   │
│   ├── PLC CPU + I/O modülleri
│   ├── HMI / Panel PC
│   └── Network switch
│
└── Yardımcı Dağıtım
    ├── Aydınlatma
    ├── Priz grubu
    └── İklimlendirme (pano soğutma)
```

### SLD'de Gösterilmesi Zorunlu Bilgiler

| Sembol/Bilgi | Neden Gerekli |
|---|---|
| Trafo gücü (kVA) ve gerilim (kV/V) | Kısa devre hesabı için |
| Kablo kesiti ve cinsi (NYY 3×95mm²) | Koruma koordinasyonu için |
| Sigorta/MCB tipi ve değeri (C32A) | Seçici koruma için |
| Motor gücü (kW) ve FLA (A) | Termik röle ayarı için |
| Bara kesiti (mm²) | Akım taşıma kapasitesi |
| Ölçüm cihazları (ampermetre, voltmetre) | Yerini belirtmek için |
| Topraklama noktaları | Güvenlik |
| Sigorta referans numaraları (F1, F2...) | Bakım ve arıza tespiti |

### SLD Semboller (IEC 60617)

```
──┤├──   Sigorta (fuse)
──/──    Kesici (circuit breaker / MCB)
──[M]──  Motor
──[T]──  Trafo
──◉──    Kontaktör (ana kontak)
──◎──    Termik röle
──▽──    Toprak bağlantısı
~~~      AC kaynak
===      DC kaynak (batarya)
──UPS──  Kesintisiz güç kaynağı
```

---

## 2. Kablo Kesit Hesabı

### Hesap Yöntemi (IEC 60364-5-52)

**ADIM 1 — Tasarım Akımını Hesapla (I_b)**

```
Tek Fazlı Motor:
  I_b = P / (V × cosφ × η)
  P = Güç (W), V = 230V, cosφ = güç faktörü, η = verim

Üç Fazlı Motor:
  I_b = P / (√3 × V × cosφ × η)
  P = Güç (W), V = 400V (faz-faz)

Örnek: 7.5 kW motor, cosφ=0.85, η=0.92
  I_b = 7500 / (1.732 × 400 × 0.85 × 0.92) = 13.84 A
```

**ADIM 2 — Düzeltme Faktörlerini Uygula**

| Faktör | Sembol | Değer | Açıklama |
|--------|--------|-------|----------|
| Ortam sıcaklığı | k₁ | Tabloya bak | >30°C'de düşer |
| Gruplama (kablo sayısı) | k₂ | Tabloya bak | Çok kablo = daha az soğuma |
| Döşeme tipi | — | Tabloya bak | Toprak/hava/trunking |

**Sıcaklık Düzeltme Faktörü k₁ (70°C XLPE, Hava döşeme)**

| Ortam Sıcaklığı | k₁ |
|---|---|
| 25°C | 1.04 |
| 30°C | 1.00 |
| 35°C | 0.96 |
| 40°C | 0.91 |
| 45°C | 0.87 |
| 50°C | 0.82 |

**Gruplama Faktörü k₂ (Kablo tray, dokunur)**

| Kablo Grubu Sayısı | k₂ |
|---|---|
| 1 | 1.00 |
| 2 | 0.80 |
| 3 | 0.70 |
| 4 | 0.65 |
| 5 | 0.60 |
| 6 | 0.57 |
| 7–9 | 0.52 |
| 10–12 | 0.45 |

**ADIM 3 — Düzeltilmiş Akımı Hesapla**

```
I_z_min = I_b / (k₁ × k₂)

Örnek (devam):
  Ortam 40°C → k₁ = 0.91
  4 kablo grubu → k₂ = 0.65
  I_z_min = 13.84 / (0.91 × 0.65) = 23.41 A
```

**ADIM 4 — Kablo Seç (IEC 60364-5-52 Tablo B.52.4)**

Hava döşeme, NYY veya NAYY, 70°C:

| Kesit (mm²) | 2 × İletken (A) | 3/4 × İletken (A) |
|---|---|---|
| 1.5 | 19 | 17.5 |
| 2.5 | 26 | 24 |
| 4 | 35 | 32 |
| 6 | 45 | 41 |
| 10 | 61 | 57 |
| 16 | 81 | 76 |
| 25 | 106 | 99 |
| 35 | 131 | 122 |
| 50 | 158 | 149 |
| 70 | 200 | 187 |
| 95 | 241 | 225 |
| 120 | 278 | 260 |
| 150 | 318 | 299 |
| 185 | 362 | 341 |

> Örnek devam: I_z_min = 23.41 A → **4 mm² seç** (32A ≥ 23.41A ✅)

**ADIM 5 — Gerilim Düşümü Kontrol (IEC 60364-5-52)**

```
Gerilim düşümü (3 fazlı):
  ΔU = √3 × I_b × L × (R×cosφ + X×sinφ) / 1000

Sadece direnç baskın (kesit < 50mm², cosφ≈1):
  ΔU ≈ 2 × I_b × L × R_iletken / 1000
  (Tek faz veya DC için faktör 2)

Bakır iletken direnci (20°C):
  r = ρ/A = 0.01724 / A  [Ω/m, A=mm²]

Örnek (3 faz, 50m, 4mm², 13.84A):
  R_kablo = 0.01724/4 × 50 = 0.2155 Ω (tek yön)
  ΔU = √3 × 13.84 × 0.2155 × 2 = 10.33V
  ΔU% = 10.33/400 × 100 = 2.58% ✅ (limit %4)
```

**Kablo Direnci Hızlı Referans (Bakır, 20°C)**

| Kesit (mm²) | Direnç (mΩ/m) |
|---|---|
| 1.5 | 12.1 |
| 2.5 | 7.41 |
| 4 | 4.61 |
| 6 | 3.08 |
| 10 | 1.83 |
| 16 | 1.15 |
| 25 | 0.727 |
| 35 | 0.524 |
| 50 | 0.387 |
| 70 | 0.268 |
| 95 | 0.193 |
| 120 | 0.153 |

---

## 3. Koruma Koordinasyonu

### Seçici Koruma Prensipleri

```
Kural 1: Alt sigorta — Üst sigorta
  I_n(alt) < I_n(üst)
  Arıza en alt seviyede kesilmeli (en az etkilenen alan)

Kural 2: Kısa devre akımı
  Her sigorta/MCB, kısa devre noktasındaki Icc'ye dayanmalı
  I_cs (sigorta kısa devre kapasitesi) ≥ Icc (noktadaki)

Kural 3: Eşgüdüm (Coordination)
  Alt sigorta arızada açılır, üst sigorta açılmaz
  Time-current eğrileri örtüşmemeli
```

### Sigorta / MCB Eğrisi Seçimi

| Eğri | Manyetik Açma | Kullanım Alanı |
|------|--------------|----------------|
| B | 3–5 × In | Rezistif yük, sinyal kabloları |
| C | 5–10 × In | Motor, trafo, genel endüstriyel |
| D | 10–20 × In | Yüksek kalkış akımlı motor, trafo primer |
| K | 8–12 × In | Motor, endüktif yük (IEC 60947) |

### Termik Röle Ayarı

```
Motor FLA (Full Load Amps) = Motor etiketindeki akım değeri

Termik röle ayarı = Motor FLA × 1.0 (bazı uygulamalarda ×1.05 – 1.15)

Örnek: 7.5 kW motor, FLA = 15.2A
  Termik röle ayarı: 15.2 A (veya 15.2 × 1.05 = 15.96A)
  Termik röle aralığı seçimi: 14–18A veya 12–18A aralıklı röle seç

NOT: VFD'li motorlarda termik röle kullanılmaz —
     sürücü kendi akım korumasını yapar.
```

### Kısa Devre Akımı Hesabı (Basit Yöntem)

```
Trafo çıkışında kısa devre akımı (I_sc):
  I_sc = S_trafo / (√3 × V × u_k)

  S_trafo = Trafo gücü (VA)
  V       = Gerilim (400V)
  u_k     = Kısa devre gerilimi (tipik: %4–6)

Örnek: 630 kVA trafo, u_k = %4
  I_sc = 630000 / (1.732 × 400 × 0.04) = 22,800 A ≈ 22.8 kA

→ Bu noktadaki tüm şalterlerin I_cs ≥ 22.8 kA olmalı!
  Uzak noktalarda I_sc düşer (hat direnci artar).
```

---

## 4. Topraklama ve Yıldırım Koruma

### TN-S Sistemi (Önerilen Endüstriyel Uygulama)

```
L1 ───┐
L2 ───┤ Trafo  → Dağıtım Barası
L3 ───┘         → PE (Koruma İletkeni, sarı-yeşil)
N  ─────────────→ N  (Nötr, mavi)
PE ─────────────→ Toprak elektroduna (≤1Ω)

TN-S: N ve PE ayrı — en iyi EMC performansı
TN-C: N+PE kombine (PEN) — endüstriyel ortamda önerilmez
TT  : Toprak bağımsız — eski binalarda
IT  : İzole nötr — özel uygulamalar (hastane, maden)
```

### Toprak Elektrodu Gereksinimleri

```
IEC 60364-5-54 gereksinimleri:
  R_toprak ≤ 1 Ω (genel endüstriyel)
  R_toprak ≤ 5 Ω (bazı uygulamalar)
  R_toprak ≤ 0.5 Ω (yıldırım koruma sistemleri)

Ölçüm yöntemi: 4 kutuplu toprak direnci ölçer (Fluke 1630 vb.)
Ölçüm zamanı: Kuru zemin koşullarında (kış/yaz ortalaması)

Elektrot tipleri:
  Spiral toprak elektrodu: En yaygın, 6m+ derinlik
  Toprak levhası: 1.0×0.5m, 0.5m derinlik min.
  Toprak şeridi: Bina çevresi, 0.5m derinlik
```

### Endüstriyel Topraklama Ağı (Mesh)

```
Kontrol panosu topraklaması:
  Her panel → 16mm² sarı-yeşil → Ana toprak barası (MEB)
  MEB → Toprak elektrodu → ≤1Ω

PLC/DCS kabineti özel topraklaması:
  Sinyal toprakları (shield) → Sinyal toprak barası
  Güç toprakları → Güç toprak barası
  İki bara → Tek noktada birleş → MEB
  (İki ayrı bara EMC gürültüsünü önler)

Ekranlı kablo:
  Sadece 1 uçtan toprakla (sürücü tarafı önerilir)
  Her iki uçtan topraklama → toprak döngüsü → gürültü artar
```

---

## 5. Pano Tasarım Standartları (EN 61439)

### Pano Tipleri

| Tip | Tanım | Kullanım |
|-----|-------|----------|
| Form 1 | Bölümsüz iç yapı | Küçük, düşük güç |
| Form 2b | Busbar ayrı bölümde | Orta seviye |
| Form 3b | Her fonksiyon ayrı, busbar ayrı | Endüstriyel MCC |
| Form 4b | Her şey ayrı + cihaz çekilebilir | Kritik sistemler |

### Termal Boyutlandırma

```
Pano içi ısı yükü = Toplam cihaz kayıpları (W)

Tipik kayıplar:
  MCB/MCCB  : 3–15 W/adet (akıma bağlı)
  Kontaktör : 4–20 W/adet
  Termik röle: 1–5 W/adet
  VFD        : %2–5 × Motor gücü
  PLC güç kyn: 10–50 W/adet
  Terminal   : 0.1–0.5 W/adet

Pano soğutma kapasitesi:
  Doğal soğuma: 5.5 W/m² × Pano dış yüzeyi (m²)
  
  Eğer Q_kayıp > Q_soğuma → Fan veya klima gerekli
  
  Fan kapasitesi (m³/h):
    V = Q / (1.2 × Cp × ΔT)
    Q = Isı yükü (W), Cp = 1000 J/kg°C, ΔT = maks. iç-dış sıcaklık farkı
```

### Pano IP Sınıfı Seçimi

| Ortam | Önerilen IP | Açıklama |
|-------|------------|----------|
| Ofis, kontrol odası | IP 20–31 | Kuru, temiz ortam |
| Fabrika genel | IP 54 | Toz + su sıçraması koruması |
| Yıkama bölgesi | IP 65–66 | Su jeti koruması |
| Açık alan | IP 65 + paslanmaz | Yağmur + UV |
| ATEX bölgesi | Ex e veya Ex d | Patlama koruması |

### Pano İç Yerleşim Kuralları (EN 60204-1)

```
Aralık Gereksinimleri:
  Bakım çalışma alanı önünde: ≥ 600 mm (kapı önünde)
  Bakım çalışma alanı yan: ≥ 500 mm (iki pano arasında)
  Tavan yüksekliği: ≥ 2000 mm

İç Yerleşim:
  Güç devresi → Sol veya üst bölüm
  Kontrol devresi → Sağ veya alt bölüm
  Sinyal kabloları → Güç kablolarından ≥ 100 mm mesafe
  PE barası → Alt kısım, kolayca erişilebilir
  
Renk kodlaması (EN 60204-1):
  L1 → Kahverengi (veya siyah)
  L2 → Siyah (veya kahverengi)
  L3 → Gri
  N  → Mavi
  PE → Sarı-Yeşil
  DC+ → Kırmızı (24VDC)
  DC- → Siyah veya Mavi (0VDC)
  Kontrol → Kırmızı (AC) / Mavi (DC)
```

---

## 6. EMC ve Kablo Düzeni

### EMC Kablo Ayrım Prensipleri

```
Kablo Grupları (Birbirinden Ayır!):
  GRUP 1 — Yüksek güç / gürültü kaynağı
    VFD çıkış kabloları (motor kabloları)
    Güç barası besleme
    
  GRUP 2 — Orta güç
    Motor besleme (VFD'siz)
    Kontaktör güç kabloları
    
  GRUP 3 — Kontrol ve sinyal
    24VDC kontrol
    Dijital I/O
    
  GRUP 4 — Analog ve haberleşme
    4-20mA sinyal kabloları
    Termokopl / PT100
    Profibus / RS-485
    Ethernet

Minimum Ayrım Mesafeleri:
  Grup 1 ↔ Grup 4 : ≥ 300 mm (veya metal bölücü)
  Grup 1 ↔ Grup 3 : ≥ 200 mm
  Grup 2 ↔ Grup 4 : ≥ 100 mm
  Kesişim noktaları: 90° çapraz geç (asla paralel gitme)
```

### VFD Kablolama Özel Kuralları

```
Motor Kablosu (VFD Çıkışı):
  ✓ Ekranlı kablo ZORUNLU (VFD'den motora)
  ✓ Ekran her iki uçta PE'ye bağlanmalı (360° bağlantı önerilir)
  ✓ Mümkün olan en kısa kablo (<50m ideal, >100m ek filtre)
  ✓ VFD çıkış kablosu tek başına tray'de git
  ✗ VFD çıkış kablosunu sinyal kablosuyla aynı tray'e koyma
  ✗ Motor kablosunu haberleşme kablosuna paralel getirme

VFD Besleme:
  ✓ Şebeke filtresi (EMC filtresi) VFD girişine
  ✓ Frekans dönüştürücü topraklaması direkt PE barası
  ✓ Kısa PE kablosu (mümkün olan en kısa)
```

---

## 7. Güç Kalitesi

### İzlenmesi Gereken Parametreler

| Parametre | Normal Değer | Limit |
|-----------|-------------|-------|
| Gerilim (L-N) | 230V | ±%10 (207–253V) |
| Gerilim (L-L) | 400V | ±%10 (360–440V) |
| Frekans | 50 Hz | ±%1 (49.5–50.5 Hz) |
| Gerilim dengesizliği | <1% | <2% (motor için) |
| Toplam harmonik bozulma (THD-V) | <5% | <8% |
| Güç faktörü (cosφ) | >0.90 | >0.85 (ceza sınırı) |

### Harmonik Sorunları ve Çözümler

```
Harmonik Kaynakları:
  VFD (en büyük kaynak) — 5. ve 7. harmonik
  UPS
  Güç elektroniği (SMPS)
  
Belirti:
  Nötr kabloda yüksek akım
  Trafo ve motor ısınması
  Haberleşme gürültüsü
  MCB'lerin yanlış açması

Çözümler (öncelik sırasıyla):
  1. VFD'e AC giriş reaktörü (induktor) ekle
  2. Aktif harmonik filtre (AHF)
  3. Pasif LC filtre
  4. 12 veya 18 pulslü sürücü seç
```

---

## 8. Hesap Şablonları

### Kablo Kesit Hesap Formu

```
KABLO KESİT HESAP FORMU
Proje: _________________ | Tarih: _____________ | Revizyon: A

Kablo Referansı : __________
Devre Tipi      : Motor / Aydınlatma / Priz / Kontrol
Yük Tanımı      : _______________________________

1. TASARIM AKIMI
   Güç (kW)         : _____ kW
   Gerilim          : 400V (3F) / 230V (1F)
   cosφ             : _____
   Verim (η)        : _____
   I_b              = _____ A

2. DÜZELTME FAKTÖRLERİ
   Ortam sıcaklığı  : _____ °C  → k₁ = _____
   Kablo grubu sayısı: _____    → k₂ = _____
   Döşeme tipi       : ___________

3. DÜZELTİLMİŞ AKIM
   I_z_min = I_b / (k₁ × k₂) = _____ A

4. KABLO SEÇİMİ
   Seçilen kesit    : _____ mm²
   Kablo cinsi      : NYY / NAYY / NHXMH / Diğer: ___
   Tablo kapasitesi : _____ A ≥ I_z_min ✅/❌

5. GERİLİM DÜŞÜMÜ KONTROLÜ
   Kablo uzunluğu   : _____ m
   Kablo direnci    : _____ mΩ/m
   ΔU               = _____ V = _____ % [Limit: %4] ✅/❌

6. KORUMA KONTROLÜ
   Sigorta/MCB      : _____ A, Eğri: ___
   I_n(sigorta) ≤ I_z(kablo): _____ ≤ _____ ✅/❌

SONUÇ: _____ mm² NYY/NAYY KABUL EDİLDİ
Hesaplayan: _____________ | Kontrol: _____________
```

### Trafo Seçim Hesabı

```
TRAFO BOYUTLANDIRMA
───────────────────────────────────────────────────────
Toplam Motor Güçleri:
  Motor 1: _____ kW × 1/η × 1/cosφ = _____ kVA
  Motor 2: _____ kW × 1/η × 1/cosφ = _____ kVA
  ...
  Toplam Motor: _____ kVA

Diğer Yükler:
  Aydınlatma      : _____ kW
  Priz + genel    : _____ kW
  PLC / kontrol   : _____ kW
  Toplam diğer    : _____ kVA

Toplam Bağlı Güç  : _____ kVA
Eşzamanlılık Faktörü: _____ (tipik: 0.65–0.80)
Tasarım Yükü      : _____ kVA
Gelecek Genişleme (%20 rezerv): _____ kVA

Seçilen Trafo     : _____ kVA
(standart: 100/160/250/400/630/1000/1250/1600 kVA)
───────────────────────────────────────────────────────
```

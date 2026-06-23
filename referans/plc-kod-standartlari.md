# PLC Kod Standartları Referansı
**Standart**: IEC 61131-3 | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [İsimlendirme Konvansiyonu](#1-isimlendirme)
2. [Program Yapısı ve Organizasyon](#2-program-yapısı)
3. [Dil Seçim Kılavuzu](#3-dil-seçimi)
4. [Function Block (FB) Tasarım Kuralları](#4-fb-tasarımı)
5. [Veri Tipleri ve Değişkenler](#5-veri-tipleri)
6. [Yorum ve Dokümantasyon](#6-yorumlar)
7. [Güvenlik Kodlama Kuralları](#7-güvenlik)
8. [Versiyon Yönetimi](#8-versiyon)
9. [Örnek Şablonlar](#9-şablonlar)

---

## 1. İsimlendirme Konvansiyonu

### Genel Kurallar
- Maksimum 24 karakter (Siemens S7 limiti)
- Türkçe karakter YASAK (`İ Ğ Ş Ü Ö Ç` → hata çıkarır)
- Boşluk yerine alt çizgi `_`
- Büyük/küçük harf tutarlı kullanımı

### Prefix Tablosu

| Prefix | Tip | Örnek |
|--------|-----|-------|
| `i_` | Input (Giriş) | `i_StartButton` |
| `o_` | Output (Çıkış) | `o_PumpRun` |
| `iq_` | Input REAL/WORD | `iq_TempSensor` |
| `oq_` | Output REAL/WORD | `oq_ValvePos` |
| `s_` | Static değişken | `s_StepCounter` |
| `t_` | Timer | `t_DelayTimer` |
| `c_` | Counter | `c_CycleCount` |
| `db_` | Data Block referansı | `db_RecipeData` |
| `g_` | Global değişken | `g_EmgStop` |
| `C_` | Sabit (Constant) | `C_MaxTemp` |

### Blok İsimlendirme

| Blok Tipi | Format | Örnek |
|-----------|--------|-------|
| Function Block | `FB_[İşlev]` | `FB_PumpControl` |
| Function | `FC_[İşlev]` | `FC_ScaleValue` |
| Data Block | `DB_[İşlev]` | `DB_RecipeParam` |
| Instance DB | `iDB_[FB adı]` | `iDB_PumpControl` |
| OB (Siemens) | `OB_[Görev]` | `OB_Main` |
| Program (Codesys) | `PRG_[Görev]` | `PRG_SafetyCheck` |

### Tag İsimlendirme (PLC-SCADA)

Format: `[ALAN]_[EKİPMAN]_[SİNYAL]`

```
Örnekler:
  CONV1_MOTOR1_RUN       → Konveyör 1, Motor 1, Çalışıyor
  TANK1_LVL_HIGH         → Tank 1, Seviye, Yüksek alarm
  BOILER_TEMP_PV         → Kazan, Sıcaklık, Process Value
  BOILER_TEMP_SP         → Kazan, Sıcaklık, Set Point
  LINE1_ESTOP_ACT        → Hat 1, Acil stop, Aktif
```

---

## 2. Program Yapısı ve Organizasyon

### Siemens TIA Portal — Önerilen Yapı

```
PLC_1 [CPU 1515]
├── Program Blokları
│   ├── OB1  Main (Ana döngü — sadece çağrılar içerir)
│   ├── OB30 CyclicInterrupt (Hızlı döngü — PID, Safety)
│   ├── OB100 Startup (İlk güç verme rutini)
│   ├── OB121 ProgError (Program hata yönetimi)
│   │
│   ├── FC_SafetyCheck    ← Her döngüde 1. çağrılan
│   ├── FC_IODiag         ← I/O diagnostik
│   │
│   ├── [Sistem 1]
│   │   ├── FB_Pump        ← Ekipman bloğu
│   │   ├── FB_Valve       ← Ekipman bloğu
│   │   └── FB_Seq_Fill    ← Sıra kontrol bloğu
│   │
│   └── [Ortak Kütüphane]
│       ├── FC_Scale       ← 4-20mA ölçekleme
│       ├── FC_PID_Tune    ← PID yardımcısı
│       └── FC_AlarmMgr    ← Alarm yönetimi
│
├── Teknoloji Nesneleri
│   └── [PID kontrolleri, hareket eksenleri]
│
└── Cihaz Konfigürasyonu
    └── [Donanım config, IP adresleri]
```

### Allen-Bradley Studio 5000 — Önerilen Yapı

```
Controller
├── Tasks
│   ├── MainTask (Continuous)
│   │   └── MainProgram
│   │       ├── MainRoutine     ← JSR çağrıları
│   │       ├── SafetyRoutine   ← Emniyet kontrolleri
│   │       └── FaultRoutine    ← Hata yönetimi
│   │
│   └── PeriodicTask (10ms) — PID, hız kontrol
│
├── Add-On Instructions (AOI)
│   ├── AOI_Pump
│   ├── AOI_Valve
│   └── AOI_PIDLoop
│
└── Tags
    ├── Controller Tags (Global)
    └── Program Tags (Local)
```

### OB1 / MainRoutine Altın Kuralı

> **OB1/MainRoutine yalnızca çağrı (call) satırlarından oluşmalıdır.**
> İş mantığı buraya yazılmaz; her şey FB/FC içinde olur.

```pascal
// OB1 — Main (DOĞRU KULLANIM)
FC_SafetyCheck();           // 1. Her zaman ilk
FC_IODiag();               // 2. I/O diagnostik
FB_Conveyor1(iDB_Conv1);   // 3. Ekipman blokları
FB_Conveyor2(iDB_Conv2);
FB_Seq_Production(iDB_Seq);
FC_AlarmMgr();             // Son: alarm güncelleme
```

---

## 3. Dil Seçim Kılavuzu

| Görev | Önerilen Dil | Neden |
|-------|-------------|-------|
| Bit mantığı, kontaktör/röle lojik | **Ladder (LD)** | Saha elektrikçisi okuyabilir |
| Analog işleme, PID, hesaplama | **Structured Text (ST)** | Matematiksel ifadeler temiz |
| Kompleks sıra kontrol | **Structured Text (ST)** | CASE/IF okunabilir |
| Paralel süreçler, adım-geçiş | **SFC (Sequential Function Chart)** | Görsel takip kolay |
| Standart kütüphane blokları | **Function Block Diagram (FBD)** | IEC standart bloklar |
| Safety (güvenlik) fonksiyonlar | **FBD veya LAD** | Sertifikasyon gereksinimi |

### Structured Text Sözdizimi Hızlı Referansı

```pascal
// Değişken tanımlama
VAR
  s_Step    : INT := 0;
  t_Delay   : TON;
  s_Running : BOOL := FALSE;
END_VAR

// IF-THEN-ELSIF
IF i_StartCmd AND NOT g_EmgStop THEN
  s_Running := TRUE;
ELSIF i_StopCmd THEN
  s_Running := FALSE;
END_IF;

// CASE (adım makinesi için)
CASE s_Step OF
  0:  // Bekleme
      IF i_StartCmd THEN s_Step := 10; END_IF;
  10: // Çalışma
      o_PumpRun := TRUE;
      t_Delay(IN := TRUE, PT := T#5S);
      IF t_Delay.Q THEN
        s_Step := 20;
        t_Delay(IN := FALSE);
      END_IF;
  20: // Tamamlandı
      o_PumpRun := FALSE;
      s_Step := 0;
END_CASE;

// FOR döngüsü
FOR i := 0 TO 9 DO
  aRecipe[i] := 0.0;
END_FOR;
```

---

## 4. Function Block (FB) Tasarım Kuralları

### FB Anatomisi

```pascal
FUNCTION_BLOCK FB_PumpControl
// ─── ARAYÜZ ──────────────────────────────────────────
VAR_INPUT
  i_StartCmd    : BOOL;   // Başlatma komutu (HMI/PLC)
  i_StopCmd     : BOOL;   // Durdurma komutu
  i_FaultReset  : BOOL;   // Arıza reset
  i_RunFbk      : BOOL;   // Motor çalışma geri bildirimi
  i_FaultFbk    : BOOL;   // Motor arıza geri bildirimi
  i_EmgStop     : BOOL;   // Acil stop (global)
END_VAR

VAR_OUTPUT
  o_RunCmd      : BOOL;   // Motor çalıştırma çıkışı
  o_Running     : BOOL;   // Çalışıyor durumu (HMI)
  o_Fault       : BOOL;   // Arıza durumu (HMI)
  o_FaultCode   : INT;    // Arıza kodu
END_VAR

VAR  // Static — instance DB'de saklanır
  s_State       : INT := 0;
  t_StartDelay  : TON;
  t_FbkTimeout  : TON;
  s_FaultLatch  : BOOL;
END_VAR
// ─────────────────────────────────────────────────────

// Acil stop — her koşulda override
IF i_EmgStop THEN
  o_RunCmd := FALSE;
  s_State  := 0;
  RETURN;
END_IF;

// Arıza latch
IF i_FaultFbk AND s_State = 10 THEN
  s_FaultLatch := TRUE;
  o_FaultCode  := 1;  // 1: Motor arızası
END_IF;

// Geri bildirim zaman aşımı (10 saniye)
t_FbkTimeout(IN := o_RunCmd AND NOT i_RunFbk,
             PT := T#10S);
IF t_FbkTimeout.Q THEN
  s_FaultLatch := TRUE;
  o_FaultCode  := 2;  // 2: Geri bildirim yok
END_IF;

// Arıza reset
IF i_FaultReset AND NOT i_FaultFbk THEN
  s_FaultLatch := FALSE;
  o_FaultCode  := 0;
END_IF;

// Durum makinesi
CASE s_State OF
  0:  // Bekleme
      o_RunCmd  := FALSE;
      o_Running := FALSE;
      IF i_StartCmd AND NOT s_FaultLatch THEN
        s_State := 10;
      END_IF;

  10: // Başlatma
      o_RunCmd := TRUE;
      t_StartDelay(IN := TRUE, PT := T#2S);
      IF i_RunFbk THEN
        s_State := 20;
        t_StartDelay(IN := FALSE);
      ELSIF t_StartDelay.Q THEN
        // Süre doldu, geri bildirim yok → timeout arızası
        // (FbkTimeout timer zaten yakalar)
        t_StartDelay(IN := FALSE);
      END_IF;

  20: // Çalışıyor
      o_RunCmd  := TRUE;
      o_Running := TRUE;
      IF i_StopCmd OR s_FaultLatch THEN
        s_State := 0;
      END_IF;
END_CASE;

o_Fault := s_FaultLatch;

END_FUNCTION_BLOCK
```

### FB Tasarım Kontrol Listesi

- [ ] Tüm inputlar `VAR_INPUT`, outputlar `VAR_OUTPUT`, durum değişkenleri `VAR` içinde
- [ ] Acil stop ve güvenlik koşulları en üstte (RETURN ile erken çıkış)
- [ ] Her `TON/TOF` timer için reset mantığı var
- [ ] Arıza durumları latch ediliyor (arızanın geçmesi alarmı kapatmasın)
- [ ] Arıza kodu (INT/WORD) output var — SCADA'da gösterilebilir
- [ ] FB içinde `RETURN` kullanıldıysa tüm outputlar güvenli durumda
- [ ] Maksimum 150 satır — daha uzunsa alt FB'lere böl

---

## 5. Veri Tipleri ve Değişkenler

### Temel Tipler

| Tip | Boyut | Aralık | Kullanım |
|-----|-------|--------|----------|
| `BOOL` | 1 bit | TRUE/FALSE | Dijital sinyal, flag |
| `INT` | 16 bit | -32768…32767 | Adım sayacı, küçük sayılar |
| `DINT` | 32 bit | ±2.1 milyar | Büyük sayaçlar |
| `REAL` | 32 bit | ±3.4E38 | Analog değerler, ölçümler |
| `TIME` | 32 bit | T#0s…T#49d | Süre değerleri |
| `STRING` | değişken | max 254 char | Mesaj, alarm metni |
| `ARRAY[0..9] OF REAL` | — | — | Reçete, tablo verisi |
| `STRUCT` | — | — | İlgili verileri grupla |

### Analog Ölçekleme Fonksiyonu

```pascal
FUNCTION FC_Scale : REAL
// 4-20mA veya 0-10V → Mühendislik birimi dönüşümü
VAR_INPUT
  i_RawValue  : INT;    // PLC ham değeri (tipik: 0-27648)
  i_RawMin    : INT;    // Ham minimum (4mA = 5530)
  i_RawMax    : INT;    // Ham maximum (20mA = 27648)
  i_EUMin     : REAL;   // Mühendislik min (örn: 0.0 °C)
  i_EUMax     : REAL;   // Mühendislik max (örn: 100.0 °C)
END_VAR
VAR
  r_Span      : REAL;
  r_RawSpan   : REAL;
END_VAR

r_RawSpan := INT_TO_REAL(i_RawMax - i_RawMin);
r_Span    := i_EUMax - i_EUMin;

IF r_RawSpan = 0.0 THEN
  FC_Scale := i_EUMin;  // Sıfıra bölme koruması
  RETURN;
END_IF;

FC_Scale := ((INT_TO_REAL(i_RawValue - i_RawMin) / r_RawSpan)
             * r_Span) + i_EUMin;

// Sınır kontrolü (clamp)
IF FC_Scale < i_EUMin THEN FC_Scale := i_EUMin; END_IF;
IF FC_Scale > i_EUMax THEN FC_Scale := i_EUMax; END_IF;

END_FUNCTION
```

---

## 6. Yorumlar ve Dokümantasyon

### Zorunlu Yorum Blokları

Her FB/FC başına:

```pascal
(*
  ╔══════════════════════════════════════════════════════╗
  ║  FB_PumpControl                                      ║
  ║  Pompa kontrol bloğu — start/stop, geri bildirim,   ║
  ║  arıza yönetimi ve acil stop entegrasyonu            ║
  ╠══════════════════════════════════════════════════════╣
  ║  Proje   : [Proje Adı]                               ║
  ║  Makine  : [Makine/Sistem Adı]                       ║
  ║  Yazar   : [Ad Soyad]                                ║
  ║  Rev.    : v1.2                                      ║
  ║  Tarih   : 2026-06-22                                ║
  ╠══════════════════════════════════════════════════════╣
  ║  Değişiklik Geçmişi:                                 ║
  ║  v1.0 — 2026-01-10 — İlk sürüm                      ║
  ║  v1.1 — 2026-03-15 — FbkTimeout eklendi             ║
  ║  v1.2 — 2026-06-22 — Arıza kodu genişletildi        ║
  ╚══════════════════════════════════════════════════════╝
*)
```

### Satır İçi Yorum Kuralları

```pascal
// DOĞRU — Ne yaptığını ve NEDEN yaptığını açıklar
IF t_FbkTimeout.Q THEN   // 10s içinde fbk gelmedi → sürücü arızası
  s_FaultLatch := TRUE;

// YANLIŞ — Kodu sadece Türkçeye çevirir, değer katmaz
o_RunCmd := TRUE;  // RunCmd'yi TRUE yap
```

---

## 7. Güvenlik Kodlama Kuralları

### Altın Kurallar

1. **Güvenli durum = enerjisiz durum**: Çıkışlar güç kesilince güvenli konuma gitmelidir
2. **Pozitif lojik tercih et**: `PB_STOP` normalde açık (NO) olmamalı; normalde kapalı (NC) kullan
3. **Acil stop her zaman donanım kökenli olmalı**: Yazılım acil stop tek güvence olamaz
4. **Watchdog timer**: Her kritik döngüde watchdog besle
5. **Çift kontrol**: Kritik çıkışlarda iki bağımsız koşul şart

```pascal
// YANLIŞ — Tek koşul yeterli değil
o_HighVoltageEnable := i_KeySwitch;

// DOĞRU — İki bağımsız koşul + güvenlik zaman aşımı
o_HighVoltageEnable := i_KeySwitch
                       AND i_DoorClosed
                       AND NOT g_EmgStop
                       AND s_SafetyChkOK;
```

### Safety PLC için Ayrı Kurallar
- Safety kodunu standart koddan fiziksel olarak ayır
- Safety F-blokları (SIL sertifikalı) dışında fonksiyon yazma
- Her safety bloğunun parametresi tüm devreye almada kayıt altına alın

---

## 8. Versiyon Yönetimi

### Versiyon Numaralama

`v[MAJOR].[MINOR].[PATCH]`

| Değişiklik Tipi | Hangi sayı artar | Örnek |
|-----------------|-----------------|-------|
| Yeni fonksiyon / büyük değişiklik | MAJOR | v1.0 → v2.0 |
| Küçük iyileştirme, yeni parametre | MINOR | v1.0 → v1.1 |
| Hata düzeltme (bug fix) | PATCH | v1.0 → v1.0.1 |

### Changelog Şablonu

```
═══════════════════════════════════════
  PROJE: [Proje Adı]
  PLC  : [CPU Modeli / IP]
  ═══════════════════════════════════════
  v2.1 | 2026-06-22 | [Ad Soyad]
    + FB_ValveControl: pozisyon geri bildirimi eklendi
    * FC_Scale: sıfıra bölme koruması düzeltildi
    - OB_Startup: gereksiz init rutini kaldırıldı
  ───────────────────────────────────────
  v2.0 | 2026-05-10 | [Ad Soyad]
    + Reçete yönetim sistemi eklendi (DB_Recipe)
    + FB_Seq_Production: yeni adım makinesi
  ───────────────────────────────────────
  v1.0 | 2026-01-10 | [Ad Soyad]
    + İlk sürüm
  ═══════════════════════════════════════
  Semboller: + Eklendi  * Değiştirildi  - Kaldırıldı  ! Kritik düzeltme
```

### Yedekleme Disiplini

| Ne | Ne Zaman | Nereye |
|----|----------|--------|
| PLC online backup | Her FAT/SAT öncesi | Proje klasörü + bulut |
| Proje arşivi (.zap/.L5K) | Her major değişiklik | Git veya network paylaşımı |
| HMI projesi | PLC ile senkron | Aynı klasör |
| Parametre yedeği | Devreye almadan önce | Ayrı "baseline" klasörü |

---

## 9. Örnek Şablonlar

### Yeni FB Başlangıç Şablonu

```pascal
(*
  ╔══════════════════════════════════════════════════════╗
  ║  FB_[İsim]                                           ║
  ║  [Kısa açıklama]                                     ║
  ╠══════════════════════════════════════════════════════╣
  ║  Proje: ... | Yazar: ... | Rev: v1.0 | Tarih: ...   ║
  ╚══════════════════════════════════════════════════════╝
*)
FUNCTION_BLOCK FB_[İsim]

VAR_INPUT
  i_Enable    : BOOL;   // Bloğu etkinleştir
  i_EmgStop   : BOOL;   // Acil stop (global)
END_VAR

VAR_OUTPUT
  o_Active    : BOOL;   // Aktif durum
  o_Fault     : BOOL;   // Arıza
  o_FaultCode : INT;    // Arıza kodu (0=yok)
END_VAR

VAR
  s_State     : INT := 0;
END_VAR

// ── Güvenlik kontrolü (her zaman önce) ──
IF i_EmgStop THEN
  o_Active := FALSE;
  s_State  := 0;
  RETURN;
END_IF;

// ── Ana lojik ──
CASE s_State OF
  0:  // Bekleme
      IF i_Enable THEN s_State := 10; END_IF;
  10: // Çalışma
      o_Active := TRUE;
      IF NOT i_Enable THEN s_State := 0; END_IF;
END_CASE;

END_FUNCTION_BLOCK
```

### Adım Makinesi (Sequence) Şablonu

```pascal
// Adım numaralandırma önerisi:
//   0    → Bekleme / Reset
//   10   → Adım 1
//   20   → Adım 2
//   ...  (10'ar 10'ar — araya adım eklemek için yer bırakır)
//   900  → Tamamlandı
//   999  → Arıza / Abort

CASE s_Step OF
  0:   // ─ Bekleme
       IF i_StartCmd THEN s_Step := 10; END_IF;

  10:  // ─ [Adım 1 Açıklaması]
       o_Output1 := TRUE;
       IF [koşul_sağlandı] THEN s_Step := 20; END_IF;
       IF [hata_koşulu]    THEN s_Step := 999; END_IF;

  20:  // ─ [Adım 2 Açıklaması]
       // ...

  900: // ─ Tamamlandı
       o_CycleComplete := TRUE;
       s_Step := 0;

  999: // ─ Arıza / Abort
       o_AllOutputs := FALSE;  // Tüm çıkışları kapat
       o_Fault      := TRUE;
       IF i_FaultReset THEN s_Step := 0; END_IF;

END_CASE;
```

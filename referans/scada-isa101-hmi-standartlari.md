# ISA-101 HMI Tasarım Standartları Referansı
**Standart**: ANSI/ISA-101.01-2015 | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [ISA-101 Felsefesi](#1-felsefe)
2. [Renk Sistemi](#2-renkler)
3. [Navigasyon Hiyerarşisi](#3-navigasyon)
4. [Semboller ve Ekipman Gösterimi](#4-semboller)
5. [Ekran Düzeni Kuralları](#5-düzen)
6. [Alarm Görselleştirme](#6-alarmlar)
7. [Tipografi ve Metin](#7-tipografi)
8. [Ekran Tasarım Kontrol Listesi](#8-kontrol-listesi)
9. [Kötü vs İyi Uygulama Örnekleri](#9-örnekler)

---

## 1. ISA-101 Felsefesi

### Temel İlke: Yüksek Performanslı HMI
ISA-101'in amacı operatörün anormal durumu **hızlı fark etmesi** ve **doğru müdahaleyi yapmasıdır**. Bunu engelleyen her şey kötü tasarımdır.

### Üç Altın Kural

```
1. RENK ANLAM TAŞIR, DEKORASYON DEĞIL
   → Renk sadece durumu (normal/alarm/arıza) göstermek için kullanılır
   → Ekranı renkli yapmak için renk kullanmayın

2. GÜRÜLTÜYÜ AZALT, SİNYALİ ARTIR
   → Normal çalışma: gri tonlar (sessiz)
   → Anormal durum: renkli (dikkat çeker)
   → Her şey renkli = hiçbir şey dikkat çekmez

3. OPERATÖRLERİ SÜREÇTEN HABERDAR ET
   → Sayısal değerler bağlamla birlikte gösterilmeli
   → Trend = sadece anlık değerden daha bilgilendirici
   → Alarm = ne oldu + ne yapmalı
```

---

## 2. Renk Sistemi

### ISA-101 Standart Renk Paleti

| Renk Adı | HEX Kodu | RGB | Kullanım |
|----------|----------|-----|----------|
| **Arka Plan** | `#C8C8C8` | 200,200,200 | Ekran arka planı (açık gri) |
| **Panel/Pano** | `#A0A0A0` | 160,160,160 | Ekipman gövdesi (koyu gri) |
| **Boru (normal)** | `#808080` | 128,128,128 | Normal akış hattı |
| **Normal Durum** | `#808080` | 128,128,128 | Ekipman normal çalışıyor |
| **Çalışıyor** | `#00CC00` | 0,204,0 | Motor/pompa aktif |
| **Dur/Kapalı** | `#C8C8C8` | 200,200,200 | Ekipman durmuş (arka planla benzer) |
| **Uyarı (Warning)** | `#FFFF00` | 255,255,0 | Anormal ama kabul edilebilir |
| **Alarm** | `#FF6600` | 255,102,0 | Turuncu — müdahale gerekli |
| **Kritik Alarm** | `#FF0000` | 255,0,0 | Kırmızı — acil müdahale |
| **Arıza** | `#FF0000` | 255,0,0 | Ekipman arızalı |
| **Manuel Mod** | `#00AAFF` | 0,170,255 | Mavi — operatör manuel kontrolde |
| **Devre Dışı** | `#606060` | 96,96,96 | Koyu gri — disabled |
| **Önemli Değer** | `#FFFFFF` | 255,255,255 | Beyaz metin/sayı vurgusu |

### Renk Kullanım Kuralları

```
YASAK:
  ✗ Yeşil arka plan (yeşil = çalışıyor anlamı taşır)
  ✗ Kırmızı/yeşil boru renkleri (boru renkleri nötr olmalı)
  ✗ Mavi ekipman vurgusu (mavi = manuel mod)
  ✗ Yanıp sönen her şey (yanıp sönme = kritik alarm için saklı)
  ✗ 3D efekt, degrade, gölge (dikkat dağıtır)

ZORUNLU:
  ✓ Aktif alarm yanıp söner (düşük frekansta, ~1 Hz)
  ✓ Acknowledge edilmiş alarm sabit renkle kalır
  ✓ Cleared alarm rengi nötre döner
```

### Renk Körü Dostu Tasarım

Kırmızı-yeşil renk körü nüfus ~%8 erkek:
- Rengin yanı sıra **şekil veya metin** de kullanın
- ✅ Çalışıyor: Yeşil daire + "RUN" yazısı
- ❌ Arızalı: Kırmızı daire + "FLT" yazısı + kalın kenar

---

## 3. Navigasyon Hiyerarşisi

### 4 Seviyeli Hiyerarşi

```
Seviye 1 — Tesis Genel Bakış (Level 1 Overview)
│   Tüm üretim hatları, genel KPI'lar
│   Çözünürlük: tüm ekranda
│   Detay yok, sadece genel durum
│
├── Seviye 2 — Hat / Alan Görünümü (Level 2 Unit)
│   │   Tek bir üretim hattı veya alan
│   │   Ekipmanlar görünür, akış anlaşılır
│   │
│   ├── Seviye 3 — Ekipman Detay (Level 3 Equipment)
│   │   │   Tek ekipman (pompa, kazan, reaktör)
│   │   │   Tüm parametreler, manuel kontrol
│   │   │
│   │   └── Seviye 4 — Tuning / Konfigürasyon (Level 4)
│   │           PID parametreleri, kalibrasyon, setup
│   │           Sadece mühendis erişimli
│   │
│   └── [Destek Ekranlar — her seviyeden erişilir]
│           Alarm listesi
│           Trend ekranı
│           Rapor ekranı
│           Yardım / SOP
```

### Navigasyon Şeridi (her ekranda)

```
┌──────────────────────────────────────────────────────────────┐
│  [ŞİRKET LOGO] │ [Ekran Adı — Seviye]    │ [Saat] [Alarm🔔] │
│  [L1 Genel]  [L2 Hat1]  [L2 Hat2]  [Alarm]  [Trend]  [Yardım] │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Semboller ve Ekipman Gösterimi

### ISA 5.1 Alet ve Kontrol Sembolleri

```
Ölçüm Sembolleri (daire içinde harf):
  PT  = Pressure Transmitter    (Basınç Transmitteri)
  TT  = Temperature Transmitter (Sıcaklık Transmitteri)
  LT  = Level Transmitter       (Seviye Transmitteri)
  FT  = Flow Transmitter        (Akış Transmitteri)
  AT  = Analyzer Transmitter    (Analiz Transmitteri)

Kontrol Sembolleri:
  PIC = Pressure Indicator Controller
  TIC = Temperature Indicator Controller
  LIC = Level Indicator Controller
  FIC = Flow Indicator Controller

Konum: Daire içinde harf, dairenin alt kısmında hat numarası
```

### Ekipman Durumu Gösterimi

```
Pompa Durum Gösterimi:
  ┌────┐  Durum rengi     Metin      Ne Zaman
  │ P  │  Gri   (#808080) "STOP"    Durmuş, normal
  │    │  Yeşil (#00CC00) "RUN"     Çalışıyor
  └────┘  Kırmızı(#FF0000)"FAULT"  Arızalı
          Mavi  (#00AAFF) "MAN"    Manuel modda çalışıyor
          Yanıp söner     "ALARM"  Aktif alarm var

Vana Gösterimi:
  │    │  → Açık vana (ince çizgi — akış serbest)
  │──X─│  → Kapalı vana (kalın X)
  │ %  │  → Kontrol vanası (yüzde göster)
```

---

## 5. Ekran Düzeni Kuralları

### Genel Düzen Kuralları

```
1. YOĞUNLUK: Ekranın maksimum %25'i bilgi içermeli
   → Kalan %75 arka plan (nötr gri)
   → "Dolu" görünen ekranlar operatörü yorar

2. F DÜZENİ: Gözler sol-üstten başlar
   → En kritik bilgiler sol-üst köşede
   → Akış soldan sağa, yukarıdan aşağıya

3. TUTARLILIK: Tüm ekranlarda aynı pozisyonda aynı bilgi
   → Saat her zaman sağ-üst
   → Alarm butonu her zaman aynı yerde
   → Navigasyon her zaman üstte

4. GRUPLAYARAK AYIRMA:
   → Çok yakın koyma (karışıklık)
   → Çok uzak koyma (ilişki anlaşılmaz)
   → Boşluk = gruplar arası sınır
```

### Çözünürlük ve Ölçekleme

| Ekran Tipi | Önerilen Çözünürlük | Ölçekleme |
|-----------|--------------------|-----------| 
| Kontrol odası monitörü | 1920×1080 | %100 |
| Operatör panel (HMI) | 1280×800 veya 1024×768 | DPI bağımlı |
| Mobil (tablet) | 1280×800 | Touch-friendly (>= 44px buton) |
| Çoklu monitör | Her monitör bağımsız ekran | Hayır paylaşım |

---

## 6. Alarm Görselleştirme

### Alarm Bandı (Her Ekranda Üst Bant)

```
┌────────────────────────────────────────────────────────────┐
│ 🔴 KRİTİK: KAZAN-1 AŞIRI BASINÇ — 12:34:56  [ACK] [GOTO] │
│ 🟠 ALARM : TANK-2 DÜŞÜK SEVİYE  — 12:30:11  [ACK] [GOTO] │
│ 🟡 UYARI : HAT-1 SICAKLIK YÜKSEK— 12:28:00  [ACK] [GOTO] │
│ [3 alarm daha...] [ALARM LİSTESİ]                         │
└────────────────────────────────────────────────────────────┘
```

### Alarm Listesi Ekranı Zorunlu Alanları

| Alan | Açıklama |
|------|----------|
| Zaman (Timestamp) | GG.AA.YYYY SS:DD:SS.mmm formatında |
| Öncelik | 1-Kritik, 2-Yüksek, 3-Orta, 4-Düşük |
| Alan/Sistem | Hangi ekipman/sistemden |
| Alarm Tag | PLC tag adı |
| Alarm Mesajı | Türkçe açıklama (ne oldu) |
| Değer | Alarm anındaki ölçüm değeri |
| Limit | Aşılan limit değeri |
| Durum | Aktif / Acknowledged / Cleared |
| Operatör Notu | Acknowledge eden + not |

### Alarm Renk ve Yanıp Sönme Kuralları

```
Durum          Arka Plan   Metin     Yanıp Söner?
─────────────────────────────────────────────────
Aktif, ACK yok Kırmızı     Beyaz     EVET (~1 Hz)
Aktif, ACK var Kırmızı     Beyaz     HAYIR
Geçmiş, Clear  Beyaz/Gri   Siyah     HAYIR
Uyarı, ACK yok Turuncu     Siyah     EVET (~1 Hz)
Uyarı, ACK var Turuncu     Siyah     HAYIR
```

---

## 7. Tipografi ve Metin

### Font Seçimi

| Kullanım | Font | Boyut | Ağırlık |
|----------|------|-------|---------|
| Ekipman etiketi | Arial / Segoe UI | 10-12 pt | Normal |
| Sayısal değer | Arial / Courier | 14-18 pt | Bold |
| Birim (°C, bar) | Arial | 10 pt | Normal |
| Alarm mesajı | Arial | 12 pt | Bold |
| Ekran başlığı | Arial | 16-20 pt | Bold |
| Navigasyon butonları | Arial | 12 pt | Normal |

### Metin Kuralları

```
✓ Kısaltmalar tutarlı kullanılmalı (her ekranda aynı)
✓ Büyük harf: Alarm mesajları ve ekipman isimleri
✓ Küçük harf: Birim, açıklama metni
✓ Sayısal değer: sabit ondalık hane (3 yerine 3.00)
✓ Birim her değerin yanında gösterilmeli

✗ Eğik (italic) font kullanmayın (küçük ekranda okunmaz)
✗ 10 pt altı font kullanmayın
✗ Çok uzun metin (kısalt + tooltip/popup ile detay)
```

---

## 8. Ekran Tasarım Kontrol Listesi

### Yeni Ekran Tasarımı Tamamlanmadan Önce

**Renk ve Görsel**
- [ ] Arka plan rengi doğru (`#C8C8C8`)
- [ ] Ekipman renkleri sadece durum bilgisi taşıyor
- [ ] Grafik öğeler (3D, degrade, gölge) yok
- [ ] Normal durum: gri ağırlıklı
- [ ] Alarm/arıza durumları renkli ve belirgin

**Navigasyon**
- [ ] Saat ve tarih sağ-üst köşede
- [ ] Alarm sayacı (aktif alarm sayısı) görünür
- [ ] Ana navigasyon butonları her ekranda mevcut
- [ ] "Geri" butonu her ekranda var

**Semboller ve Düzen**
- [ ] ISA 5.1 sembolleri kullanıldı
- [ ] Ekipman isimleri / tag numaraları gösteriliyor
- [ ] Birimler her değerin yanında
- [ ] Akış yönleri ok ile belirtildi

**Alarm**
- [ ] Aktif alarmlar üst bantta görünür
- [ ] Alarm listesi butonuna her ekrandan erişilebilir
- [ ] Alarm durumu (aktif/ACK/cleared) renkle ayrıştırılmış

**Erişim Kontrolü**
- [ ] Kritik kontroller şifre korumalı
- [ ] Manuel override açıkça etiketlenmiş
- [ ] Operatör / Mühendis / Sadece Görüntüle seviyeleri ayrıştırıldı

---

## 9. Kötü vs İyi Uygulama Örnekleri

### Örnek 1 — Pompa Durumu

```
KÖTÜ UYGULAMA:
  [Parlak mavi pompa ikonu] (estetik için mavi)
  [Yeşil zemin üzerine kırmızı yazı "STOP"] (kontrast kötü)
  Pumpa durdu → renk değişmiyor (durum anlaşılmıyor)

İYİ UYGULAMA:
  [Gri pompa ikonu] → Normal, durmuş
  [Yeşil pompa ikonu + "RUN" yazısı] → Çalışıyor
  [Kırmızı pompa ikonu + "FLT" yazısı + yanıp sönme] → Arıza
```

### Örnek 2 — Sıcaklık Gösterimi

```
KÖTÜ UYGULAMA:
  Sadece sayı: 78.5
  (Ne birimi var, ne ne anlama geldiği)

İYİ UYGULAMA:
  KAZAN-1 ÇIKIŞ SICAKLIĞI
  78.5 °C  [Normal: 70-85°C]
  [Mini trend: son 30 dakika]
  SP: 80.0 °C
```

### Örnek 3 — Alarm Mesajı

```
KÖTÜ UYGULAMA:
  "TANK HIGH LEVEL"
  (Ne yapmalı? Hangi tank? Ne kadarlık?)

İYİ UYGULAMA:
  TANK-2 YÜKSEk SEVİYE — 92% (Limit: 90%)
  Önlem: Besleme vanesini kapat (FV-201)
  Detay: [GOTO TANK-2 Ekranı]
```

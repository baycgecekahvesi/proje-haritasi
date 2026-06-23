# Güvenlik ve Uyumluluk Referansı
**Kapsam**: Makine Direktifi, CE, SIL, ISO 13849, Risk Değerlendirmesi | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [CE İşareti ve Makine Direktifi](#1-ce)
2. [Risk Değerlendirmesi](#2-risk)
3. [Fonksiyonel Güvenlik — SIL ve PL](#3-sil-pl)
4. [Güvenlik Devresi Tasarımı](#4-guvenlik-devresi)
5. [ATEX / Ex — Patlayıcı Ortam](#5-atex)
6. [IEC 62443 — Siber Güvenlik](#6-siber)
7. [Uygunluk Beyanı (DoC) Şablonu](#7-doc)

---

## 1. CE İşareti ve Makine Direktifi

### Hangi Direktifler Uygulanır?

```
Makine için sık uygulanan AB direktifleri:
─────────────────────────────────────────────────────────
Direktif              │ Kısaltma │ Uygulama Alanı
──────────────────────┼──────────┼──────────────────────
Makine Direktifi      │ MD       │ Her türlü makine
2006/42/EC            │          │ (2006/42 → 2023/1230*)
──────────────────────┼──────────┼──────────────────────
Alçak Gerilim         │ LVD      │ 50–1000VAC, 75–1500VDC
2014/35/EU            │          │ Elektrikli ekipman
──────────────────────┼──────────┼──────────────────────
EMC Direktifi         │ EMCD     │ Elektromanyetik uyumluluk
2014/30/EU            │          │
──────────────────────┼──────────┼──────────────────────
ATEX Direktifi        │ ATEX     │ Patlayıcı ortam ekipmanı
2014/34/EU            │          │
──────────────────────┼──────────┼──────────────────────
Basınçlı Ekipman      │ PED      │ Kazan, tank, boru
2014/68/EU            │          │

* 2023/1230: Yeni Makine Direktifi — Geçiş 2027'ye kadar
```

### CE Teknik Dosya İçeriği (Makine Direktifi)

```
TEKNİK DOSYA (Technical File) — ZORUNLU İÇERİK:

A. Makine Tanımı
   □ Genel tanım, amaçlanan kullanım
   □ Makine montaj resmi (genel görünüm)
   □ Komple parça listesi (BOM)
   □ Kontrol devreleri dahil ayrıntılı resimler

B. Uygunluk Beyanı (DoC)
   □ Uygulanan direktifler
   □ Uygulanan uyumlaştırılmış standartlar (EN listesi)
   □ İmalatçı bilgileri
   □ İmalatçı veya yetkili temsilci imzası

C. Risk Değerlendirmesi
   □ Makine Direktifi Ek I — Temel Sağlık ve Güvenlik
     Gereksinimleri kontrol listesi
   □ Sistematik risk değerlendirmesi belgesi
   □ Alınan önlemler ve artık risk

D. Uygulanan Standartlar Listesi
   □ EN ISO 12100 (Risk değerlendirmesi)
   □ EN ISO 13849-1 (Güvenlik fonksiyonları — PL)
   □ EN 60204-1 (Makine elektrik donanımı)
   □ EN 62061 (SIL — fonksiyonel güvenlik)
   □ Diğer uygulanan EN standartları

E. Test ve Doğrulama Raporları
   □ Güvenlik fonksiyonu doğrulama kayıtları
   □ E-stop test raporları
   □ FAT/SAT protokolleri (gerekirse)

F. Kullanım Kılavuzu
   □ Türkçe dahil gerekli dillerde
   □ Tehlikeler ve güvenlik talimatları
   □ Kurulum, işletme, bakım talimatları
   □ Yedek parça bilgisi
```

### Temel Uyumlaştırılmış Standartlar (Makine)

| Standart | Konu |
|----------|------|
| EN ISO 12100 | Risk değerlendirmesi ve azaltma genel prensipleri |
| EN ISO 13849-1/2 | Güvenlik fonksiyonları tasarımı (PL a–e) |
| EN 62061 | Elektrik/elektronik/programlanabilir güvenlik sistemi (SIL) |
| EN 60204-1 | Makine elektrik donanımı genel gereksinimleri |
| EN ISO 10218-1/2 | Robot güvenliği |
| EN 415-xx | Paketleme makinesi güvenliği |
| EN 619 | Konveyör güvenliği |

---

## 2. Risk Değerlendirmesi

### ISO 12100 Risk Değerlendirme Süreci

```
ADIM 1 — Makinenin sınırlarını belirle
  • Kullanım sınırları (ne için kullanılacak?)
  • Uzay sınırları (ulaşma alanı, hareket alanı)
  • Zaman sınırları (ömür, bakım periyodu)

ADIM 2 — Tehlikeleri tespit et
  • Mekanik tehlikeler (ezilme, kesilme, sıkışma)
  • Elektrik tehlikeleri (çarpma, ark)
  • Termal tehlikeler (yanma, donma)
  • Gürültü ve titreşim
  • Kimyasal ve biyolojik tehlikeler
  • Ergonomi tehlikeleri

ADIM 3 — Risk tahmini (her tehlike için)
  Risk = Olasılık × Şiddet
  
  Şiddet (S):
    S1 = Geri dönüşümlü yaralanma
    S2 = Geri dönüşümsüz yaralanma veya ölüm

  Maruziyet Sıklığı (F):
    F1 = Seyrek veya nadir
    F2 = Sık veya sürekli

  Önlem Alma Olasılığı (P):
    P1 = Olası (kaçınmak mümkün)
    P2 = Olası değil

ADIM 4 — Risk değerlendirmesi → Risk azaltma önlemi seç
  Hiyerarşi (EN ISO 12100):
    1. Tasarımla güvenli kıl (eliminate)
    2. Koruyucu tedbirler (guard, safety function)
    3. Kullanıcı bilgilendirmesi (uyarı, eğitim)

ADIM 5 — Artık riski belge et
```

### Risk Matrisi Şablonu

```
RİSK DEĞERLENDİRME FORMU
Makine: _________________ | Tarih: _____________ | Rev: A
Değerlendiren: _______________ | Onaylayan: _______________

───────────────────────────────────────────────────────────────────────────────
 No │ Tehlike Tanımı   │ Tehlikeli │  ÖNCESİ   │ Alınan Önlem    │  SONRASI
    │                  │ Durum     │ S │ F │ P │                 │ S │ F │ P
────┼──────────────────┼───────────┼───┼───┼───┼─────────────────┼───┼───┼───
 1  │ Konveyörde       │ Elbisenin │S2 │F2 │P2 │ İki el kontrol  │S2 │F1 │P1 │
    │ sıkışma          │ kapılması │   │   │   │ + kapak koruyucu│   │   │   │
────┼──────────────────┼───────────┼───┼───┼───┼─────────────────┼───┼───┼───
 2  │ Yüksek gerilim   │ Panel aç. │S2 │F2 │P2 │ Kapı kilidi +   │S2 │F1 │P1 │
    │ temas riski      │ temas     │   │   │   │ E-stop intlk.   │   │   │   │
────┼──────────────────┼───────────┼───┼───┼───┼─────────────────┼───┼───┼───
 3  │ ...              │           │   │   │   │                 │   │   │   │

Risk Seviyesi: S2+F2+P2 = YÜKSEK → Önlem zorunlu
               S2+F1+P1 = ORTA  → Önlem önerilir
               S1+Fx+Px = DÜŞÜK → Bilgi verme yeterli

ARTIK RİSK ÖZETI:
  Yüksek (önlem alınamadı): ___ adet — [AÇIKlama]
  Orta (önlem alındı, kabul edildi): ___ adet
  Düşük: ___ adet
```

---

## 3. Fonksiyonel Güvenlik — SIL ve PL

### SIL (Safety Integrity Level) — IEC 62061

| SIL | PFH (Tehlike olasılığı/saat) | Uygulama Örneği |
|-----|------------------------------|-----------------|
| SIL 1 | 10⁻⁵ – 10⁻⁶ | Tek kişi, hafif yaralanma riski |
| SIL 2 | 10⁻⁶ – 10⁻⁷ | Ciddi yaralanma, geri dönüşümsüz |
| SIL 3 | 10⁻⁷ – 10⁻⁸ | Ölüm riski (pres, robot, kimya) |
| SIL 4 | 10⁻⁸ – 10⁻⁹ | Nükleer, havacılık (makine direktifinde nadiren) |

### PL (Performance Level) — EN ISO 13849

| PL | Ortalama tehlike olasılığı/saat (PFHd) | SIL karşılığı |
|----|---------------------------------------|--------------|
| a | 10⁻⁵ – 10⁻⁴ | — |
| b | 3×10⁻⁶ – 10⁻⁵ | SIL 1 |
| c | 10⁻⁶ – 3×10⁻⁶ | SIL 1 |
| d | 10⁻⁷ – 10⁻⁶ | SIL 2 |
| e | 10⁻⁸ – 10⁻⁷ | SIL 3 |

### PL Hesabı — Risk Graph Yöntemi (ISO 13849)

```
Risk Graph Parametreleri:
  S (Yaralanma Şiddeti):
    S1 = Geri dönüşümlü yaralanma
    S2 = Geri dönüşümsüz veya ölüm

  F (Maruziyet Sıklığı):
    F1 = Seyrek ≤ 1/saat veya kısa süreli
    F2 = Sık > 1/saat veya uzun süreli

  P (Tehlikeden Kaçınma Olasılığı):
    P1 = Olası (yavaş hareket, kaçma şansı var)
    P2 = Neredeyse imkansız

Risk Graph Tablosu:
       │  S1        │  S2
───────┼────────────┼──────────────
F1, P1 │  PLa       │  PLc
F1, P2 │  PLb       │  PLd
F2, P1 │  PLb       │  PLd
F2, P2 │  PLc       │  PLe
```

### Safety PLC Seçim Kriterleri

```
SIL 1 / PL c:
  → Tek kanallı güvenlik rölesi (Pilz PNOZ, Sick UE48)
  → Safety relay modülü

SIL 2 / PL d:
  → Çift kanallı güvenlik rölesi (redundant)
  → Entegre safety PLC (Siemens ET200S FS, AB SmartGuard)

SIL 3 / PL e:
  → Yüksek SIL Safety PLC (Siemens S7-1500F, Hima, Triconex)
  → Voted architecture (2oo3)
```

---

## 4. Güvenlik Devresi Tasarımı

### Güvenlik Kategorileri (EN ISO 13849)

```
Kategori B: Temel — Arıza olursa güvenli durum garanti değil
Kategori 1: İyi bileşenler — Tek kanallı, test yok
Kategori 2: Tek kanal + periyodik test
Kategori 3: Çift kanal — Tek arıza güvenli durumu bozmuyor
Kategori 4: Çift kanal + çapraz izleme — Biriken arıza tespit

PL → Kategori önerisi:
  PLa/b: Kategori B veya 1
  PLc  : Kategori 2 veya 3
  PLd  : Kategori 3
  PLe  : Kategori 4
```

### E-Stop Devre Tasarımı (PLd / Kategori 3)

```
Çift Kanallı E-Stop Devresi:

E-Stop Butonu ──┬── Kanal A (NC kontak) ──→ Safety Relay CH1
                └── Kanal B (NC kontak) ──→ Safety Relay CH2

Safety Relay çıkışı:
  → Güvenlik çıkışı (zorla yönlendirilmiş kontak)
  → Her iki kanal açılınca çıkış güvenli konuma geçer
  → Çapraz izleme: Bir kanal açık, diğeri kapalıysa → Arıza tespiti

Gereksinimler:
  ✓ Her iki kanal ayrı kablo yolundan gitmelidir
  ✓ Kontak zorla yönlendirilmiş (positive-break) olmalıdır
  ✓ Reset manuel ve kasıtlı olmalıdır
  ✓ Reset sonrası otomatik başlama OLMAMALIDIR
  ✓ Güvenlik rölesi sertifikalı (SIL2 veya PLd) olmalıdır
```

### Güvenlik Fonksiyonu Doğrulama Kaydı

```
GÜVENLİK FONKSİYONU DOĞRULAMA KAYDI
─────────────────────────────────────────────────────────────
Fonksiyon No : SF-001
Açıklama     : Acil durdurma fonksiyonu
Talep SIL/PL : PLd (Kategori 3)
─────────────────────────────────────────────────────────────
TEST PROSEDÜRÜ:
  1. Sistem çalışır durumdayken E-stop butonuna bas
  2. Tüm çıkışların < 100ms içinde kapandığını ölç
  3. Reset dene → Sistem otomatik başlamamalı
  4. Güvenlik rölesi arıza LED'i kontrol et
  5. Reset + onay → Sistem hazır durumuna geçer

TEST SONUÇLARI:
  Devre kesme süresi: ___ ms (≤ 100ms → ✅/❌)
  Otomatik başlama yok: ✅/❌
  Arıza tespiti çalışıyor: ✅/❌
  
SONUÇ: GEÇTI / KALDI
Test Eden: _______________ | Tarih: _______________
─────────────────────────────────────────────────────────────
```

---

## 5. ATEX / Ex — Patlayıcı Ortam

### ATEX Bölge Sınıflandırması

```
GAZ / BUHAR (Direktif 99/92/EC):
  Zone 0: Sürekli veya uzun süreli patlayıcı atmosfer (tank içi)
  Zone 1: Normal çalışmada zaman zaman patlayıcı atmosfer
  Zone 2: Anormal koşullarda oluşan patlayıcı atmosfer (sızıntı)

TOZ (Direktif 99/92/EC):
  Zone 20: Sürekli patlayıcı toz bulutu (silo içi)
  Zone 21: Normal çalışmada zaman zaman patlayıcı toz
  Zone 22: Anormal koşullarda oluşan patlayıcı toz

Bölge → Ekipman Kategorisi:
  Zone 0 / 20 → Kategori 1G / 1D
  Zone 1 / 21 → Kategori 2G / 2D
  Zone 2 / 22 → Kategori 3G / 3D
```

### ATEX Ekipman İşaretleme

```
Örnek: ⊛ II 2G Ex db IIC T4 Gb

⊛    = CE + ATEX sembolü
II   = Ekipman grubu (I=maden, II=yüzey)
2G   = Kategori 2, Gaz ortamı
Ex   = Patlama korumalı
db   = Koruma tipi (d=flameproof + b=control of ignition sources)
IIC  = Gaz grubu (IIA=propan, IIB=etilen, IIC=hidrojen)
T4   = Sıcaklık sınıfı (135°C max. yüzey sıcaklığı)
Gb   = Ekipman koruma seviyesi

Sıcaklık Sınıfları:
  T1 = 450°C max. yüzey
  T2 = 300°C max.
  T3 = 200°C max.
  T4 = 135°C max.
  T5 = 100°C max.
  T6 = 85°C max.
```

### ATEX Mühendis Kontrol Listesi

```
□ Bölge haritası hazırlandı ve onaylandı
□ Her ATEX bölgedeki her ekipman listelendi
□ Her ekipmanın ATEX sertifikası temin edildi
□ Sertifika bölge gereksinimi ile uyumlu
  (Zone 1 → Kategori 2G veya daha iyi)
□ Ekipman sıcaklık sınıfı → Ortam gaz tutuşma sıcaklığından düşük
□ Kablolar ve kablo girişleri ATEX onaylı
□ Topraklama ve potansiyel eşitleme tamamlandı
□ Kurulum ATEX yetkili kişi tarafından denetlendi
□ Periyodik muayene planı oluşturuldu
```

---

## 6. IEC 62443 — Siber Güvenlik

### OT Güvenlik Seviyeleri (Security Level — SL)

| SL | Tanım |
|----|-------|
| SL 0 | Özel koruma yok |
| SL 1 | Kasıtsız veya tesadüfi ihlale karşı koruma |
| SL 2 | Basit araçlarla kasıtlı ihlale karşı koruma |
| SL 3 | Sofistike araçlarla kasıtlı ihlale karşı koruma |
| SL 4 | Devlet destekli saldırılara karşı koruma |

### Endüstriyel OT Güvenlik Temel Önlemleri

```
AĞ SEGMENTASYONU:
  □ OT ağı IT ağından ayrılmış (VLAN veya fiziksel)
  □ DMZ/güvenli bölge oluşturulmuş (historian, OPC-UA GW)
  □ OT ve IT arası firewall kuralları belgelenmiş
  □ PLC'lere internet erişimi yok

ERİŞİM KONTROLÜ:
  □ Her kullanıcı ayrı hesap (paylaşılan şifre yok)
  □ Güçlü şifre politikası uygulanıyor
  □ Gereksiz uzak erişim portları kapalı
  □ VPN olmadan uzak bağlantı yok
  □ USB port politikası (beyaz liste veya devre dışı)

PATCH YÖNETİMİ:
  □ PLC/HMI firmware güncelleme prosedürü var
  □ Windows tabanlı SCADA güncellemesi periyodik
  □ Test ortamında denendikten sonra üretim güncelleniyor

YEDEKLEME:
  □ PLC yazılımı periyodik yedekleniyor
  □ SCADA/HMI projesi yedekleniyor
  □ Yedekler ayrı fiziksel konumda saklanıyor
  □ Yedekten geri yükleme test edilmiş

İZLEME VE LOG:
  □ Başarısız giriş denemeleri loglanıyor
  □ Konfigürasyon değişiklikleri loglanıyor (audit trail)
  □ Anormal ağ trafiği izleniyor
```

---

## 7. Uygunluk Beyanı (DoC) Şablonu

```
AB UYGUNLUK BEYANI
(Makine Direktifi 2006/42/EC Ek II, Madde 1A)

İMALATÇI BİLGİLERİ:
  Firma Adı   :
  Adres       :
  Ülke        :

MAKİNE BİLGİLERİ:
  Tanım       :
  Model / Tip :
  Seri Numarası:
  İmalat Yılı :

Bu uygunluk beyanı aşağıda belirtilen AB direktifleriyle
uyumlu olduğunu beyan eder:
  □ Makine Direktifi 2006/42/EC
  □ Alçak Gerilim Direktifi 2014/35/EU
  □ EMC Direktifi 2014/30/EU
  □ ATEX Direktifi 2014/34/EU (ATEX bölge varsa)

Uygulanan uyumlaştırılmış standartlar:
  □ EN ISO 12100:2010 — Risk değerlendirmesi
  □ EN ISO 13849-1:2015 — Güvenlik fonksiyonları
  □ EN 60204-1:2018 — Makine elektrik donanımı
  □ EN 61000-6-2 / 61000-6-4 — EMC (endüstriyel)
  □ [Diğer uygulanabilir standartlar]

İmalatçı veya yetkili temsilci adına imzalanmıştır:

  Ad / Ünvan  :
  Tarih       :
  İmza        : ______________________________
  Yer         :
```

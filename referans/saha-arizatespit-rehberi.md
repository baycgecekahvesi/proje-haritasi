# Saha Arıza Tespiti Rehberi
**Kapsam**: Elektrik ve otomasyon saha arızaları | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [Sistematik Arıza Tespiti Metodolojisi](#1-metodoloji)
2. [Ölçüm Araçları ve Kullanımı](#2-olcum-araclari)
3. [Dijital Sinyal (DI/DO) Arızaları](#3-dijital)
4. [Analog Sinyal (AI/AO) Arızaları](#4-analog)
5. [Motor ve Sürücü Arızaları](#5-motor)
6. [PLC İletişim Arızaları](#6-iletisim)
7. [Güç Kaynağı Arızaları](#7-guc)
8. [Hızlı Arıza Tespit Kartları](#8-hizli-kart)

---

## 1. Sistematik Arıza Tespiti Metodolojisi

### Altı Adımlı Arıza Tespiti

```
ADIM 1 — GÖZLEMLE
  • Ne çalışmıyor?
  • Ne zaman başladı?
  • Sürekli mi, aralıklı mı?
  • Başka şeyler de etkileniyor mu?
  • Son değişiklik ne oldu? (yeni kablo, yeni program, güç kesintisi...)

ADIM 2 — BİLGİ TOPLA
  • PLC alarm/hata kaydına bak
  • Olay günlüğünü (event log) kontrol et
  • Sürücü/cihaz hata kodunu oku
  • Bakım/değişiklik geçmişini incele

ADIM 3 — YARIYA BÖL (Half-split method)
  • Sistemin ortasındaki noktayı ölç
  • Arıza orada mı, yoksa öncesinde mi?
  • Yarıyı bul → tekrar yarıya böl
  → Bu yöntem arama süresini logaritmik azaltır

ADIM 4 — SINIRI BELİRLE
  • Arızanın başladığı ve bittiği noktayı bul
  • İzole et: Sadece bu parça mı etkilenmiş?

ADIM 5 — TEST ET
  • Teorini doğrula: Bileşeni değiştir veya bypass et
  • Çalışıyor mu? → Arıza bulundu
  • Çalışmıyor mu? → Adım 3'e dön

ADIM 6 — DÜZELT VE KAYDET
  • Kalıcı çözümü uygula (geçici bypass bırakma)
  • Arıza raporu doldur
  • Benzer arızayı önlemek için önlem öner
```

### Sık Yapılan Hatalar

```
✗ Rastgele parça değiştirme → Zaman ve para kaybı
✗ Arızayı tanımlamadan önce müdahale → Asıl nedeni gizler
✗ "Muhtemelen X'dir" ile çalışmak → Teyit et
✗ Geçici bypass'ı kalıcı bırakmak → İkinci arızayı davet eder
✗ Arızayı kaydetmemek → Aynı arıza tekrarlanır
```

---

## 2. Ölçüm Araçları ve Kullanımı

### Dijital Multimetre (DMM)

#### AC Gerilim Ölçümü
```
Ayar: VAC (600V veya uygun range)
Bağlantı: Siyah → COM, Kırmızı → V/Ω

Tipik Ölçümler:
  Faz-Nötr    : 220-230V (±%10)
  Faz-Faz     : 380-400V (±%10)
  Faz-Toprak  : 220-230V (topraklama çalışıyorsa)
  Nötr-Toprak : < 5V (>5V ise sorun var)
```

#### DC Gerilim Ölçümü
```
Ayar: VDC (30V veya uygun range)
24VDC Güç Kaynağı:
  + terminal → +    : 24V (±%5: 22.8 – 25.2V)
  GND → toprak     : <1V (>2V ise yalıtım sorunu)
  Yük altında      : >22V (düşükse güç kaynağı yetersiz)
```

#### Direnç Ölçümü
```
Ayar: Ω (UYARI: Devreyi ENERJİSİZ yap!)
Kablo sürekliliği:
  0-2Ω    : Sağlıklı kablo
  2-10Ω   : Şüpheli (tekrar ölç, bağlantıları sık)
  >10Ω    : Bağlantı sorunu veya kablo hasarı
  Sonsuz  : Açık devre (kopuk kablo/bağlantı)

Kısa devre kontrolü:
  Faz-Nötr (enerjisiz) : Sonsuz Ω (kısa devre yoksa)
  <1Ω                  : Kısa devre var!
```

#### Süreklilik / Diyot Testi
```
Ayar: 🔊 (buzzer sembolü)
• Buzzer çalıyor → Kablo/bağlantı sağlam (< ~50Ω)
• Buzzer çalmıyor → Kopuk
• UYARI: Enerjili devre üzerinde yapmayın
```

### Megger (İzolasyon Test Cihazı)

```
UYARI: Sadece ENERJİSİZ ve LOTO uygulanmış devrelerde kullan!
Elektronik bileşenler (VFD, PLC I/O) söküldükten sonra test et.

Test Gerilimi Seçimi:
  230/400V sistemler  → 500V DC test
  600V sistemler      → 1000V DC test
  MV (1-10 kV)        → 2500V DC test (uzman gerekir)

Kabul Kriterleri:
  > 100 MΩ  → Mükemmel izolasyon
  1–100 MΩ  → Kabul edilebilir
  < 1 MΩ    → Şüpheli, değiştir veya incele
  < 100 kΩ  → BOZUK — çalıştırma!

Kayıt formatı:
  Kablo No │ Ölçüm Noktası  │ Test V │ Sonuç MΩ │ Kabul?
  ─────────┼────────────────┼────────┼──────────┼───────
  C-001    │ Faz-Toprak     │ 500V   │ 850 MΩ   │ ✅
  C-002    │ Faz-Nötr       │ 500V   │ 0.3 MΩ   │ ❌
```

### Minyatür Akım Pensesi (Clamp Meter)

```
Motorun aşırı yüklenip yüklenmediğini çalışırken ölç:

Motor Akımı Kontrolü:
  Ölçülen akım vs Motor etiketi (FLA - Full Load Amps)
  < %80 FLA   → Normal, rahat çalışıyor
  %80–100 FLA → Normal yükte
  %100–115 FLA→ Hafif aşırı yük (dikkat)
  >115 FLA    → Aşırı yük → Motor koruma devreye girmeli!

Üç faz dengesi:
  En yüksek faz akımı / Ortalama akım × 100 < %10 sapma
  >%10 sapma → Faz dengesizliği → motor ısınır
```

---

## 3. Dijital Sinyal (DI/DO) Arızaları

### Sorun: PLC'de sinyal görünmüyor (DI = 0, gerçekte sensör aktif)

```
Kontrol Sırası:
1. Sensör çıkış LED'i yanıyor mu?
   → Hayır: Sensör arızalı veya güç yok (Adım 2)
   → Evet: Kablo veya PLC sorunu (Adım 3)

2. Sensör besleme gerilimi (ölç):
   24VDC sensör: +24V ve 0V terminalde var mı?
   → Hayır: Güç kaynağı veya kablo (sigorta kontrol et)
   → Evet: Sensör arızalı (değiştir veya atla)

3. PLC'de terminal voltajı (ölç):
   Terminal - Common arası ölç
   → 24V: PLC I/O kartı arızalı (PLC firmware/kart değiştir)
   → 0V: Kablo yok veya açık devre (kablo süreklilik testi)

4. Kablo süreklilik testi (LOTO sonrası):
   Sensör tarafından PLC terminaline ölç
   → Sonsuz Ω: Kopuk kablo, bağlantı gevşek
   → 0Ω: Kablo sağlam → PLC tarafı sorunlu
```

### Sorun: DO çıkışı veriyor ama saha cihazı çalışmıyor

```
1. PLC çıkış LED'i yanıyor mu?
   → Hayır: PLC yazılım veya I/O kart sorunu
   → Evet: Devam et

2. Çıkış terminalinde voltaj var mı? (24V veya 230V)
   → Hayır: Sigorta, sigorta trafosu kontrol et
   → Evet: Devam et

3. Saha cihazının besleme ve kontrol girişini ölç:
   Röle bobin terminali: voltaj var mı?
   Solenoid vana: voltaj var mı?
   → Hayır: Ara kablo kopuk
   → Evet: Röle/solenoid arızalı

4. Mekanik sorun olabilir:
   Röle: Elle zorla çalıştır (test butonu)
   Vana: Manuel override dene
   → Çalışıyor: Elektriksel, güç yetmiyor
   → Çalışmıyor: Mekanik takılma
```

---

## 4. Analog Sinyal (AI/AO) Arızaları

### Ölçüm Değerleri Hızlı Referansı

```
4-20 mA Karşılıkları:
  3.5 mA  → Kablo kopuk / transmitter güçsüz (wire break)
  4.0 mA  → %0 (minimum)
  12.0 mA → %50
  20.0 mA → %100
  >20.5 mA→ Üst sınır aşıldı veya kısa devre

0-10 V Karşılıkları:
  0 V   → %0 minimum
  5 V   → %50
  10 V  → %100
  <0.1 V → Kablo kopuk veya transmitter güçsüz
```

### Sorun: Analog değer sabit veya mantıksız

```
Adım 1: PLC'de ham değeri oku (raw value)
  0 veya max (örn. 27648 Siemens) → Wire break veya kısa devre
  Makul ama yanlış ölçeklenmiş → Ölçekleme parametresi yanlış

Adım 2: Loop'ta akımı ölç (direkt terminalde)
  Multimetre → mA ölçüm → Transmitter çıkışına bağla
  Normal aralıkta mı? (4-20mA)
  → Evet ama PLC yanlış okuyorsa: Kablo veya PLC AI kartı
  → Hayır veya çok düşükse: Transmitter arızalı / besleme yok

Adım 3: Transmitter beslemesini ölç
  2-telli transmitter: Loop + terminali ile - terminali arası (24VDC)
  → <18V: Güç kaynağı veya kablo direnci fazla
  → Normal: Transmitter arızalı

Adım 4: Kablo direncini ölç (LOTO sonrası)
  > 100Ω kablo direnci: Akım hatasına neden olur
  (Uzun kablo + ince kesit → R = ρL/A)
```

---

## 5. Motor ve Sürücü Arızaları

### Motor Başlamıyor — Kontrol Sırası

```
1. Frekans sürücüsü (VFD) var mı?
   → Evet: Sürücü ekranındaki hata kodunu oku (Adım 2)
   → Hayır: Direkt motor kontrol (Adım 5)

2. VFD Hata Kodu:
   OC (Over Current)  → Mekanik takılma veya rampa çok hızlı
   OV (Over Voltage)  → Frenleme direnci veya AC gerilim yüksek
   UV (Under Voltage) → Şebeke gerilimi düşük veya sigorta
   OH (Over Heat)     → Hava akışı, çevre sıcaklığı, yük
   GF (Ground Fault)  → Motor sargı toprak kısası
   OL (Overload)      → Motor veya sürücü aşırı yük

3. Hata reset et:
   Önce arızanın nedenini gider
   Sonra reset et (genellikle STOP + RESET veya güç kesimine)

4. VFD parametreleri kontrol et:
   Motor akımı (Amps): Motor etiketi ile eşleşiyor mu?
   Motor frekansı (Hz): 50Hz mü?
   Min/Max frekans doğru mu?

5. Direkt start motoru:
   Kontaktör çekiyor mu? (ses veya LED)
   → Hayır: Kontrol devresi (bobin, termal röle, buton)
   → Evet: Motor veya güç devresi

6. Güç terminalleri ölç:
   R, S, T (giriş) → 400V AC var mı?
   U, V, W (çıkış) → Motor çalışınca 400V var mı?
   → Giriş var, çıkış yok → Kontaktör arızalı
```

### Motor Sıcak — Aşırı Isınıyor

```
Kontrol et:
□ Motor akımı motor etiketini aşıyor mu? (Clamp meter)
□ Havalandırma delikleri tıkalı mı? (toz, tortu)
□ Ortam sıcaklığı motor etiket değerini aşıyor mu?
  (Standart motor: maks. 40°C ortam)
□ Faz dengesizliği var mı? (3 fazın akımları birbirine yakın mı?)
□ Yatak sesi anormal mi? (rulman sesi)
□ Bağlantı flanş/kaplin hizalaması doğru mu?
```

---

## 6. PLC İletişim Arızaları

### Profinet/EtherNet/IP Cihaz Görünmüyor

```
1. Fiziksel:
   □ Ethernet kablosu takılı mı?
   □ Switch port LED'i yanıyor mu?
   □ Kablo süreklilik testi yap (çift yön)

2. IP Adresi:
   Laptop ile ping at: ping [hedef IP]
   → Başarısız: IP çakışması veya yanlış subnet
   → Başarılı ama PLC görmüyor: Profinet device name sorunu

3. Profinet Device Name:
   TIA Portal → Online → Erişilebilir cihazlar
   Cihaz listede mi? Device name TIA config ile eşleşiyor mu?
   → Device name uyumsuz: Cihaza doğru ismi yaz

4. GSD versiyonu:
   Cihaz firmware güncellemesi yapıldı mı?
   → Evet: Güncel GSD dosyasını indir ve TIA'ya ekle
```

### Modbus Cihazdan Cevap Yok

```
1. Seri bağlantı (RTU):
   □ A (+) ve B (-) doğru mu? (ters bağlı olabilir)
   □ Son cihazda termination resistor var mı?
   □ Baud rate, parity, stop bit — her iki taraf aynı mı?
   □ Slave ID doğru mu? (1-247 arası, her cihaz farklı)

2. TCP bağlantısı:
   □ IP ve port (502) doğru mu?
   □ Firewall engeli var mı?
   □ Cihazda maksimum bağlantı sayısı doldu mu?

3. Register adresi:
   □ Coil mi, Holding Register mi? (0xxxx vs 4xxxx)
   □ 0-based mi, 1-based mi? (Cihaz belgesi kontrol et)
   □ Read-only Register'a yazma komutu gönderilmiş olabilir
```

---

## 7. Güç Kaynağı Arızaları

### 24VDC Güç Kaynağı Sorunları

```
Belirti: 24V düşüyor veya sıfır

1. Giriş gerilimini ölç (L ve N terminalleri):
   220-230VAC var mı?
   → Hayır: Sigorta, MCB, kablo kontrol et
   → Evet: Güç kaynağının kendisi arızalı olabilir

2. Çıkış gerilimini ölç (+ ve - terminalleri):
   → 0V: Güç kaynağı arızalı (değiştir veya yük altında test et)
   → 24V ama yük altında düşüyor: Güç kaynağı yetersiz kapasitede

3. Yük akımını ölç (clamp meter, + hattı üzerinden):
   Toplam akım > Güç kaynağı max. akımı mı?
   → Evet: Yeni yük eklendi mi? Fazladan güç kaynağı ekle

4. Kısa devre tespiti:
   Güç kaynağı sürekli sıfıra düşüyor ve koruması devreye giriyorsa:
   → Yükleri tek tek kaldır, hangisinde normale dönüyor?
   → O yük kısa devre yapmış
```

---

## 8. Hızlı Arıza Tespit Kartları

### Kart 1: Sinyal Yok (DI = 0, sensör aktif görünüyor)

```
┌─────────────────────────────────────────────────────┐
│ 1. Sensör LED'i yanıyor mu?                        │
│    → HAYIR: Sensör beslemesini kontrol et (24VDC)  │
│    → EVET : Devam et ↓                             │
│                                                     │
│ 2. Kablo terminal voltajı (PLC girişinde)?          │
│    → 0V  : Kablo kopuk → Süreklilik testi yap      │
│    → 24V : PLC I/O kartı arızalı                   │
└─────────────────────────────────────────────────────┘
```

### Kart 2: Çıkış Var ama Cihaz Çalışmıyor

```
┌─────────────────────────────────────────────────────┐
│ 1. PLC çıkış LED'i yanıyor mu?                     │
│    → HAYIR: PLC yazılım / I/O kart sorunu          │
│    → EVET : Devam et ↓                             │
│                                                     │
│ 2. Çıkış terminalinde voltaj var mı?               │
│    → HAYIR: Sigorta, kablo kontrol et              │
│    → EVET : Devam et ↓                             │
│                                                     │
│ 3. Cihaz (röle/solenoid) terminalinde voltaj?      │
│    → HAYIR: Ara kablo kopuk                        │
│    → EVET : Cihazın kendisi arızalı               │
└─────────────────────────────────────────────────────┘
```

### Kart 3: Analog Değer Sabit veya Hatalı

```
┌─────────────────────────────────────────────────────┐
│ 1. PLC ham değeri = 0 veya max? → Wire break       │
│    PLC ham değeri makul? → Ölçekleme kontrol et    │
│                                                     │
│ 2. Loop'ta mA ölç (terminalde):                    │
│    4-20mA aralığında → PLC veya kablo sorunu       │
│    <4mA: Transmitter besleme kontrol et            │
│    0mA: Kablo kopuk veya transmitter arızalı       │
└─────────────────────────────────────────────────────┘
```

### Kart 4: Motor Başlamıyor

```
┌─────────────────────────────────────────────────────┐
│ 1. VFD hata kodu var mı?                           │
│    → EVET: Kod tablosuna bak, nedeni gider         │
│    → HAYIR: Devam et ↓                             │
│                                                     │
│ 2. Kontaktör çekiyor mu?                           │
│    → HAYIR: Kontrol devresi (bobin, buton, röle)   │
│    → EVET : Devam et ↓                             │
│                                                     │
│ 3. Motor çıkış terminallerinde voltaj var mı?      │
│    → HAYIR: Kontaktör güç kontakları arızalı      │
│    → EVET : Motor sargısı veya mekanik takılma    │
└─────────────────────────────────────────────────────┘
```

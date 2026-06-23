# Güvenli Çalışma Prosedürleri Referansı
**Standart**: IEC 60079 / NFPA 70E / TS EN ISO 45001 uyumlu | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [LOTO Prosedürü](#1-loto)
2. [Çalışma İzni (Permit to Work)](#2-calisma-izni)
3. [Kişisel Koruyucu Donanım (KKD)](#3-kkd)
4. [Elektrikle Çalışma Kuralları](#4-elektrik)
5. [Yüksekte Çalışma](#5-yuksekte)
6. [Risk Değerlendirmesi (Saha Düzeyi)](#6-risk)
7. [İlk Yardım ve Acil Durum](#7-acil)
8. [Saha Çalışma Günlüğü Formu](#8-gunluk)
9. [Sık Karşılaşılan Tehlikeler](#9-tehlikeler)

---

## 1. LOTO Prosedürü

### LOTO Nedir?
**L**ock**O**ut / **T**ag**O**ut: Bakım veya onarım sırasında makinenin **beklenmedik şekilde enerji almasını** engelleyen prosedür.

> ⚠️ LOTO uygulamadan hiçbir ekipman bakımına başlama. Bu kural istisnasızdır.

### Enerji Kaynakları (Hepsini Kilitle!)

| Enerji Tipi | Örnek | Kilitleme Yöntemi |
|------------|-------|------------------|
| Elektrik | Motor, kontrol panosu | Sigorta/şalter kilidi |
| Pnömatik | Silindir, vana | Basınç tahliye + hava kesme kilidi |
| Hidrolik | Silindir, pres | Basınç tahliye + pompa kilidi |
| Mekanik | Yay, ağırlık | Mekanik destek / blok |
| Termal | Buhar, sıcak yüzey | İzolasyon valfi kilidi + soğuma bekleme |
| Kimyasal | Boru içi basınçlı sıvı | Vana kilidi + basınç tahliye |

### LOTO Uygulama Adımları

```
ADIM 1 — HAZIRLIK
  □ Ekipmanı ve enerji kaynaklarını tanımla
  □ Yetkili kişiyle (supervisor) iletişim kur
  □ Etkilenecek personeli bilgilendir
  □ LOTO kitini hazırla (kilit, etiket, hasp)

ADIM 2 — NORMAL DURDURMA
  □ Ekipmanı normal prosedürle durdur
  □ Operatörü bilgilendir

ADIM 3 — ENERJİ KESİMİ
  □ Her enerji kaynağını izole et (sigorta, vana, vb.)
  □ Ana şalteri aç (OFF konumuna getir)

ADIM 4 — KİLİTLEME VE ETİKETLEME
  □ Her izolasyon noktasına KENDİ kilidini tak
  □ Her kilide kendi adını ve tarihini içeren etiket tak
  □ [EtiketÖrneği: "KİLİT / Orhan Yılmaz / 22.06.2026 / Dokunma!"]

ADIM 5 — ARTIK ENERJİ TAHLİYESİ
  □ Elektrik: Kapasitör deşarjını bekle, voltajı ölç (0V doğrula)
  □ Pnömatik: Tüm basıncı tahliye et, manometreyi kontrol et (0 bar)
  □ Hidrolik: Silindiri tam düşür, basıncı tahliye et
  □ Yerçekimi: Hareketli parçaları mekanik destekle sabitle

ADIM 6 — DOĞRULAMA
  □ Ekipmanı çalıştırmayı dene → çalışmıyor olmalı
  □ Çalışma arkadaşın LOTO uygulamasını kontrol etsin
  □ ✅ Artık güvenle çalışabilirsin

ADIM 7 — SERBEST BIRAKMA (İş Bitince)
  □ Tüm aletleri ve parçaları topla
  □ Personeli bölgeden uzaklaştır
  □ SADECE KENDİ KİLİDİNİ ÇIKAR
  □ Operatörü bilgilendir, enerji ver
```

### Önemli LOTO Kuralları

```
✓ Her teknisyen KENDİ kilidini takar
✓ Başkasının kilidi hiçbir zaman çıkarılamaz
✓ İş yarıda bırakılacaksa kilit yerinde kalır
✓ Kayıp anahtar → Yetkili personel prosedürü, kesici-açma
✓ Grup çalışması: Her kişi kendi kilidini takar (hasp kullanılır)
✗ Etiket tek başına yeterli değil — kilit de şart
```

---

## 2. Çalışma İzni (Permit to Work)

### İzin Gerektiren Çalışmalar

| Çalışma Tipi | İzin Sınıfı |
|-------------|------------|
| Yüksek gerilim (>1000V) çalışma | Elektrik Çalışma İzni |
| Sınırlı alan (kapalı) girişi | Kapalı Alan İzni |
| Yüksekte çalışma (>2m) | Yüksekte Çalışma İzni |
| Sıcak çalışma (kaynak, taşlama) | Sıcak Çalışma İzni |
| Tehlikeli madde bölgesi | Tehlikeli Alan İzni |
| ATEX bölge | ATEX Çalışma İzni |

### Çalışma İzni Formu

```
╔══════════════════════════════════════════════════════╗
║              ÇALIŞMA İZNİ FORMU                     ║
╠══════════════════════════════════════════════════════╣
║ İzin No     : PTW-_______                           ║
║ Tarih       :              Saat: Başlangıç: __:__   ║
║                                  Bitiş:    __:__   ║
║ İzin Tipi   : ☐ Elektrik  ☐ Sıcak  ☐ Yüksek        ║
║               ☐ Kapalı Alan       ☐ Tehlikeli Madde ║
╠══════════════════════════════════════════════════════╣
║ ÇALIŞMA BİLGİLERİ                                   ║
║ Çalışma Yeri:                                       ║
║ Ekipman/Tag :                                       ║
║ Yapılacak İş:                                       ║
╠══════════════════════════════════════════════════════╣
║ ÇALIŞACAK KİŞİLER                                   ║
║ Sorumlu     :                    Yetki Belge No:    ║
║ Yardımcılar :                                       ║
╠══════════════════════════════════════════════════════╣
║ ALINAN ÖNLEMLER                                     ║
║ ☐ LOTO uygulandı      Kilit No(lar):               ║
║ ☐ KKD belirlendi ve giyildi                         ║
║ ☐ Etkilenen personel bilgilendirildi                ║
║ ☐ Yangın söndürücü hazır (sıcak çalışma)           ║
║ ☐ Gaz ölçümü yapıldı (kapalı alan / ATEX)          ║
║ ☐ Emniyet halatı bağlandı (yüksek çalışma)         ║
║ ☐ İkinci kişi (gözetmen) görevde                    ║
╠══════════════════════════════════════════════════════╣
║ ONAYLAR                                             ║
║ Veren (Yetkili)  : ______________ İmza: __________  ║
║ Alan (Teknisyen) : ______________ İmza: __________  ║
╠══════════════════════════════════════════════════════╣
║ KAPANIŞ                                             ║
║ İş tamamlandı: ☐ Evet  ☐ Hayır (Neden: __________)  ║
║ Alan temizlendi: ☐ Evet                              ║
║ LOTO kaldırıldı: ☐ Evet                              ║
║ Kapanış imzası: ________________________            ║
╚══════════════════════════════════════════════════════╝
```

---

## 3. Kişisel Koruyucu Donanım (KKD)

### Çalışma Tipine Göre KKD Tablosu

| KKD | Genel Saha | Elektrik | Yüksekte | Kaynak |
|-----|-----------|---------|---------|--------|
| Baret (EN 397) | ✅ | ✅ | ✅ | ✅ |
| Emniyet gözlüğü | ✅ | ✅ | ✅ | Kaynak maskesi |
| Kulak koruyucu | Gürültülü ise | — | — | ✅ |
| İş eldiveni | ✅ | İzole eldiven | ✅ | Kaynak eldiveni |
| Çelik burunlu ayakkabı | ✅ | İzole ayakkabı | ✅ | ✅ |
| Emniyet kemeri | — | — | ✅ (>2m) | — |
| Yansıtıcı yelek | ✅ | ✅ | ✅ | ✅ |
| Arc flash suit | — | >50V canlı | — | — |

### Elektrik KKD — Arc Flash Kategori

| Kategori | Risk | Koruyucu |
|---------|------|---------|
| 0 | <1.2 cal/cm² | Pamuklu iş elbisesi |
| 1 | 1.2–4 cal/cm² | Arc flash shirt + baret + yüz siperi |
| 2 | 4–8 cal/cm² | Arc flash suit (8 cal) |
| 3 | 8–25 cal/cm² | Arc flash suit (25 cal) |
| 4 | 25–40 cal/cm² | Arc flash suit (40 cal) |

> ⚠️ 1000V üzeri veya arc flash kategorisi belirlenmemişse enerjiyi kes!

---

## 4. Elektrikle Çalışma Kuralları

### Enerji Varlığı Doğrulama — Altı Adım

```
1. Kişisel KKD'yi tak
2. Gerilim dedektörünü test et (bilinen bir gerilim kaynağında)
3. Ölçüm yap (tüm fazlar, faz-nötr, faz-toprak)
4. Dedektörü tekrar test et (hâlâ çalışıyor mu?)
5. Sonuç: Tüm ölçümler 0V → ENERJİSİZ (güvenli)
6. Gerilim varsa → DURDUĞU YERİNDE KAL, yetkiliyi ara
```

### Çalışma Mesafeleri (IEC 60364)

```
Gerilim Seviyesi    Sınır Mesafesi    Güvenli Çalışma Mesafesi
──────────────────────────────────────────────────────────────
230V / 400V (LV)    25 cm             > 50 cm (enerjiyi kes!)
1–35 kV (MV)        70 cm – 2m        MV uzmanı gerekir
> 35 kV (HV)        > 2m              Kesinlikle uzman
```

### Pano İçi Çalışma Kontrol Listesi

```
ENERJI VARMIKEN (Canlı pano — mümkün olduğunca kaçın):
□ Çalışma izni alındı
□ Arc flash KKD giyildi
□ İkinci kişi (gözetmen) kapı yanında
□ İzole alet kullanılıyor
□ Pano kapısı 90° açık (kaçış yolu açık)
□ Sadece kesinlikle gerekli işlem yapılıyor

ENERJİ KESILMIŞKEN (Tercihli):
□ LOTO tamamlandı ve doğrulandı
□ Standart KKD yeterli
□ Normal alet kullanılabilir
```

---

## 5. Yüksekte Çalışma

### Tanım: 2 metre ve üzeri her çalışma yüksekte çalışmadır.

### Çalışma İzni + Risk Değerlendirmesi Zorunlu

```
DÜŞME KORUMALARI (öncelik sırasıyla):
1. Toplu koruma    → Korkuluk, bariyer, platform
2. Düşme durdurma → Emniyet kemeri + halat (EN 361)
3. Düşme kısıtlama → Konumlandırma kemeri (kenara yaklaşmayı engeller)

YASAK:
✗ Merdivenden uzanarak çalışma (2 kolun birden bırakılması)
✗ Emniyet halatı olmadan düz çatıda çalışma
✗ Rüzgarlı havada (>10 m/s) yüksekte çalışma
✗ Yanlara bağlanmamış merdiven kullanımı
```

### Seyyar Merdiven Kuralları

```
□ Zemin açısı: 75° (3'e-1 kuralı: 3m yüksek = 1m yana)
□ Üst uç desteğe yaslanmış veya bağlanmış
□ Alt uç kaymaması için kilitli veya tutuluyor
□ Merdivende ikiden fazla kişi yok
□ El daima merdivenle, bir elde maksimum 1 alet
□ Çalışma noktası ± 60 cm yan erişim limitinde
```

---

## 6. Risk Değerlendirmesi (Saha Düzeyi)

### 5 Adımlı Saha Risk Değerlendirmesi (Çalışmadan Önce)

```
ADIM 1 — TEHLİKEYİ TANIMLA
  □ Elektrik tehlikesi var mı?
  □ Kimyasal veya yanıcı madde var mı?
  □ Hareketli makine parçası var mı?
  □ Yükseklik tehlikesi var mı?
  □ Kapalı alan mı?
  □ Sıcak yüzey veya buhar var mı?

ADIM 2 — RİSK SEVİYESİ BELİRLE
  Risk = Olasılık × Şiddet
  
  Şiddet:  1=Hafif yaralanma, 3=Orta, 5=Ölüm/Kalıcı sakatlık
  Olasılık: 1=Çok düşük, 3=Orta, 5=Çok yüksek
  
  Risk ≤ 4  → Düşük  — Standart önlemlerle devam
  Risk 5-12 → Orta   — Ek önlem al, sonra devam
  Risk ≥ 13 → Yüksek — DURDUĞUN YERDE KAL, yetkiliyi ara

ADIM 3 — ÖNLEM AL
  Hiyerarşi: Elimine et → İzole et → Mühendislik → İdari → KKD

ADIM 4 — ÇALIŞ

ADIM 5 — KAYDET
  Saha günlüğüne risk değerlendirmesini not et
```

---

## 7. İlk Yardım ve Acil Durum

### Elektrik Çarpması — İlk Müdahale

```
1. DOKUNMA! Çarpılmış kişiye dokunma (sen de çarpılırsın)
2. Panik yapma — güvenli mesafede dur
3. ENERJİYİ KES — Ana şalteri veya sigortayı aç
4. Enerji kesildiğinde → Yardım için çağır (İş kazası: 112)
5. Kişi bilinçsizse → CPR başla (eğitimli isen)
6. Yanık varsa → Soğuk su (15-20 dakika), sarma yok
7. Olayı bildirme: Vardiya amiri → İşyeri hekimi → Yasal bildirim
```

### Acil Numaralar (Forma Doldurulacak)

```
Genel Acil       : 112
İtfaiye          : 110
Polis            : 155
Tesis Güvenliği  : ___________
Vardiya Amiri    : ___________
İşyeri Hekimi    : ___________
Proje Müdürü     : ___________
Yakın Hastane    : ___________
```

### Kaza Bildirimi Adımları

```
1. Kazayı anlık: Vardiya amirini ara
2. 24 saat içinde: Yazılı kaza raporu → İK
3. 3 iş günü içinde: SGK'ya yasal bildirim (işveren)
4. Aynı gün: Kaza yerini koru (soruşturma için)
5. Fotoğraf çek (izin varsa)
```

---

## 8. Saha Çalışma Günlüğü Formu

```
╔══════════════════════════════════════════════════════╗
║             SAHA ÇALIŞMA GÜNLÜĞÜ                    ║
╠══════════════════════════════════════════════════════╣
║ Tarih       :          Teknisyen:                   ║
║ Proje       :                                       ║
║ Konum / Alan:                                       ║
║ Çalışma Saati: Başlangıç: __:__  Bitiş: __:__      ║
╠══════════════════════════════════════════════════════╣
║ GÜVENLİK KONTROL LİSTESİ (İşe Başlamadan)          ║
║ □ Çalışma izni alındı     İzin No: PTW-_______      ║
║ □ LOTO uygulandı          Kilit No: ___________     ║
║ □ KKD giyildi             Tip: ________________    ║
║ □ Risk değerlendirmesi yapıldı                      ║
║ □ İş arkadaşı / gözetmen bilgilendirdi              ║
╠══════════════════════════════════════════════════════╣
║ YAPILAN İŞLER                                       ║
║ 1.                                                  ║
║ 2.                                                  ║
║ 3.                                                  ║
║ 4.                                                  ║
╠══════════════════════════════════════════════════════╣
║ ÖLÇÜM DEĞERLERİ                                     ║
║ Ölçüm Noktası  │ Beklenen │ Ölçülen │ Sonuç         ║
║ ───────────────┼──────────┼─────────┼──────────     ║
║                │          │         │               ║
║                │          │         │               ║
╠══════════════════════════════════════════════════════╣
║ KULLANILAN MALZEME / YEDEK PARÇA                    ║
║ 1.                        Miktar:                   ║
║ 2.                        Miktar:                   ║
╠══════════════════════════════════════════════════════╣
║ SORUNLAR VE GÖZLEMLER                               ║
║                                                     ║
╠══════════════════════════════════════════════════════╣
║ YARIN İÇİN PLAN                                     ║
║                                                     ║
╠══════════════════════════════════════════════════════╣
║ İş Tamamlandı: ☐ Evet  ☐ Kısmen  ☐ Hayır          ║
║ LOTO Kaldırıldı: ☐ Evet  ☐ Devam ediyor            ║
║ İmza: ______________________________                ║
╚══════════════════════════════════════════════════════╝
```

---

## 9. Sık Karşılaşılan Tehlikeler

| Durum | Tehlike | Yapılacak |
|-------|---------|----------|
| Pano kapısı açık, motor çalışıyor | Arc flash, temas | Kapıyı kapat; içerde çalışacaksan enerjiyi kes |
| Kablo izolasyonu hasarlı | Elektrik çarpması | Bant yapıştırma yok; kabloyu değiştir |
| Salmastra sızdırıyor | Kayma, kimyasal temas | Bölgeyi işaretle, acil bildir |
| Pistonlu silindir üstte asılı | Ezilme | Mekanik destek koy, LOTO uygula |
| Gaz kokusu var | Patlama, zehirlenme | BÖLGEYI TERK ET, havalandır, yetkiliyi ara |
| Buhar hattı sıcak | Yanma | Uyarı etiketi; gerekirse izolasyon var mı kontrol et |
| Zemin yağlı / ıslak | Kayma, düşme | Çalışma öncesi temizle veya kaydırmaz mat koy |
| Kumanda panosunda tanımlanamayan kablo | Yanlış bağlantı | Dokunma! Şemayı bul veya yetkiliyi ara |

# PLC Haberleşme Protokolleri Referansı
**Kapsam**: Endüstriyel fieldbus ve Ethernet protokolleri | **Revizyon**: 1.0 | **Tarih**: 2026-06

---

## İÇİNDEKİLER
1. [Protokol Seçim Rehberi](#1-protokol-seçimi)
2. [Profinet](#2-profinet)
3. [EtherNet/IP](#3-ethernetip)
4. [Modbus TCP / RTU](#4-modbus)
5. [OPC-UA](#5-opc-ua)
6. [Profibus DP (Legacy)](#6-profibus)
7. [MQTT (IoT / Cloud)](#7-mqtt)
8. [Ağ Adresleme Şablonu](#8-adresleme)
9. [Sorun Giderme](#9-troubleshooting)

---

## 1. Protokol Seçim Rehberi

```
Ne bağlıyorsunuz?
│
├── PLC ←→ Sürücü / Uzak I/O / Robot
│   ├── Siemens CPU    → Profinet (öncelikli)
│   ├── AB / Rockwell  → EtherNet/IP
│   └── Çoklu marka    → Modbus TCP (en yaygın ortak dil)
│
├── PLC ←→ SCADA / HMI
│   ├── Aynı marka     → Marka native (S7-1500 ↔ WinCC = S7 Protocol)
│   └── Farklı marka   → OPC-UA (standart, güvenli)
│
├── PLC ←→ MES / ERP / Bulut
│   └── → OPC-UA veya MQTT
│
└── Eski ekipman (RS-485, seri)
    └── → Modbus RTU → Modbus TCP Gateway
```

| Protokol | Hız | Mesafe | Marka Bağımsız | Güvenlik | Tipik Kullanım |
|----------|-----|--------|----------------|---------|----------------|
| Profinet | Hızlı (1ms) | 100m/switch | Siemens ağırlıklı | Orta | Sürücü, I/O |
| EtherNet/IP | Hızlı | 100m/switch | AB ağırlıklı | Orta | Sürücü, I/O |
| Modbus TCP | Orta | 100m/switch | ✅ Evrensel | Düşük | Legacy cihaz |
| Modbus RTU | Yavaş | 1200m | ✅ Evrensel | Düşük | Seri cihaz |
| OPC-UA | Orta | Network | ✅ Evrensel | ✅ Yüksek | SCADA, MES |
| Profibus DP | Orta (12Mbps) | 1200m | Siemens ağırlıklı | Düşük | Eski saha |
| MQTT | Değişken | Internet | ✅ Evrensel | ✅ Yüksek | IoT, bulut |

---

## 2. Profinet

### Temel Kavramlar

| Terim | Açıklama |
|-------|----------|
| Controller | PLC (veri gönderen/alan taraf) |
| Device | Uzak I/O, sürücü (slave) |
| Device Name | Her cihazın benzersiz text adı (örn: `conv1-drive1`) |
| IP Address | Her cihazın IP'si (subnet aynı olmalı) |
| GSD File | Cihaz tanımlama dosyası (`.gsd` / `.gsdml`) — TIA'ya import edilir |
| Slot/Subslot | Modül adresleme yapısı |
| Update Time | Veri yenileme süresi (tipik: 1-4 ms) |

### TIA Portal Profinet Konfigürasyonu

```
Adım 1: GSD/GSDML Dosyası Yükleme
  TIA Portal → Seçenekler → Donanım Yönetimi →
  GSD Dosyalarını Yönet → GSD Dosyasını Yükle

Adım 2: Cihazı Ekle
  Ağ Görünümü → Katalog → [Cihaz markası] →
  [Model] → Sürükle bırak

Adım 3: IP ve Device Name Ata
  Cihaza çift tıkla → Özellikler →
  PROFINET arabirimi → Ethernet adresi
  Device name: conv1-drive1  (küçük harf, tire ile)
  IP: 192.168.1.10

Adım 4: Modülleri Yapılandır
  Cihaz görünümü → Katalog → Modülleri slotlara sürükle
  → I/O adresleri otomatik atanır (veya manuel)

Adım 5: Device Name'i Fiziksel Cihaza Yaz
  Online → Erişilebilir cihazlar → Cihazı bul →
  Device name ata → Tamam
  (Bu adım fiziksel cihaza bir kez yapılır)
```

### Profinet Hata Kodları

| Hata | Anlam | Çözüm |
|------|-------|-------|
| `0x8000` | Device name uyuşmuyor | TIA'daki isim ile cihazdaki ismi karşılaştır |
| `0x8001` | IP adresi çakışması | Network'te IP taraması yap |
| `0x8002` | GSD versiyonu uyumsuz | Güncel GSD dosyasını indir |
| Sarı uyarı simgesi | Konfigürasyon ≠ Online durum | Online cihaz yapısını karşılaştır |

### Profinet I/O Adres Şablonu

```
Cihaz             Device Name       IP             Input Adres   Output Adres
─────────────────────────────────────────────────────────────────────────────
Uzak I/O ET200SP  rio-panel-a1      192.168.1.20   %I64.0        %Q64.0
Sürücü G120       vfd-conv1         192.168.1.30   %I96.0        %Q96.0
Robot IRC5 GW     robot-cell1       192.168.1.40   %I128.0       %Q128.0
```

---

## 3. EtherNet/IP

### Temel Kavramlar

| Terim | Açıklama |
|-------|----------|
| Scanner | PLC (master) |
| Adapter | Sürücü, uzak I/O (slave) |
| EDS File | Electronic Data Sheet — Studio 5000'e import edilir |
| Connection | İki cihaz arası iletişim bağlantısı |
| RPI | Requested Packet Interval — veri güncelleme periyodu (ms) |
| Instance | Mesaj türü numarası (100=input, 150=output tipik) |

### Studio 5000 Konfigürasyonu

```
Adım 1: EDS Dosyası Yükleme
  Tools → EDS Hardware Installation Tool →
  Register an EDS file → [dosya yolu]

Adım 2: Cihazı Ekle
  I/O Configuration → Ethernet → Yeni Modül →
  [Cihaz modeli seç] → OK

Adım 3: Cihaz Parametreleri
  IP Address: 192.168.1.10
  RPI: 10ms (tipik)
  Connection Path: varsayılan

Adım 4: Tag'ler Otomatik Oluşur
  Local:1:I.Data[0]  → Input word 0
  Local:1:O.Data[0]  → Output word 0
```

### EtherNet/IP Bit Eşleştirme (PowerFlex 525 Örneği)

```
ÇIKIŞ (PLC → Sürücü):
  Local:4:O.Data[0].0  = Start (1=çalıştır)
  Local:4:O.Data[0].1  = Stop  (1=durdur)
  Local:4:O.Data[0].2  = Direction (0=ileri, 1=geri)
  Local:4:O.Data[1]    = Speed Reference (Hz × 10, örn: 500 = 50Hz)

GİRİŞ (Sürücü → PLC):
  Local:4:I.Data[0].0  = Running (çalışıyor)
  Local:4:I.Data[0].1  = Faulted (arızalı)
  Local:4:I.Data[0].2  = Ready   (hazır)
  Local:4:I.Data[1]    = Output Frequency (Hz × 10)
  Local:4:I.Data[2]    = Output Current   (A × 10)
```

---

## 4. Modbus

### Modbus TCP — Bağlantı

```
Siemens TIA Portal (MB_CLIENT kullanımı):
─────────────────────────────────────────
MB_CLIENT_DB: Data block (her bağlantı için bir tane)
  .MB_HOLD_REG: VARIANT → okunacak/yazılacak array
  .CONNECT:
    InterfaceId: 64 (Local~PROFINET~Port_1)
    ID: 1  (bağlantı numarası)
    ConnectionType: 16#0B (TCP)
    ActiveEstablished: TRUE
    RemoteAddress: '192.168.1.200'
    RemotePort: 502

MB_CLIENT(
  REQ         := m_MbReqTrig,
  MB_ADDR     := 1,       // Slave ID
  MODE        := 0,       // 0=Read, 1=Write
  DATA_ADDR   := 40001,   // Holding register adresi
  DATA_LEN    := 10,      // Okunacak register sayısı
  CONNECT     := "MbConn_DB".CONNECT,
  DATA_PTR    := "Modbus_Data_DB".InputRegs
);
```

### Modbus Register Haritası

| Register Tipi | Adres Aralığı | Erişim | Açıklama |
|--------------|--------------|--------|----------|
| Coil | 00001–09999 | Okuma/Yazma | Dijital çıkış (1 bit) |
| Discrete Input | 10001–19999 | Sadece Okuma | Dijital giriş (1 bit) |
| Input Register | 30001–39999 | Sadece Okuma | Analog giriş (16 bit) |
| Holding Register | 40001–49999 | Okuma/Yazma | Genel amaçlı (16 bit) |

### Örnek Register Haritası (Pompa Kontrolü)

```
Holding Register Haritası — Pompa Sürücüsü
─────────────────────────────────────────────────────
Adres   │ Tip    │ Açıklama              │ Birim
────────┼────────┼───────────────────────┼──────────
40001   │ UINT   │ Kontrol kelimesi      │ Bitfield
        │        │  .0 = Start           │
        │        │  .1 = Stop            │
        │        │  .2 = Reset           │
40002   │ UINT   │ Hız referansı         │ rpm × 10
────────┼────────┼───────────────────────┼──────────
40011   │ UINT   │ Durum kelimesi        │ Bitfield (RO)
        │        │  .0 = Running         │
        │        │  .1 = Fault           │
        │        │  .2 = Ready           │
40012   │ UINT   │ Mevcut hız            │ rpm × 10
40013   │ UINT   │ Motor akımı           │ A × 10
40014   │ UINT   │ Arıza kodu            │
```

### Modbus RTU (RS-485) Kablo Bağlantısı

```
PLC RS-485 Portu    Cihaz 1         Cihaz 2         Son Cihaz
───────────────────────────────────────────────────────────────
A (+) ──────────── A (+) ───────── A (+) ───────── A (+) ┐
B (-) ──────────── B (-) ───────── B (-) ───────── B (-) ┤
GND  ──────────── GND  ───────── GND  ───────── GND  ┘ 120Ω
                                                    (son direnç)

Önemli Notlar:
• Maks. 32 cihaz (repeater olmadan)
• Kablo uzunluğu: 1200m @ 9600 baud
• Her cihaza benzersiz Slave ID (1-247)
• Sadece 1 master olabilir
```

---

## 5. OPC-UA

### OPC-UA Mimari Seçenekleri

```
Seçenek A — Gömülü OPC-UA (Yeni PLC'ler)
  PLC (OPC-UA Server)
      │
      └── SCADA / MES (OPC-UA Client)
  
  Avantaj: Ekstra yazılım yok, düşük gecikme
  Dezavantaj: PLC CPU yükü artıyor
  Siemens: TIA Portal OPC-UA server aktive et
  AB: FactoryTalk Linx Gateway gerekli

Seçenek B — Gateway (Eski PLC'ler)
  PLC (Marka protokolü) → OPC-UA Gateway → SCADA/MES
  
  Popüler gateway: Kepware, Matrikon, Prosys
```

### TIA Portal OPC-UA Sunucu Aktivasyonu

```
Adım 1: Runtime Lisans Kontrolü
  Proje → PLC → Özellikler → Runtime lisanslar →
  OPC UA Sunucu lisansı mevcut mu? Kontrol et

Adım 2: Sunucuyu Aktive Et
  Proje → PLC → OPC UA → Genel →
  ☑ OPC UA sunucuyu aktive et
  Port: 4840 (standart)

Adım 3: Güvenlik Politikası
  Erişim Noktası → Güvenlik Ayarları →
  Politika: Basic256Sha256 (önerilen)
  Kimlik doğrulama: Kullanıcı adı + şifre

Adım 4: Tag'leri Yayınla
  PLC Tag tablosu → İstenen tag → Özellikler →
  ☑ OPC UA'dan erişilebilir

Adım 5: Client Test
  UaExpert (ücretsiz) ile bağlan:
  opc.tcp://192.168.1.1:4840
```

### OPC-UA Node ID Formatları

```
Namespace 0: OPC-UA standart (okuma/yazma yapmayın)
Namespace 3: TIA Portal PLC tags (tipik)

Örnekler:
  ns=3;s="CONV1_MOTOR1_RUN"    → Tag adıyla erişim
  ns=3;s="DB_Recipe".Speed[0]  → DB elemanı
  ns=2;i=1001                  → Numeric ID
```

---

## 6. Profibus DP (Legacy)

> ⚠️ Yeni projelerde kullanmayın. Sadece mevcut sistemlerde kullanın.

### Temel Özellikler

| Parametre | Değer |
|-----------|-------|
| Hız | 9.6 kbps – 12 Mbps |
| Maks. uzunluk | 1200m @ 9.6 kbps, 100m @ 12 Mbps |
| Konnektör | DB-9 (9-pin D-Sub) |
| Son direnç | Her son cihazda aktif edilmeli |
| Maks. slave | 126 |

### GSD Dosyası ve Konfigürasyon

```
1. GSD dosyasını Siemens hardware catalog'a ekle
   (TIA: Donanım Yönetimi → GSD Yükle)

2. Profibus segmenti oluştur
   DP Master: CPU veya CP342-5

3. Slave cihazını ekle, adres ata (1-126)

4. Modülleri konfigüre et (GSD'deki slot yapısına göre)

5. Baud rate: Tüm ağda aynı!
   Mesafeye göre maks. baud rate seç
```

---

## 7. MQTT (IoT / Cloud Entegrasyonu)

### MQTT Temel Kavramlar

| Terim | Açıklama |
|-------|----------|
| Broker | Merkezi mesaj sunucusu (Mosquitto, HiveMQ, AWS IoT) |
| Publisher | Veri gönderen (PLC, sensör) |
| Subscriber | Veri alan (SCADA, bulut, dashboard) |
| Topic | Mesaj kategorisi (hiyerarşik) `fabrika/hat1/conv1/hiz` |
| QoS 0 | En fazla bir kez (fire and forget) |
| QoS 1 | En az bir kez (alındı onayı) |
| QoS 2 | Tam olarak bir kez (en güvenli) |

### Topic Hiyerarşisi Önerisi

```
[fabrika]/[hat]/[ekipman]/[veri_tipi]

Örnekler:
  uretim/hat1/conv1/hiz_rpm        → Anlık değer
  uretim/hat1/conv1/calisma_durumu → Boolean
  uretim/hat1/motor1/akim_a        → Analog
  uretim/hat1/alarm/aktif          → Alarm durumu

Wildcard kullanımı (subscriber):
  uretim/hat1/+/hiz_rpm    → Hat1'deki tüm cihazların hızı
  uretim/#                 → Tüm üretim verisi
```

### Ignition MQTT Engine Yapılandırması

```
Adım 1: MQTT Engine modülü kur (Cirrus Link)
Adım 2: Broker bağlantısı tanımla
  Host: 192.168.1.250
  Port: 1883 (düz) / 8883 (TLS)
  Client ID: ignition-scada-01
Adım 3: Sparkplug B protokolü seç (önerilen)
  Namespace: spBv1.0
  Group: fabrika1
  Edge Node: plc-hat1
Adım 4: Tag'ler otomatik keşfedilir
```

---

## 8. Ağ Adresleme Şablonu

### Önerilen OT (Operational Technology) Ağ Mimarisi

```
Internet / IT Ağı
      │
   Firewall (DMZ)
      │
  ┌───┴────────────────────────────────┐
  │  Seviye 4-5: Enterprise / MES     │  VLAN 10: 10.10.0.0/24
  └───┬────────────────────────────────┘
   DMZ / Veri Köprüsü (OPC-UA / Historian)
  ┌───┴────────────────────────────────┐
  │  Seviye 3: SCADA / Historian      │  VLAN 20: 10.20.0.0/24
  └───┬────────────────────────────────┘
   L3 Switch (VLAN routing kısıtlı)
  ┌───┴────────────────────────────────┐
  │  Seviye 2: PLC / Kontrol          │  VLAN 30: 192.168.1.0/24
  └───┬────────────────────────────────┘
   Managed Switch (ring topoloji önerilen)
  ┌───┴────────────────────────────────┐
  │  Seviye 1: Fieldbus / Sürücüler   │  VLAN 40: 192.168.2.0/24
  └────────────────────────────────────┘
```

### IP Adresleme Tablosu Şablonu

```
Alt Ağ: 192.168.1.0/24  |  Gateway: 192.168.1.1
────────────────────────────────────────────────────────────────
IP Adresi      │ Cihaz              │ Protokol  │ Not
───────────────┼────────────────────┼───────────┼──────────────
192.168.1.1    │ Managed Switch     │ —         │ Gateway
192.168.1.10   │ PLC CPU (Hat 1)    │ Profinet  │ OPC-UA server
192.168.1.11   │ PLC CPU (Hat 2)    │ Profinet  │
192.168.1.20   │ SCADA Server       │ OPC-UA    │
192.168.1.21   │ Engineering WS     │ —         │ Sadece geliştirme
192.168.1.30   │ HMI Panel 1        │ —         │
192.168.1.31   │ HMI Panel 2        │ —         │
192.168.1.50   │ Uzak I/O ET200SP-1 │ Profinet  │
192.168.1.51   │ Uzak I/O ET200SP-2 │ Profinet  │
192.168.1.60   │ Sürücü VFD-1       │ Profinet  │
192.168.1.61   │ Sürücü VFD-2       │ Profinet  │
192.168.1.200  │ Enerji Analizörü   │ Modbus TCP│ Slave ID: 1
192.168.1.201  │ Barcode Reader     │ TCP       │
```

---

## 9. Sorun Giderme

### Genel Network Teşhis Adımları

```
1. Fiziksel katman:
   ping [hedef IP]         → Erişilebilir mi?
   arp -a                  → MAC adresi görünüyor mu?
   → Hayır: Kablo, switch port, IP adresi kontrol et

2. Protokol katmanı:
   Wireshark ile trafik yakala
   → Paket gidiyor mu?
   → Cevap geliyor mu?
   → Hata kodu var mı?

3. Konfigürasyon:
   → Her iki tarafın aynı parametrelerle yapılandırıldığını kontrol et
   → Siemens: TIA "Erişilebilir cihazlar" taraması yap
   → AB: RSLinx'te cihazı bul
```

### Protokol Özel Sorun Giderme

| Protokol | Belirti | Kontrol Et |
|----------|---------|------------|
| Profinet | Device kırmızı | Device name eşleşmesi, GSD versiyonu |
| Profinet | Sarı ünlem | Beklenen ≠ gerçek modül konfigürasyonu |
| EtherNet/IP | Faulted connection | RPI süresi, EDS versiyonu |
| Modbus TCP | Timeout | Slave ID, register adresi, coil/holding ayrımı |
| Modbus RTU | Veri yok | Son direnç, kablo polaritesi (A/B), baud rate |
| OPC-UA | Bağlantı reddi | Sertifika güven, kullanıcı yetkisi, güvenlik politikası |
| MQTT | Subscribe edilmiyor | Topic ismi (büyük/küçük harf), wildcard sözdizimi |

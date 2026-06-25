# Progress — ProjeHaritası

*Son güncelleme: 2026-06-25*

## Çalışan Özellikler

### Temel Altyapı
- [x] Django 5.0 + django-ninja 1.3 REST API backend
- [x] JWT auth (PyJWT + AuthBearer) — admin/editor/viewer rolleri
- [x] PostgreSQL (üretim) / SQLite (geliştirme) yapılandırması
- [x] Railway deploy (gunicorn + start.sh migrate→seed→collectstatic)
- [x] Agent-hub super-team (tech-lead, backend, frontend, otomasyon, qa, security vb.)

### Modüller
- [x] **Projeler** (`apps/projects`) — il bazlı harita, durum, bütçe
- [x] **Bütçe** (`apps/budget`) — gelir/gider takibi
- [x] **Dökümanlar** (`apps/documents`) — TeknikDokuman, TeknikSartname, E-Plan
- [x] **Beceriler** (`apps/skills`) — Rol + beceri ekosistemi, görev atama
- [x] **Raporlar** (`apps/reports`) — grafikler, yönetim özeti
- [x] **Ajanlar** (`apps/agents`) — PM + Risk deterministik motor
- [x] **Hesaplar** (`apps/accounts`) — kullanıcı, meslek rolü, bildirim
- [x] **Risk Kayıt Defteri** (`apps/risks`) — olasılık×etki matrisi, bubble chart
- [x] **Punch List** (`apps/punchlist`) — FAT/SAT, öncelik A/B/C, kapatma formu
- [x] **I/O Listesi** (`apps/iolist`) — DI/DO/AI/AO, PLC adres, kablo/sinyal takibi

### Frontend
- [x] SVG Türkiye haritası (il bazlı renklendirme)
- [x] Sol sidebar navigasyon
- [x] Chart.js grafikler (raporlar, risk ısı haritası)
- [x] Mühendislik hesaplamaları sayfası
- [x] Otomasyon projesi akış diyagramı
- [x] E-Plan Kontrol Noktaları diyagramı
- [x] Kısaltmalar sözlüğü

## Kalan İşler (ROADMAP)

### Kolay (1-3 gün)
- [ ] Milestone Takibi
- [ ] Saha Değişiklik Emri (FCO)
- [ ] iCal Export
- [ ] Proje Şablonları
- [ ] Kablo Listesi Modülü

### Orta (1 hafta)
- [ ] Ekipman/Tag Kartı
- [ ] Mühendis Saat Takibi
- [ ] Haftalık PDF Rapor
- [ ] S-Eğrisi Grafiği
- [ ] Fatura & Hakediş Takibi
- [ ] Export Merkezi
- [ ] IEC/ISO Standart Kütüphanesi

### Zor (2+ hafta)
- [ ] FAT/SAT Protokol Oluşturucu
- [ ] AI Şartname Özeti
- [ ] OEE Dashboard
- [ ] QR Kod Ekipman Tag'i
- [ ] CSV/Excel Import
- [ ] Kaynak Çakışma Uyarısı
- [ ] Earned Value (EVM)
- [ ] PWA (Offline)

## Bilinen Sorunlar

*Henüz kayıtlı açık sorun yok.*

## Proje Kararlarının Evrimi

| Karar | Gerekçe |
|---|---|
| React/Vue kullanılmadı | Bağımlılık minimizasyonu, bakım kolaylığı |
| Her JS modülü ayrı IIFE | Bağımsız yüklenebilirlik, debug kolaylığı |
| services.py katmanı | api.py'yi ince tutmak, test edilebilirlik |
| SQLite geliştirmede | Kurulum kolaylığı; prod'da PostgreSQL |
| Memory Bank sistemi | AI oturumlar arası süreklilik |

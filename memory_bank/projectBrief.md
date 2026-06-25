# ProjeHaritası — Project Brief

## Proje Nedir?

ProjeHaritası, Türkiye geneli endüstriyel otomasyon ve MES projelerini takip eden bir web uygulamasıdır. Küçük-orta ölçekli mühendislik ekipleri için tasarlanmıştır.

## Temel Hedefler

1. **Proje Takibi** — İl bazlı harita görünümü, proje durumu, bütçe, personel
2. **Mühendislik Araçları** — Risk kayıt, punch list (FAT/SAT), I/O listesi, E-Plan dokümantasyon
3. **Raporlama** — Yönetim raporları, grafikler, S-eğrisi, bütçe analizi
4. **Ekip Koordinasyonu** — Rol ve beceri ekosistemi, görev takibi, bildirimler
5. **Süreç Otomasyonu** — Deterministik ajan motoru (PM + Risk)

## Temel Kullanıcı Rolleri

- **admin** — Tam erişim, kullanıcı yönetimi
- **editor** — Proje ve görev düzenleme
- **viewer** — Salt okunur erişim

## Meslek Rolleri

`ELK` (Elektrik), `PLC` (PLC Mühendisi), `SCADA`, `SAHA` (Saha Teknisyeni), `PM` (Proje Müdürü)

## Hedef Kitle

Türkiye'deki endüstriyel otomasyon ve MES proje ekipleri (5–50 kişi).

## Temel Kısıtlamalar

- Saf Vanilla JS — framework kullanılamaz
- Django 5.0 + django-ninja 1.3 — backend değiştirilmez
- Railway üzerinde deploy — Docker veya başka platform değil
- PostgreSQL üretimde, SQLite geliştirmede

## Başarı Kriterleri

- Projelerin il bazlı haritada görüntülenmesi
- FAT/SAT punch list takibi
- I/O sinyal/kablo takibi
- Risk ısı haritası
- Mühendislik hesaplamaları (kablo, sigorta, motor vb.)

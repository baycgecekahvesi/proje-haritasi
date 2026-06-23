# ProjeHaritası

Bu proje **agent-hub super-team** kullanır. Tüm ajanlar aşağıdaki profili okuyarak davranışını ProjeHaritası'na özgün hale getirir.

@.claude/agent-hub/profile.yml

## Stack

Django 5.0 + django-ninja 1.3 REST API backend (Python 3.12). Saf vanilla JavaScript + HTML/CSS frontend — herhangi bir JS çerçevesi yoktur. Chart.js grafik. PostgreSQL üretimde, SQLite geliştirmede. Railway üzerinde dağıtım (gunicorn + start.sh).

## Dizin yapısı

```
apps/
  projects/     # Proje modeli (il, durum, bütçe vb.)
  documents/    # TeknikDokuman, TeknikSartname
  skills/       # Rol ve beceri ekosistemi
  tasks/        # Görev takip (GorevTipi + Gorev)
  reports/      # Raporlama servisleri ve grafik verileri
  agents/       # Deterministik ajan engine (PM + Risk)
  users/        # Kullanıcı, JWT auth
config/
  settings/     # base.py / local.py / production.py
  api.py        # Ana NinjaAPI tanımı, router kayıtları
frontend/
  static/js/    # Her modül ayrı IIFE dosyası (projects.js, reports.js vb.)
  static/css/   # app.css — tüm stiller tek dosyada
  templates/    # index.html — tek sayfa uygulama
```

## Komutlar

- Geliştirme: `python manage.py runserver --settings=config.settings.local`
- Migrate: `python manage.py migrate`
- Seed: `python manage.py seed_demo && python manage.py seed_skills && python manage.py seed_docs`
- Test: `pytest`
- Statik: `python manage.py collectstatic --noinput`

## Kurallar

- `api.py` içinde ORM sorgusu yazma — `services.py`'e taşı
- Schema tanımları `schemas.py` içinde, Ninja `Schema` sınıfları olarak
- Frontend'de yeni sekme: yeni IIFE dosyası + `app.js`'de `switchTab` kaydı
- CSS değişikliği: `app.css`'teki versiyon numarasını artır, `index.html`'deki `?v=` parametresini güncelle
- JS değişikliği: `index.html`'deki `?v=` parametresini artır
- Seed komutları idempotent olmalı (`get_or_create` veya `update_or_create`)

## Yapmamalı

- `SECRET_KEY`, DB şifresi veya `API_KEY` kaynak koduna yazma
- `db.sqlite3` veya `.env` dosyasını commit etme
- React/Vue/Angular veya herhangi bir JS çerçevesi ekleme
- Model değişikliği olmadan migration üretme

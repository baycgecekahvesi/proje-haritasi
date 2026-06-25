# Tech Context — ProjeHaritası

*Son güncelleme: 2026-06-25*

## Teknoloji Stack'i

### Backend
| Teknoloji | Versiyon | Kullanım |
|---|---|---|
| Python | 3.12 | Runtime |
| Django | 5.0 | Web framework |
| django-ninja | 1.3 | REST API (OpenAPI otomatik) |
| PyJWT | — | JWT token üretimi/doğrulama |
| python-decouple | — | `.env` değişkenleri |
| gunicorn | — | Üretim WSGI sunucusu |
| psycopg2 | — | PostgreSQL adaptörü |

### Frontend
| Teknoloji | Kullanım |
|---|---|
| Vanilla JavaScript (ES6+) | Tüm UI — framework yok |
| HTML5 / CSS3 | Markup ve stil |
| Chart.js | Grafikler (bar, line, bubble, doughnut) |
| SVG | Türkiye haritası |

### Veritabanı
- **Geliştirme**: SQLite (`db.sqlite3` — commit edilmez)
- **Üretim**: PostgreSQL (Railway managed)

### Deploy
- **Platform**: Railway
- **Süreç**: `start.sh` → migrate → seed → collectstatic → gunicorn
- **Statik dosyalar**: `python manage.py collectstatic`

## Geliştirme Kurulumu

```bash
# 1. Bağımlılıkları kur
pip install -r requirements.txt

# 2. .env dosyası oluştur (örnek: .env.example'a bak)
# SECRET_KEY, DATABASE_URL vb.

# 3. Migration çalıştır
python manage.py migrate --settings=config.settings.local

# 4. Seed verisi ekle
python manage.py seed_demo --settings=config.settings.local
python manage.py seed_skills --settings=config.settings.local
python manage.py seed_docs --settings=config.settings.local
python manage.py seed_risks --settings=config.settings.local
python manage.py seed_punchlist --settings=config.settings.local
python manage.py seed_iolist --settings=config.settings.local

# 5. Sunucuyu başlat
python manage.py runserver --settings=config.settings.local
```

## Settings Yapısı

```
config/settings/
  base.py       # Ortak ayarlar
  local.py      # Geliştirme (SQLite, DEBUG=True)
  production.py # Üretim (PostgreSQL, DEBUG=False)
```

## API Endpoint'leri

Tüm endpoint'ler `/api/` prefix'i altında:
- `/api/projects/` — Proje CRUD
- `/api/budget/` — Bütçe işlemleri
- `/api/documents/` — Dökümanlar
- `/api/skills/` — Rol ve beceriler
- `/api/reports/` — Raporlama ve grafik verisi
- `/api/agents/` — Ajan motoru
- `/api/accounts/` — Kullanıcı ve auth
- `/api/risks/` — Risk kayıt defteri
- `/api/punchlist/` — Punch list (FAT/SAT)
- `/api/iolist/` — I/O listesi

## Teknik Kısıtlamalar

- `SECRET_KEY` ve DB şifreleri asla kaynak kodunda olmaz — `.env` + `python-decouple`
- `db.sqlite3` ve `.env` `.gitignore`'da
- N+1 sorgulardan kaçın — `select_related()` / `prefetch_related()` / `annotate()` kullan
- Migration'lar el ile yazılmaz — `makemigrations` ile üretilir
- Model değişikliği olmadan `makemigrations` çalıştırılmaz

## Test

```bash
pytest                    # Tüm testler
pytest apps/risks/        # Tek modül testleri
pytest -v                 # Verbose çıktı
```

## Araçlar

- **Admin paneli**: `/admin/` (Django admin)
- **API dökümantasyonu**: `/api/docs` (Swagger UI, otomatik — ninja)
- **Git**: master branch — doğrudan commit

# 📍 ProjeHaritası

İl bazlı **proje, görev, bütçe ve döküman takip sistemi**. Django + django-ninja
backend, vanilla JS + SVG harita + Chart.js frontend.

Türkiye haritası üzerinde illeri durum/gecikme renk koduyla görüntüler; proje
CRUD, görev yönetimi, bütçe & harcama takibi, dosya yönetimi ve raporlama sunar.
JWT tabanlı kimlik doğrulama ve **Admin / Editör / İzleyici** rol sistemi içerir.

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Sanal ortam
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# 2. Bağımlılıklar
pip install -r requirements.txt

# 3. Ortam değişkenleri
copy .env.example .env         # Windows  (Linux/Mac: cp)
#   .env içini düzenleyin (SECRET_KEY vb.)

# 4. Veritabanı
python manage.py migrate

# 5. Örnek veri + kullanıcılar (opsiyonel ama önerilir)
python manage.py seed_demo

# 6. (seed_demo kullanmadıysanız) yönetici oluşturun
python manage.py createsuperuser

# 7. Sunucu
python manage.py runserver
```

Adresler:

| Adres | Açıklama |
| :---- | :---- |
| http://127.0.0.1:8000/ | Uygulama (SPA) |
| http://127.0.0.1:8000/api/docs | Swagger / OpenAPI arayüzü |
| http://127.0.0.1:8000/admin | Django yönetim paneli |

### `seed_demo` ile gelen kullanıcılar

| Kullanıcı | Parola | Rol |
| :---- | :---- | :---- |
| `admin` | `admin123` | Admin |
| `editor` | `editor123` | Editör |
| `viewer` | `viewer123` | İzleyici |

---

## 🗄️ Veritabanı

Varsayılan olarak **SQLite** kullanılır (kurulumsuz çalışır). PostgreSQL'e
geçmek için `.env` dosyasında:

```env
USE_SQLITE=False
DB_NAME=projeharitasi
DB_USER=postgres
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=5432
```

ardından `createdb projeharitasi` ve `python manage.py migrate`.

---

## 🧱 Mimari

```
config/                  # Django ayarları, NinjaAPI kaydı, URL'ler
  settings/{base,local,production}.py
  api.py                 # tüm router'ların birleştiği NinjaAPI
apps/
  accounts/              # User, UserProfile, JWT, roller, AuthBearer
  projects/              # Category, Project, ProjectImage, Task + harita
  budget/                # Budget, Expense
  documents/             # Document (dosya yükleme/silme)
  reports/               # hesaplama servisleri + rapor API'leri
frontend/
  templates/index.html   # tek sayfa shell
  static/css/app.css
  static/js/             # api, auth, map, projects, budget, documents, reports, app
tests/                   # pytest test paketi
```

### Rol Sistemi

- **Admin** — her şey + kullanıcı yönetimi + proje silme
- **Editör** — proje/görev/bütçe/döküman oluştur-düzenle
- **İzleyici** — yalnızca okuma

Yetkilendirme `apps/accounts/decorators.py` içindeki `@require_role(...)`
dekoratörü ile yazma uçlarında zorlanır.

---

## 🔌 API Uçları

`POST /api/auth/login` herkese açıktır; diğer tüm uçlar
`Authorization: Bearer <token>` başlığı bekler.

Tam liste için `/api/docs` (Swagger). Öne çıkanlar:

| Method | URL | Min. Rol |
| :---- | :---- | :---- |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | İzleyici |
| POST | `/api/auth/register` | Admin |
| GET | `/api/projects/` (sayfalı, filtreli) | İzleyici |
| GET | `/api/projects/map` | İzleyici |
| POST/PATCH | `/api/projects/` , `/api/projects/{id}` | Editör |
| DELETE | `/api/projects/{id}` | Admin |
| GET/POST | `/api/projects/{id}/tasks` | İzleyici / Editör |
| GET/PATCH | `/api/budget/{project_id}` | İzleyici / Editör |
| POST | `/api/budget/{project_id}/expenses` | Editör |
| GET/POST | `/api/documents/{project_id}` | İzleyici / Editör |
| DELETE | `/api/documents/file/{document_id}` | Editör |
| GET | `/api/reports/{summary,by-province,budget-overview,timeline}` | İzleyici |

> **Not:** Döküman silme yolu, liste yolu (`/{project_id}`) ile URL çakışmasını
> önlemek için `/documents/file/{document_id}` biçimindedir.

---

## 🗺️ Harita Hakkında

Harita, 81 ili kapsayan tıklanabilir bir SVG ızgarası olarak `map.js` içinde
dinamik üretilir. Her il `<g data-iladi="...">` öğesidir ve `/api/projects/map`
verisiyle renklendirilir:

- 🔵 Aktif · 🟠 Beklemede · 🟢 Tamamlandı · 🔴 Gecikmeli · ⬜ Projesiz

İl adları backend `apps/projects/provinces.py` ile frontend
`static/js/provinces.js` arasında **birebir** eşleşir (İstanbul Avrupa/Asya
ayrımı dahil). Coğrafi bir `turkiye.svg` kullanmak isterseniz; içindeki
`data-iladi` değerleri bu listeyle aynı olduğu sürece ızgaranın yerine
bırakılabilir.

---

## 🧪 Testler

```bash
pytest -q
```

`tests/` altında kimlik doğrulama, proje CRUD, rol yetkilendirme, bütçe
hesaplama, döküman yükleme ve raporlama testleri bulunur (28 test).

---

## ⚙️ Teknolojiler

Django 5.0 · django-ninja 1.3 · PyJWT · Pillow · python-decouple ·
django-cors-headers · Chart.js (CDN) · pytest-django

---

## 🚢 Üretim Notları (ileride)

`config/settings/production.py` hazır iskelet içerir (DEBUG=False, HSTS, güvenli
çerezler, PostgreSQL zorunlu). Ek olarak: gunicorn + nginx, medya için statik
servis/S3, ortam değişkenlerinin sistem düzeyinde tanımlanması önerilir.

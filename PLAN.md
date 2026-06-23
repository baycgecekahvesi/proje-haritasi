# 🗺️ ProjeHaritası — Yazılım Geliştirme Proje Planı

**Proje Türü**: Web Yazılımı Geliştirme (Django \+ django-ninja)  
**Başlangıç**: 23.06.2025  
**Hedef Bitiş**: 04.08.2025  
**Toplam Süre**: 6 Faz · \~6 Hafta  
**Ekip**: 1 Kıdemli Geliştirici  
**Hedef Ortam**: Localhost → üretime taşınabilir yapı

---

## 📐 Kapsam (Scope)

### Kapsam Dahili (In-Scope)

- Çok kullanıcılı yapı: Admin / Editör / İzleyici rol sistemi  
- JWT tabanlı kimlik doğrulama (django-ninja)  
- Proje & görev (Task) yönetimi  
- Planlanan / gerçekleşen tarih takibi \+ gecikme hesabı  
- Bütçe & maliyet takibi (harcama kategorileri, hakediş)  
- Döküman & dosya yönetimi (PDF, resim, çizim)  
- Türkiye SVG haritası üzerinde il bazlı proje görüntüleme  
- İlerleme çubuğu (progress bar) ve durum renk kodlaması  
- Raporlama: il bazlı, bütçe özeti, zaman çizelgesi  
- Django Admin paneli özelleştirme

### Kapsam Dışı (Out-of-Scope)

- Mobil uygulama (iOS / Android)  
- E-posta bildirimleri (ileride Faz 7 olarak eklenebilir)  
- Gerçek zamanlı güncelleme (WebSocket)  
- Üretim sunucusu kurulumu (bu planda yalnızca localhost)  
- Muhasebe / ERP entegrasyonu

### Varsayımlar ve Kısıtlar

- PostgreSQL yerel olarak kurulu ve çalışıyor olacak  
- Python 3.11+ mevcut  
- Tek geliştirici; paralel iş paketi sayısı buna göre ayarlandı  
- Günlük \~4 saat efektif geliştirme süresi varsayıldı

---

## 📋 Geliştirme Fazları & Görev Tabloları

---

### FAZ 1 — Proje İskeleti & Kimlik Doğrulama (Hafta 1 · 23.06–29.06.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| Django projesi oluştur (`config/` yapısı) | Geliştirici | 2 sa | — | ✅ |
| `apps/` dizin yapısını kur (accounts, projects, budget, documents, reports) | Geliştirici | 1 sa | Üstteki | ✅ |
| `settings/base.py`, `local.py` ayarları \+ `.env` | Geliştirici | 1 sa | Üstteki | ✅ |
| PostgreSQL bağlantısı & `projeharitasi` DB oluştur | Geliştirici | 30 dk | settings | ✅ |
| `accounts.User` custom model (AbstractUser) | Geliştirici | 1 sa | DB | ✅ |
| `UserProfile` modeli (rol: admin/editor/viewer) | Geliştirici | 1 sa | User modeli | ✅ |
| `makemigrations accounts` \+ `migrate` | Geliştirici | 15 dk | Modeller | ✅ |
| `createsuperuser` \+ admin paneli doğrula | Geliştirici | 15 dk | migrate | ✅ |
| django-ninja kurulumu \+ `NinjaAPI` tanımı | Geliştirici | 1 sa | — | ✅ |
| JWT login endpoint (`POST /api/auth/login`) | Geliştirici | 2 sa | Ninja \+ User | ✅ |
| `GET /api/auth/me` — mevcut kullanıcı | Geliştirici | 1 sa | login | ✅ |
| `AuthBearer` \+ `require_role` dekoratörü | Geliştirici | 1 sa | JWT | ✅ |
| Frontend: `index.html` shell \+ `api.js` fetch wrapper | Geliştirici | 2 sa | — | ✅ |
| Frontend: login sayfası \+ token localStorage | Geliştirici | 2 sa | api.js | ✅ |

**📍 Milestone 1**: `POST /api/auth/login` çalışıyor, token alınıyor, admin paneli erişilebilir — **29.06.2025**

---

### FAZ 2 — Proje & Görev Yönetimi (Hafta 2 · 30.06–06.07.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| `Category` modeli | Geliştirici | 30 dk | — | ✅ |
| `Project` modeli (province, status, progress, tarihler, owner, members) | Geliştirici | 2 sa | Category | ✅ |
| `ProjectImage` modeli (upload\_to) | Geliştirici | 30 dk | Project | ✅ |
| `Task` modeli (priority, assignee, due\_date) | Geliştirici | 1 sa | Project | ✅ |
| `is_delayed` \+ `delay_days` property'leri | Geliştirici | 30 dk | Project | ✅ |
| `makemigrations projects` \+ `migrate` | Geliştirici | 15 dk | Modeller | ✅ |
| `projects/schemas.py` — `ProjectIn`, `ProjectOut`, `ProjectMapOut` | Geliştirici | 2 sa | migrate | ✅ |
| `GET /api/projects/` — liste (filtre: province, status) | Geliştirici | 1 sa | schemas | ✅ |
| `GET /api/projects/map` — harita için hafif endpoint | Geliştirici | 1 sa | schemas | ✅ |
| `POST /api/projects/` — proje oluştur (Editor+) | Geliştirici | 1 sa | schemas | ✅ |
| `GET/PATCH/DELETE /api/projects/{id}` | Geliştirici | 2 sa | POST | ✅ |
| `POST /api/projects/{id}/images` — resim yükleme | Geliştirici | 1 sa | Project | ✅ |
| Task CRUD endpoint'leri (`/api/projects/{id}/tasks`) | Geliştirici | 2 sa | Task modeli | ✅ |
| Frontend: SVG harita `map.js` → `/api/projects/map` bağlantısı | Geliştirici | 3 sa | map endpoint | ✅ |
| Frontend: il seçimi → proje listesi panel | Geliştirici | 2 sa | map.js | ✅ |

**📍 Milestone 2**: Haritada iller renklendirilmiş, proje CRUD API çalışıyor — **06.07.2025**

---

### FAZ 3 — Bütçe & Maliyet Takibi (Hafta 3 · 07.07–13.07.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| `Budget` modeli (planned\_amount, currency) | Geliştirici | 1 sa | Project | ✅ |
| `Expense` modeli (type: labor/material/equipment/service/other) | Geliştirici | 1 sa | Budget | ✅ |
| `total_spent`, `remaining`, `usage_percent` property'leri | Geliştirici | 30 dk | Expense | ✅ |
| `makemigrations budget` \+ `migrate` | Geliştirici | 15 dk | Modeller | ✅ |
| `budget/schemas.py` | Geliştirici | 1 sa | migrate | ✅ |
| `GET /api/budget/{project_id}` | Geliştirici | 1 sa | schemas | ✅ |
| `PATCH /api/budget/{project_id}` — bütçe güncelle | Geliştirici | 1 sa | GET | ✅ |
| `POST /api/budget/{project_id}/expenses` — harcama ekle | Geliştirici | 1 sa | Budget | ✅ |
| `DELETE /api/budget/{project_id}/expenses/{id}` | Geliştirici | 30 dk | POST | ✅ |
| Frontend: `budget.js` — bütçe paneli, kullanım çubuğu | Geliştirici | 3 sa | API | ✅ |
| Frontend: harcama ekleme formu (tarih, tür, tutar, fatura no) | Geliştirici | 2 sa | budget.js | ✅ |
| Frontend: bütçe aşımı uyarısı (kırmızı renk \+ ⚠️) | Geliştirici | 1 sa | budget.js | ✅ |
| Admin paneli: Budget \+ Expense inline görünüm | Geliştirici | 1 sa | Modeller | ✅ |

**📍 Milestone 3**: Bütçe girişi ve kullanım takibi çalışıyor, aşım uyarısı görünüyor — **13.07.2025**

---

### FAZ 4 — Döküman & Dosya Yönetimi (Hafta 4 · 14.07–20.07.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| `Document` modeli (title, doc\_type, file, uploaded\_by) | Geliştirici | 1 sa | Project | ✅ |
| `file_extension`, `file_size_kb` property'leri | Geliştirici | 30 dk | Document | ✅ |
| `makemigrations documents` \+ `migrate` | Geliştirici | 15 dk | Modeller | ✅ |
| `MEDIA_URL` ve `MEDIA_ROOT` ayarları \+ `urls.py` static servis | Geliştirici | 30 dk | settings | ✅ |
| `documents/schemas.py` | Geliştirici | 1 sa | migrate | ✅ |
| `GET /api/documents/{project_id}` — dosya listesi | Geliştirici | 1 sa | schemas | ✅ |
| `POST /api/documents/{project_id}` — dosya yükle (multipart) | Geliştirici | 2 sa | GET | ✅ |
| `DELETE /api/documents/{id}` — dosya sil \+ disk temizle | Geliştirici | 1 sa | POST | ✅ |
| Dosya boyutu limiti (50 MB) \+ izin verilen uzantılar kontrolü | Geliştirici | 1 sa | POST | ✅ |
| Frontend: `documents.js` — dosya listesi, tür ikonu, boyut | Geliştirici | 3 sa | API | ✅ |
| Frontend: drag & drop yükleme arayüzü | Geliştirici | 2 sa | documents.js | ✅ |
| Frontend: resim galerisi (ProjectImage) | Geliştirici | 2 sa | documents.js | ✅ |

**📍 Milestone 4**: Dosya yükleme/listeleme/silme çalışıyor, galeri görünümü hazır — **20.07.2025**

---

### FAZ 5 — Raporlama & Grafikler (Hafta 5 · 21.07–27.07.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| `reports/services.py` — hesaplama mantığı | Geliştirici | 2 sa | projects \+ budget | ✅ |
| `GET /api/reports/summary` — toplam proje, aktif, tamamlanan, geciken | Geliştirici | 1 sa | services | ✅ |
| `GET /api/reports/by-province` — il bazlı proje dağılımı | Geliştirici | 1 sa | services | ✅ |
| `GET /api/reports/budget-overview` — toplam bütçe, kullanım, aşım listesi | Geliştirici | 2 sa | services | ✅ |
| `GET /api/reports/timeline` — geciken projeler, planlanan vs gerçek bitiş | Geliştirici | 2 sa | services | ✅ |
| Frontend: Chart.js kurulumu | Geliştirici | 30 dk | — | ✅ |
| Frontend: `reports.js` — özet istatistik kartları (header bar) | Geliştirici | 2 sa | summary API | ✅ |
| Frontend: il bazlı proje sayısı bar grafiği | Geliştirici | 2 sa | by-province | ✅ |
| Frontend: bütçe kullanım pasta grafiği | Geliştirici | 2 sa | budget-overview | ✅ |
| Frontend: geciken projeler listesi (kırmızı vurgu) | Geliştirici | 1 sa | timeline | ✅ |

**📍 Milestone 5**: Raporlama sayfası açılıyor, 4 grafik veriden besleniyor — **27.07.2025**

---

### FAZ 6 — Rol & Yetki · Optimizasyon · Testler (Hafta 6 · 28.07–04.08.2025)

| Görev (Task) | Sorumlu | Süre | Bağımlılık | Durum |
| :---- | :---- | :---- | :---- | :---- |
| `require_role` dekoratörünü tüm yazma endpoint'lerine uygula | Geliştirici | 2 sa | Tüm API | ✅ |
| `GET /api/auth/users` — kullanıcı listesi (Admin only) | Geliştirici | 1 sa | auth | ✅ |
| `POST /api/auth/register` — yeni kullanıcı oluştur (Admin only) | Geliştirici | 1 sa | auth | ✅ |
| Django Admin özelleştirme (inline'lar, list\_display, search) | Geliştirici | 2 sa | Tüm modeller | ✅ |
| `select_related` / `prefetch_related` sorgu optimizasyonu | Geliştirici | 2 sa | Tüm API | ✅ |
| API sayfalama (`ninja.pagination` — sayfa başı 20 kayıt) | Geliştirici | 1 sa | list endpoint'leri | ✅ |
| `pytest-django` kurulumu \+ `conftest.py` (fixtures: admin\_user, editor\_user) | Geliştirici | 1 sa | — | ✅ |
| Temel API testleri (login, proje CRUD, bütçe, dosya yükleme) | Geliştirici | 3 sa | pytest | ✅ |
| Hata mesajlarını Türkçeleştir (`HttpError` detayları) | Geliştirici | 1 sa | Tüm API | ✅ |
| `.env.example` hazırla, `README.md` yaz | Geliştirici | 1 sa | — | ✅ |
| Son kullanıcı testi & hata giderme (UAT) | Geliştirici | 3 sa | Her şey | ✅ |

**📍 Milestone 6 — TESLİMAT**: Tüm özellikler çalışıyor, testler geçiyor, README eksiksiz — **04.08.2025**

---

## 🗓️ Özet Gantt

HAFTA          →  H1        H2        H3        H4        H5        H6

               23.06     30.06     07.07     14.07     21.07     28.07

               ──────    ──────    ──────    ──────    ──────    ──────

İskelet & Auth ██████

Proje & Görev            ██████

Bütçe                              ██████

Dökümanlar                                   ██████

Raporlama                                              ██████

Rol & Test                                                        ██████

Milestone      📍M1      📍M2      📍M3      📍M4      📍M5      📍M6

---

## 🔴 Kritik Yol (Critical Path)

Aşağıdaki adım zincirinde herhangi bir gecikme, son teslim tarihini kaydırır:

1\. accounts.User modeli \+ JWT

      ↓

2\. projects.Project modeli \+ CRUD API

      ↓

3\. SVG harita ↔ /api/projects/map bağlantısı   ← en riskli nokta

      ↓

4\. budget.Budget \+ expense endpoint'leri

      ↓

5\. reports/services.py hesaplama mantığı

      ↓

6\. pytest testleri \+ UAT

**En riskli nokta**: Faz 2'deki harita–API entegrasyonu. SVG `data-iladi` attribute'larının `ProvinceCode` değerleriyle tam eşleşmesi gerekiyor. Bir harf farkı (ör. `İstanbul` vs `Istanbul`) tüm renk kodlamasını bozar. Bu adıma ekstra buffer süre ayrıldı.

---

## ⚠️ Risk Matrisi

| Risk | Olasılık | Etki | Önlem |
| :---- | :---- | :---- | :---- |
| SVG il isimleri ile `ProvinceCode` uyumsuzluğu | Yüksek | Yüksek | Faz 2 başında 81 ilin tamamı karşılaştırma testi yapılacak |
| django-ninja versiyon uyumsuzluğu (Django 5.x) | Orta | Yüksek | `requirements.txt`'te sabit sürüm: `django-ninja==1.3.0` |
| Büyük dosya yüklemelerinde timeout | Orta | Orta | `DATA_UPLOAD_MAX_MEMORY_SIZE=52MB`, gerekirse chunked upload |
| JWT token süresi dolunca frontend donması | Düşük | Orta | `api.js`'te 401 → otomatik logout \+ yönlendirme |
| `media/` klasörünün yanlışlıkla git'e girmesi | Düşük | Düşük | `.gitignore`'a `media/` eklendi, `.env.example`'da belgelendi |
| Rapor endpoint'lerinde N+1 sorgu problemi | Orta | Orta | `reports/services.py`'de tek sorguda aggregate kullanımı |
| Tek geliştirici — hastalık / aksama | Düşük | Yüksek | Her faz sonunda kod commit'lendi; README'de devam talimatı |

---

## 🏗️ Teknik Mimari Özeti

### Stack

| Katman | Teknoloji | Versiyon |
| :---- | :---- | :---- |
| Backend framework | Django | 5.0.7 |
| API katmanı | django-ninja | 1.3.0 |
| Veritabanı | PostgreSQL | 15+ |
| Kimlik doğrulama | PyJWT | 2.8.0 |
| Dosya işleme | Pillow | 10.4.0 |
| Frontend | Vanilla JS \+ SVG | — |
| Grafik | Chart.js | CDN |
| Test | pytest-django | 4.8.0 |

### Dizin Yapısı

projeharitasi/

├── manage.py

├── requirements.txt

├── .env                          ← gitignore'da

├── .env.example                  ← repoda

├── .gitignore

├── README.md

│

├── config/

│   ├── settings/

│   │   ├── base.py               ← ortak ayarlar

│   │   ├── local.py              ← DEBUG=True, SQLite opsiyonel

│   │   └── production.py         ← ileride

│   ├── urls.py

│   └── wsgi.py

│

├── apps/

│   ├── accounts/                 ← User, UserProfile, JWT

│   ├── projects/                 ← Project, Task, Category, ProjectImage

│   ├── budget/                   ← Budget, Expense

│   ├── documents/                ← Document

│   └── reports/                  ← hesaplama servisleri, API

│

├── frontend/

│   ├── templates/index.html      ← tek sayfa shell

│   └── static/

│       ├── css/app.css

│       ├── js/

│       │   ├── api.js            ← fetch wrapper \+ JWT

│       │   ├── auth.js

│       │   ├── map.js            ← SVG harita ↔ API

│       │   ├── projects.js

│       │   ├── budget.js

│       │   ├── documents.js

│       │   └── reports.js

│       └── img/turkiye.svg

│

└── media/                        ← gitignore'da

    ├── project\_images/

    ├── documents/

    └── avatars/

---

## 🗄️ Veritabanı Modelleri

### accounts/models.py

from django.contrib.auth.models import AbstractUser

from django.db import models

class User(AbstractUser):

    """Özel kullanıcı modeli — ileride alan eklemeye hazır."""

    pass

class Role(models.TextChoices):

    ADMIN  \= "admin",  "Admin"

    EDITOR \= "editor", "Editör"

    VIEWER \= "viewer", "İzleyici"

class UserProfile(models.Model):

    user       \= models.OneToOneField(User, on\_delete=models.CASCADE, related\_name="profile")

    role       \= models.CharField(max\_length=20, choices=Role.choices, default=Role.VIEWER)

    avatar     \= models.ImageField(upload\_to="avatars/", null=True, blank=True)

    phone      \= models.CharField(max\_length=20, blank=True)

    created\_at \= models.DateTimeField(auto\_now\_add=True)

    def \_\_str\_\_(self):

        return f"{self.user.username} ({self.role})"

### projects/models.py

from django.db import models

from apps.accounts.models import User

\# 81 ilin tamamı — harita SVG g\[data-iladi\] ile birebir eşleşmeli

PROVINCE\_CHOICES \= \[

    ("Adana", "Adana"), ("Adıyaman", "Adıyaman"), ("Afyonkarahisar", "Afyonkarahisar"),

    ("Ağrı", "Ağrı"), ("Aksaray", "Aksaray"), ("Amasya", "Amasya"),

    ("Ankara", "Ankara"), ("Antalya", "Antalya"), ("Ardahan", "Ardahan"),

    ("Artvin", "Artvin"), ("Aydın", "Aydın"), ("Balıkesir", "Balıkesir"),

    ("Bartın", "Bartın"), ("Batman", "Batman"), ("Bayburt", "Bayburt"),

    ("Bilecik", "Bilecik"), ("Bingöl", "Bingöl"), ("Bitlis", "Bitlis"),

    ("Bolu", "Bolu"), ("Burdur", "Burdur"), ("Bursa", "Bursa"),

    ("Çanakkale", "Çanakkale"), ("Çankırı", "Çankırı"), ("Çorum", "Çorum"),

    ("Denizli", "Denizli"), ("Diyarbakır", "Diyarbakır"), ("Düzce", "Düzce"),

    ("Edirne", "Edirne"), ("Elazığ", "Elazığ"), ("Erzincan", "Erzincan"),

    ("Erzurum", "Erzurum"), ("Eskişehir", "Eskişehir"), ("Gaziantep", "Gaziantep"),

    ("Giresun", "Giresun"), ("Gümüşhane", "Gümüşhane"), ("Hakkâri", "Hakkâri"),

    ("Hatay", "Hatay"), ("Iğdır", "Iğdır"), ("Isparta", "Isparta"),

    ("İstanbul (Avrupa)", "İstanbul (Avrupa)"), ("İstanbul (Asya)", "İstanbul (Asya)"),

    ("İzmir", "İzmir"), ("Kahramanmaraş", "Kahramanmaraş"), ("Karabük", "Karabük"),

    ("Karaman", "Karaman"), ("Kars", "Kars"), ("Kastamonu", "Kastamonu"),

    ("Kayseri", "Kayseri"), ("Kilis", "Kilis"), ("Kırıkkale", "Kırıkkale"),

    ("Kırklareli", "Kırklareli"), ("Kırşehir", "Kırşehir"), ("Kocaeli", "Kocaeli"),

    ("Konya", "Konya"), ("Kütahya", "Kütahya"), ("Malatya", "Malatya"),

    ("Manisa", "Manisa"), ("Mardin", "Mardin"), ("Mersin", "Mersin"),

    ("Muğla", "Muğla"), ("Muş", "Muş"), ("Nevşehir", "Nevşehir"),

    ("Niğde", "Niğde"), ("Ordu", "Ordu"), ("Osmaniye", "Osmaniye"),

    ("Rize", "Rize"), ("Sakarya", "Sakarya"), ("Samsun", "Samsun"),

    ("Siirt", "Siirt"), ("Sinop", "Sinop"), ("Sivas", "Sivas"),

    ("Şanlıurfa", "Şanlıurfa"), ("Şırnak", "Şırnak"), ("Tekirdağ", "Tekirdağ"),

    ("Tokat", "Tokat"), ("Trabzon", "Trabzon"), ("Tunceli", "Tunceli"),

    ("Uşak", "Uşak"), ("Van", "Van"), ("Yalova", "Yalova"),

    ("Yozgat", "Yozgat"), ("Zonguldak", "Zonguldak"),

\]

class ProjectStatus(models.TextChoices):

    ACTIVE    \= "aktif",      "Aktif"

    PENDING   \= "beklemede",  "Beklemede"

    COMPLETED \= "tamamlandi", "Tamamlandı"

    CANCELLED \= "iptal",      "İptal"

class Category(models.Model):

    name  \= models.CharField(max\_length=100)

    color \= models.CharField(max\_length=7, default="\#4f6ef7")

    def \_\_str\_\_(self):

        return self.name

class Project(models.Model):

    name          \= models.CharField(max\_length=255)

    description   \= models.TextField(blank=True)

    province      \= models.CharField(max\_length=60, choices=PROVINCE\_CHOICES)

    category      \= models.ForeignKey(Category, null=True, blank=True, on\_delete=models.SET\_NULL)

    status        \= models.CharField(max\_length=20, choices=ProjectStatus.choices, default=ProjectStatus.ACTIVE)

    progress      \= models.PositiveSmallIntegerField(default=0)  \# 0–100

    owner         \= models.ForeignKey(User, on\_delete=models.CASCADE, related\_name="owned\_projects")

    members       \= models.ManyToManyField(User, related\_name="member\_projects", blank=True)

    planned\_start \= models.DateField(null=True, blank=True)

    planned\_end   \= models.DateField(null=True, blank=True)

    actual\_start  \= models.DateField(null=True, blank=True)

    actual\_end    \= models.DateField(null=True, blank=True)

    created\_at    \= models.DateTimeField(auto\_now\_add=True)

    updated\_at    \= models.DateTimeField(auto\_now=True)

    class Meta:

        ordering \= \["-created\_at"\]

    def \_\_str\_\_(self):

        return f"{self.name} ({self.province})"

    @property

    def is\_delayed(self):

        from datetime import date

        if self.planned\_end and self.status \!= ProjectStatus.COMPLETED:

            return date.today() \> self.planned\_end

        return False

    @property

    def delay\_days(self):

        if self.planned\_end and self.actual\_end and self.actual\_end \> self.planned\_end:

            return (self.actual\_end \- self.planned\_end).days

        return 0

class ProjectImage(models.Model):

    project     \= models.ForeignKey(Project, on\_delete=models.CASCADE, related\_name="images")

    image       \= models.ImageField(upload\_to="project\_images/%Y/%m/")

    caption     \= models.CharField(max\_length=255, blank=True)

    uploaded\_at \= models.DateTimeField(auto\_now\_add=True)

class Task(models.Model):

    class Priority(models.TextChoices):

        LOW    \= "low",    "Düşük"

        MEDIUM \= "medium", "Orta"

        HIGH   \= "high",   "Yüksek"

    project     \= models.ForeignKey(Project, on\_delete=models.CASCADE, related\_name="tasks")

    title       \= models.CharField(max\_length=255)

    description \= models.TextField(blank=True)

    assignee    \= models.ForeignKey(User, null=True, blank=True, on\_delete=models.SET\_NULL)

    priority    \= models.CharField(max\_length=10, choices=Priority.choices, default=Priority.MEDIUM)

    is\_done     \= models.BooleanField(default=False)

    due\_date    \= models.DateField(null=True, blank=True)

    created\_at  \= models.DateTimeField(auto\_now\_add=True)

    def \_\_str\_\_(self):

        return self.title

### budget/models.py

from django.db import models

from apps.projects.models import Project

class Currency(models.TextChoices):

    TRY \= "TRY", "Türk Lirası (₺)"

    USD \= "USD", "Dolar ($)"

    EUR \= "EUR", "Euro (€)"

class Budget(models.Model):

    project        \= models.OneToOneField(Project, on\_delete=models.CASCADE, related\_name="budget")

    planned\_amount \= models.DecimalField(max\_digits=15, decimal\_places=2, default=0)

    currency       \= models.CharField(max\_length=3, choices=Currency.choices, default=Currency.TRY)

    notes          \= models.TextField(blank=True)

    created\_at     \= models.DateTimeField(auto\_now\_add=True)

    updated\_at     \= models.DateTimeField(auto\_now=True)

    @property

    def total\_spent(self):

        return self.expenses.aggregate(total=models.Sum("amount"))\["total"\] or 0

    @property

    def remaining(self):

        return self.planned\_amount \- self.total\_spent

    @property

    def usage\_percent(self):

        if self.planned\_amount \== 0:

            return 0

        return round(float(self.total\_spent) / float(self.planned\_amount) \* 100, 1\)

class Expense(models.Model):

    class ExpenseType(models.TextChoices):

        LABOR     \= "labor",     "İşçilik"

        MATERIAL  \= "material",  "Malzeme"

        EQUIPMENT \= "equipment", "Ekipman"

        SERVICE   \= "service",   "Hizmet"

        OTHER     \= "other",     "Diğer"

    budget       \= models.ForeignKey(Budget, on\_delete=models.CASCADE, related\_name="expenses")

    description  \= models.CharField(max\_length=255)

    amount       \= models.DecimalField(max\_digits=12, decimal\_places=2)

    expense\_type \= models.CharField(max\_length=20, choices=ExpenseType.choices, default=ExpenseType.OTHER)

    date         \= models.DateField()

    invoice\_no   \= models.CharField(max\_length=100, blank=True)

    created\_at   \= models.DateTimeField(auto\_now\_add=True)

    def \_\_str\_\_(self):

        return f"{self.description} — {self.amount}"

### documents/models.py

import os

from django.db import models

from apps.projects.models import Project

from apps.accounts.models import User

class Document(models.Model):

    class DocType(models.TextChoices):

        CONTRACT \= "contract", "Sözleşme"

        REPORT   \= "report",   "Rapor"

        DRAWING  \= "drawing",  "Çizim/Plan"

        PHOTO    \= "photo",    "Fotoğraf"

        OTHER    \= "other",    "Diğer"

    project     \= models.ForeignKey(Project, on\_delete=models.CASCADE, related\_name="documents")

    title       \= models.CharField(max\_length=255)

    doc\_type    \= models.CharField(max\_length=20, choices=DocType.choices, default=DocType.OTHER)

    file        \= models.FileField(upload\_to="documents/%Y/%m/")

    uploaded\_by \= models.ForeignKey(User, on\_delete=models.SET\_NULL, null=True)

    uploaded\_at \= models.DateTimeField(auto\_now\_add=True)

    @property

    def file\_extension(self):

        \_, ext \= os.path.splitext(self.file.name)

        return ext.lower()

    @property

    def file\_size\_kb(self):

        try:

            return round(self.file.size / 1024, 1\)

        except Exception:

            return 0

    def \_\_str\_\_(self):

        return self.title

---

## 🔌 API Endpoint Tablosu

| Method | URL | Açıklama | Min. Rol |
| :---- | :---- | :---- | :---- |
| POST | `/api/auth/login` | JWT token al | Herkese açık |
| POST | `/api/auth/register` | Kullanıcı oluştur | Admin |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi | Viewer |
| GET | `/api/auth/users` | Kullanıcı listesi | Admin |
| GET | `/api/projects/` | Proje listesi (filtreli) | Viewer |
| GET | `/api/projects/map` | Harita özet verisi | Viewer |
| POST | `/api/projects/` | Proje oluştur | Editor |
| GET | `/api/projects/{id}` | Proje detayı | Viewer |
| PATCH | `/api/projects/{id}` | Proje güncelle | Editor |
| DELETE | `/api/projects/{id}` | Proje sil | Admin |
| POST | `/api/projects/{id}/images` | Resim yükle | Editor |
| GET | `/api/projects/{id}/tasks` | Görev listesi | Viewer |
| POST | `/api/projects/{id}/tasks` | Görev ekle | Editor |
| PATCH | `/api/projects/{id}/tasks/{tid}` | Görev güncelle | Editor |
| DELETE | `/api/projects/{id}/tasks/{tid}` | Görev sil | Editor |
| GET | `/api/budget/{project_id}` | Bütçe detayı | Viewer |
| PATCH | `/api/budget/{project_id}` | Bütçe güncelle | Editor |
| POST | `/api/budget/{project_id}/expenses` | Harcama ekle | Editor |
| DELETE | `/api/budget/{project_id}/expenses/{id}` | Harcama sil | Editor |
| GET | `/api/documents/{project_id}` | Döküman listesi | Viewer |
| POST | `/api/documents/{project_id}` | Dosya yükle | Editor |
| DELETE | `/api/documents/{id}` | Dosya sil | Editor |
| GET | `/api/reports/summary` | Genel özet istatistik | Viewer |
| GET | `/api/reports/by-province` | İl bazlı dağılım | Viewer |
| GET | `/api/reports/budget-overview` | Bütçe raporu | Viewer |
| GET | `/api/reports/timeline` | Geciken projeler zaman çizelgesi | Viewer |

---

## 🔐 Kimlik Doğrulama

### accounts/services.py

import jwt

from datetime import datetime, timedelta

from django.conf import settings

from .models import User

def create\_token(user: User) \-\> str:

    payload \= {

        "user\_id": user.id,

        "role":    user.profile.role,

        "exp":     datetime.utcnow() \+ timedelta(hours=24),

    }

    return jwt.encode(payload, settings.SECRET\_KEY, algorithm="HS256")

def decode\_token(token: str) \-\> dict | None:

    try:

        return jwt.decode(token, settings.SECRET\_KEY, algorithms=\["HS256"\])

    except jwt.ExpiredSignatureError:

        return None

    except jwt.InvalidTokenError:

        return None

### accounts/decorators.py

from functools import wraps

from ninja.errors import HttpError

def require\_role(\*roles):

    """

    Kullanım:

        @router.post("/")

        @require\_role("admin", "editor")

        def create(request, payload: ProjectIn): ...

    """

    def decorator(func):

        @wraps(func)

        def wrapper(request, \*args, \*\*kwargs):

            if request.auth.get("role") not in roles:

                raise HttpError(403, "Bu işlem için yetkiniz yok")

            return func(request, \*args, \*\*kwargs)

        return wrapper

    return decorator

---

## ⚙️ Kurulum Adımları

\# 1\. Sanal ortam

python \-m venv venv

source venv/bin/activate        \# Windows: venv\\Scripts\\activate

\# 2\. Bağımlılıklar

pip install \-r requirements.txt

\# 3\. Ortam değişkenleri

cp .env.example .env

\# .env içini düzenle (SECRET\_KEY, DB şifresi)

\# 4\. Veritabanı

createdb projeharitasi

python manage.py makemigrations accounts projects budget documents

python manage.py migrate

\# 5\. İlk kullanıcı

python manage.py createsuperuser

\# 6\. Geliştirme sunucusu

python manage.py runserver

\# → http://127.0.0.1:8000

\# → http://127.0.0.1:8000/api/docs  (Ninja Swagger UI)

\# → http://127.0.0.1:8000/admin

### .env.example

SECRET\_KEY=buraya-en-az-50-karakterlik-rastgele-bir-anahtar-girin

DEBUG=True

DB\_NAME=projeharitasi

DB\_USER=postgres

DB\_PASSWORD=

DB\_HOST=localhost

DB\_PORT=5432

ALLOWED\_HOSTS=localhost,127.0.0.1

### requirements.txt

django==5.0.7

django-ninja==1.3.0

psycopg2-binary==2.9.9

Pillow==10.4.0

PyJWT==2.8.0

python-decouple==3.8

django-cors-headers==4.4.0

pytest==8.2.0

pytest-django==4.8.0

pytest-factoryboy==2.7.0

---

## 🧪 Test Yapısı

\# pytest.ini

\[pytest\]

DJANGO\_SETTINGS\_MODULE \= config.settings.local

\# tests/conftest.py

import pytest

from django.contrib.auth import get\_user\_model

from apps.accounts.models import UserProfile, Role

from apps.accounts.services import create\_token

User \= get\_user\_model()

@pytest.fixture

def admin\_user(db):

    u \= User.objects.create\_user(username="admin", password="test123")

    UserProfile.objects.create(user=u, role=Role.ADMIN)

    return u

@pytest.fixture

def auth\_headers(admin\_user):

    token \= create\_token(admin\_user)

    return {"HTTP\_AUTHORIZATION": f"Bearer {token}"}

\# tests/test\_projects.py

@pytest.mark.django\_db

def test\_create\_project(client, admin\_user, auth\_headers):

    res \= client.post(

        "/api/projects/",

        data={"name": "Test Proje", "province": "Ankara", "status": "aktif"},

        content\_type="application/json",

        \*\*auth\_headers,

    )

    assert res.status\_code \== 200

    assert res.json()\["name"\] \== "Test Proje"

@pytest.mark.django\_db

def test\_viewer\_cannot\_create(client, db):

    from django.contrib.auth import get\_user\_model

    u \= get\_user\_model().objects.create\_user(username="viewer", password="test")

    UserProfile.objects.create(user=u, role=Role.VIEWER)

    token \= create\_token(u)

    res \= client.post(

        "/api/projects/",

        data={"name": "Yetkisiz", "province": "İzmir", "status": "aktif"},

        content\_type="application/json",

        HTTP\_AUTHORIZATION=f"Bearer {token}",

    )

    assert res.status\_code \== 403

---

## 🚀 Üretim Geçiş Notları (İleride)

Localhost → Üretim için yapılacaklar (bu planın kapsamı dışı):

□ config/settings/production.py (DEBUG=False, HTTPS, HSTS)

□ gunicorn \+ nginx kurulumu

□ Medya dosyaları için S3 veya NGINX static servis

□ Managed PostgreSQL (Supabase / AWS RDS)

□ Sistem ortam değişkenleri (.env yerine)

□ Celery \+ Redis (e-posta bildirimleri — Faz 7\)

---

## 📊 Haftalık Durum Raporu Şablonu

\#\# Haftalık Proje Durum Raporu

Proje: ProjeHaritası | Hafta: W\[N\] | Tarih: \[GG.AA.YYYY\]

\#\#\# Bu Hafta Tamamlananlar ✅

\- ...

\#\#\# Önümüzdeki Hafta Planı 📋

\- ...

\#\#\# Açık Maddeler / Engelleyiciler 🔴

\- ...

\#\#\# Genel Durum: 🟢 YEŞİL / 🟡 SARI / 🔴 KIRMIZI

---

*Bu plan yaşayan bir belgedir — her faz tamamlandıkça ilgili satırdaki ⬜ → ✅ olarak güncelleyin.*  

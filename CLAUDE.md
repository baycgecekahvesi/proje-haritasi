# CLAUDE.md — ProjeHaritası Geliştirme Planı

> **Versiyon:** 2.0  
> **Proje:** baycgecekahvesi/proje-haritasi  
> **Stack:** Django 5.0 + django-ninja + Vanilla JS + Flutter  
> **Hedef:** İl bazlı endüstriyel proje yönetim sistemi

---

## 📁 Mevcut Klasör Yapısı

```
config/          → Django ayarları, NinjaAPI, URL'ler
apps/
  accounts/      → User, JWT, roller, AuthBearer
  projects/      → Project, Task, harita API
  budget/        → Budget, Expense
  documents/     → Dosya yükleme/silme
  reports/       → Raporlama servisleri
  iolist/        → IO Listesi yönetimi
frontend/
  templates/     → index.html (SPA shell)
  static/js/     → api, auth, map, projects, budget, documents, reports
mobile/          → Flutter uygulaması
tests/           → pytest test paketi
memory_bank/     → Proje hafızası
.claude/         → Agent hub konfigürasyonu
```

---

## 👥 Agent Team

### django_dev
Django/Python uzmanı. `apps/` ve `config/` klasörlerinde çalışır.
- django-ninja ile API endpoint yazar
- Pydantic V2 uyumlu schema'lar
- `@require_role(...)` dekoratörü ile yetkilendirme
- Her endpoint için `tests/` altına test ekler
- Migration'ları commit'ler
- **Sonnet modeli kullan**

### flutter_dev
Flutter/Dart uzmanı. `mobile/` klasöründe çalışır.
- Django API'ye Dio ile bağlanır
- JWT token yönetimi (Authorization: Bearer)
- Riverpod state management
- GoRouter navigasyon
- Offline SQLite cache (Faz 4'ten itibaren)
- **Sonnet modeli kullan**

### frontend_dev
Vanilla JS uzmanı. `frontend/static/js/` klasöründe çalışır.
- SPA mimarisi — `app.js` ana giriş noktası
- SVG harita: `map.js` — `data-iladi` attribute değiştirme
- API çağrıları: `api.js` üzerinden
- Chart.js CDN — başka kütüphane ekleme
- **Sonnet modeli kullan**

### test_agent
Test uzmanı. `tests/` klasöründe çalışır.
- pytest-django ile API testleri
- Her yeni endpoint için test yazar
- `pytest -q` ile çalıştırır
- Mevcut 28 test bozulmamalı
- **Haiku modeli kullan**

---

## 🔐 Rol Sistemi

### Mevcut Teknik Roller
| Rol | Yetki |
|-----|-------|
| Admin | Her şey + kullanıcı yönetimi + proje silme |
| Editör | Proje/görev/bütçe/döküman oluştur-düzenle |
| İzleyici | Yalnızca okuma |

### Eklenecek İş Rolleri (Faz 2)
| İş Rolü | Teknik Rol | Ne Yapacak |
|---------|-----------|-----------|
| Proje Müdürü | Admin | Proje açar, bütçe onaylar, raporlar alır |
| Saha Mühendisi | Editör | Görev günceller, fotoğraf yükler, GPS girer |
| Endüstri Mühendisi | Editör+ | İş programı, kaynak planlaması, verimlilik |
| Mali / Muhasebe | Editör (sadece budget) | Harcama, fatura, hakediş |
| Üst Yönetim | İzleyici+ | Sadece KPI dashboard, özet rapor |
| Müteahhit | İzleyici (kısıtlı) | Yalnızca kendi projesini görür |
| Dış Denetçi | İzleyici | Belge inceleme, salt okuma |

---

## 🗺️ Geliştirme Yol Haritası

---

## ✅ FAZ 0 — Mevcut Durum (Tamamlandı)

- [x] Django + django-ninja backend
- [x] JWT kimlik doğrulama
- [x] Admin / Editör / İzleyici roller
- [x] Proje CRUD
- [x] Görev yönetimi
- [x] Bütçe & harcama takibi
- [x] Döküman yükleme/silme
- [x] SVG Türkiye haritası (renk kodlu)
- [x] Raporlama API'leri
- [x] IO Listesi yönetimi
- [x] Railway deploy (PostgreSQL)
- [x] Flutter mobil (temel)
- [x] 28 pytest testi

---

## 🔴 FAZ 1 — Kritik Altyapı (Öncelik: Yüksek)

> **Hedef:** Sistemin gerçek sahada kullanılabilir hale gelmesi  
> **Tahmini Süre:** 3-4 hafta

### 1.1 Bildirim Sistemi
**Neden:** Proje gecikiyor ama kimse haberdar olmuyor.

```
apps/notifications/ oluştur

Model:
- Notification(user, type, message, project, is_read, created_at)

Bildirim Türleri:
- TASK_OVERDUE     → Görev süresi doldu
- BUDGET_EXCEEDED  → Bütçe %80 aşıldı
- PROJECT_DELAYED  → Proje gecikiyor
- DOCUMENT_UPLOADED → Yeni döküman yüklendi
- TASK_ASSIGNED    → Göreve atandın

API Endpoints:
- GET  /api/notifications/          → Bildirim listesi
- POST /api/notifications/{id}/read → Okundu işaretle
- POST /api/notifications/read-all  → Tümünü okundu yap

Frontend:
- Navbar'da 🔔 badge (okunmamış sayısı)
- Dropdown bildirim listesi
- Kırmızı bayrak: gecikmiş proje kartları

Django Komutu:
- python manage.py check_deadlines  → Cron ile günlük çalıştır
```

**Test:** `tests/test_notifications.py` — 5 test senaryosu yaz

---

### 1.2 Audit Log (Değişiklik Geçmişi)
**Neden:** Kim ne zaman ne değiştirdi? Şu an bilinmiyor.

```
apps/audit/ oluştur

Model:
- AuditLog(user, action, model_name, object_id, 
           old_value, new_value, ip_address, created_at)

Action Türleri: CREATE, UPDATE, DELETE, LOGIN, LOGOUT

Middleware:
- config/middleware.py → AuditMiddleware
- Her yazma isteğinde otomatik log

API:
- GET /api/audit/?project_id=X  → Proje bazlı log (Admin)
- GET /api/audit/user/{id}       → Kullanıcı bazlı log (Admin)

Frontend:
- Proje detayında "Geçmiş" sekmesi
- Zaman çizelgesi görünümü
```

**Test:** `tests/test_audit.py` — 4 test senaryosu yaz

---

### 1.3 Excel / PDF Rapor Export
**Neden:** Yöneticiler Swagger'a bakmaz, Word/Excel/PDF ister.

```
requirements.txt'e ekle:
- openpyxl
- reportlab (veya weasyprint)

API:
- GET /api/reports/export/excel?project_id=X
- GET /api/reports/export/pdf?project_id=X
- GET /api/reports/export/summary-excel  → Tüm özet

Rapor İçeriği:
- Proje bilgileri
- Görev durumları (tamamlanan/bekleyen/geciken)
- Bütçe vs harcama tablosu
- Risk listesi
- IO listesi

Frontend:
- Rapor sayfasına "Excel İndir" ve "PDF İndir" butonları
```

**Test:** `tests/test_exports.py` — 3 test senaryosu yaz

---

## 🟠 FAZ 2 — İş Programı & Kaynak Yönetimi (Öncelik: Yüksek)

> **Hedef:** Endüstri mühendisinin kullanabileceği planlama araçları  
> **Tahmini Süre:** 4-5 hafta

### 2.1 Görev Bağımlılıkları & İş Programı
**Neden:** A görevi bitmeden B başlayamaz — sistem bunu bilmiyor.

```
apps/projects/models.py'e ekle:

Task modeline yeni alanlar:
- planned_start_date  (DateField)
- planned_end_date    (DateField)
- actual_start_date   (DateField, null=True)
- actual_end_date     (DateField, null=True)
- progress_percent    (IntegerField, 0-100)
- delay_reason        (TextField, null=True)

Yeni Model:
- TaskDependency(task, depends_on, dependency_type)
  dependency_type: FS (Finish-Start), SS, FF, SF

Migration:
- python manage.py makemigrations projects
- python manage.py migrate

API:
- POST /api/projects/{id}/tasks/{task_id}/dependencies
- GET  /api/projects/{id}/gantt  → Gantt verisi
- PATCH /api/projects/{id}/tasks/{task_id}/progress

Frontend (frontend_dev):
- Gantt görünümü (Chart.js timeline veya vanilla JS)
- Görev kartlarında ilerleme çubuğu (%)
- Geciken görevler kırmızı vurgulu
```

**Test:** `tests/test_schedule.py` — 6 test senaryosu yaz

---

### 2.2 Kaynak Yönetimi
**Neden:** Kim ne iş yapıyor, kim müsait, kim aşırı yüklü — bilinmiyor.

```
apps/resources/ oluştur

Modeller:
- Resource(name, type, unit, capacity_per_day, cost_per_unit, is_active)
  type: PERSONNEL, EQUIPMENT, MATERIAL

- TaskResource(task, resource, planned_quantity, 
               actual_quantity, unit_cost)

API:
- GET/POST     /api/resources/
- GET/PATCH    /api/resources/{id}
- POST         /api/projects/{id}/tasks/{task_id}/resources
- GET          /api/resources/availability?date=X  → Müsaitlik
- GET          /api/resources/workload              → Yük raporu

Frontend (frontend_dev):
- Kaynak listesi sayfası
- Görev detayında kaynak atama
- Kaynak yük grafiği (Chart.js bar)
- ⚠️ Çakışma uyarısı (aynı kaynak, aynı tarih)
```

**Test:** `tests/test_resources.py` — 5 test senaryosu yaz

---

### 2.3 Risk Modülü (Tamamlama)
**Neden:** `seed_risks` var ama risk modülü tam değil.

```
apps/risks/ oluştur (veya mevcut yapıya ekle)

Model:
- Risk(project, title, description, probability, impact,
       risk_score, owner, status, action_plan, closed_at)
  probability: 1-5
  impact: 1-5
  risk_score: probability × impact (otomatik hesaplanır)
  status: OPEN, MITIGATED, CLOSED, ACCEPTED

API:
- GET/POST   /api/projects/{id}/risks
- PATCH      /api/projects/{id}/risks/{risk_id}
- GET        /api/projects/{id}/risks/matrix  → Risk matrisi verisi

Frontend (frontend_dev):
- 5×5 Risk matrisi görselleştirme (renkli ısı haritası)
- Risk listesi filtreleme (yüksek/orta/düşük)
- Risk sahibi atama dropdown
```

**Test:** `tests/test_risks.py` — 4 test senaryosu yaz

---

## 🟡 FAZ 3 — KPI & Analitik Dashboard (Öncelik: Orta)

> **Hedef:** Üst yönetim için tek ekranda tüm özet  
> **Tahmini Süre:** 3 hafta

### 3.1 KPI Dashboard
```
API:
- GET /api/dashboard/kpi → Tüm KPI'lar tek endpoint

Dönen Veri:
{
  "toplam_proje": 45,
  "aktif_proje": 23,
  "tamamlanan_proje": 18,
  "geciken_proje": 7,
  "toplam_butce": 125000000,
  "toplam_harcama": 87000000,
  "butce_kullanim_orani": 69.6,
  "ortalama_gecikme_gun": 12,
  "il_bazli_performans": [...],
  "bu_ay_tamamlanan_gorev": 34,
  "kritik_riskler": 5
}

Frontend (frontend_dev):
- Yeni "Dashboard" sayfası
- Büyük sayı kartları (KPI tiles)
- Chart.js: Aylık tamamlanma trendi (line chart)
- Chart.js: İl bazlı proje dağılımı (bar chart)
- Harita üzerinde bütçe yoğunluğu renklendirme
```

---

### 3.2 S-Eğrisi (İlerleme Takibi)
```
API:
- GET /api/projects/{id}/s-curve

Dönen Veri:
- Haftalık planlanan ilerleme %
- Haftalık gerçekleşen ilerleme %

Frontend (frontend_dev):
- Proje detayında S-Eğrisi grafiği (Chart.js line)
- Planlanan (mavi) vs Gerçekleşen (yeşil/kırmızı)
```

---

### 3.3 Hakediş / Puantaj Modülü
**Neden:** Özellikle kamu projeleri için zorunlu.

```
apps/payroll/ oluştur

Modeller:
- Timesheet(project, resource, date, hours_worked, 
            work_description, approved_by, status)
  status: DRAFT, SUBMITTED, APPROVED, REJECTED

- Progress Payment(project, period_start, period_end,
                   planned_amount, actual_amount,
                   approved_amount, status)

API:
- GET/POST   /api/projects/{id}/timesheets
- PATCH      /api/projects/{id}/timesheets/{id}/approve
- GET/POST   /api/projects/{id}/payments
- PATCH      /api/projects/{id}/payments/{id}/approve

Frontend (frontend_dev):
- Haftalık puantaj girişi (takvim görünümü)
- Hakediş listesi ve onay akışı
- Excel export (hakediş tablosu)
```

**Test:** `tests/test_payroll.py` — 5 test senaryosu yaz

---

## 🟢 FAZ 4 — Mobil Güçlendirme (Öncelik: Orta)

> **Hedef:** Flutter uygulamasının gerçek saha aracına dönüşmesi  
> **Tahmini Süre:** 4-5 hafta

### 4.1 Offline Çalışma
```
flutter_dev:

pubspec.yaml'a ekle:
- sqflite: ^2.3.0
- connectivity_plus: ^5.0.0
- drift: ^2.14.0  (önerilen ORM)

Yapı:
lib/
  core/
    offline/
      local_db.dart        → SQLite şema
      sync_service.dart    → Senkronizasyon mantığı
      conflict_resolver.dart → Çakışma çözümü

Senaryolar:
- İnternet yok → local SQLite'a yaz
- İnternet geldi → otomatik sync
- Çakışma → "Sunucu versiyonu mu, local mü?" sorusu
- Sync durumu göstergesi (navbar'da)
```

---

### 4.2 GPS & Fotoğraflı Saha Raporu
```
flutter_dev:

pubspec.yaml'a ekle:
- geolocator: ^10.1.0
- image_picker: ^1.0.0
- camera: ^0.10.0

Özellikler:
- Fotoğraf çekerken GPS koordinatı otomatik eklenir
- Tarih damgası (timestamp) zorunlu
- "Önce / Sonra" fotoğraf karşılaştırma
- Fotoğrafa açıklama notu eklenebilir

API (django_dev):
- POST /api/projects/{id}/site-photos
  Body: {photo, latitude, longitude, description, taken_at}
- GET  /api/projects/{id}/site-photos
- GET  /api/projects/{id}/site-photos?date=2025-01-15

Flutter Ekranlar:
- SitePhotoScreen → Çekme + yükleme
- PhotoGalleryScreen → Tarih bazlı galeri
- PhotoCompareScreen → Önce/Sonra
```

---

### 4.3 Mobil Push Bildirimi
```
flutter_dev:

pubspec.yaml'a ekle:
- firebase_messaging: ^14.7.0
- flutter_local_notifications: ^16.3.0

Bildirimler:
- Görev gecikti → Saha mühendisine
- Bütçe aşıldı → Proje müdürüne
- Döküman yüklendi → İlgili kişilere

django_dev:
- FCM token kaydetme endpoint'i
- POST /api/notifications/register-device
  Body: {fcm_token, device_type}
```

---

## 🔵 FAZ 5 — Müteahhit Portalı (Öncelik: Düşük)

> **Hedef:** Dış firmaların kendi projelerini görebileceği izole portal  
> **Tahmini Süre:** 3-4 hafta

```
apps/accounts/models.py'e ekle:

- ContractorProfile(user, company_name, tax_number,
                    contact_person, phone, address)

- ProjectContractor(project, contractor, role,
                    contract_amount, start_date, end_date)

Rol Mantığı:
- Müteahhit kullanıcı → Sadece atandığı projeleri görür
- Başka projelere /api/projects/ ile erişemez
- Döküman yükleyebilir, görev güncelleyebilir
- Bütçe detayını göremez (gizli)

API:
- GET /api/contractor/my-projects     → Kendi projeleri
- GET /api/contractor/my-tasks        → Kendi görevleri
- POST /api/contractor/documents/{id} → Döküman yükle

Frontend (frontend_dev):
- Ayrı login sayfası (veya rol bazlı yönlendirme)
- Kısıtlı menü (sadece kendi projeleri)
- Döküman yükleme arayüzü
```

**Test:** `tests/test_contractor.py` — 6 test senaryosu yaz

---

## 🤖 FAZ 6 — Yapay Zeka (Vizyon)

> **Hedef:** Geçmiş veriye dayalı tahminleme  
> **Tahmini Süre:** 6+ hafta

```
apps/ai_insights/ oluştur

requirements.txt'e ekle:
- scikit-learn
- pandas
- numpy

Özellikler:

1. Gecikme Tahmini
   - Girdi: proje türü, il, bütçe, görev sayısı, risk skoru
   - Çıktı: "Bu proje %73 ihtimalle gecikeceğe benziyor"
   - Model: Random Forest (geçmiş proje verisiyle eğitilir)

2. Bütçe Aşım Uyarısı
   - Mevcut harcama hızına bakarak bitiş tahmini
   - "Bu hızla giderse bütçe 45 günde tükenir"

3. Benzer Proje Karşılaştırma
   - "Benzer 3 projeye baktık, ortalama 8 ay sürdü"

API:
- GET /api/ai/project/{id}/delay-risk
- GET /api/ai/project/{id}/budget-forecast
- GET /api/ai/project/{id}/similar-projects
```

---

## 📐 Kod Standartları

### Django
- django-ninja schema'ları Pydantic V2 uyumlu yaz
- Kimlik doğrulama: `AuthBearer` — her korumalı endpoint'e ekle
- Rol kontrolü: `@require_role("Admin")` / `@require_role("Editör")`
- Yeni `apps/` modülü → `config/api.py`'ye router kaydet
- `provinces.py` ↔ `provinces.js` il isimleri senkron kalmalı
- Migration her model değişikliğinde oluştur ve commit'le
- `.env` ile hassas bilgileri sakla

### Frontend (Vanilla JS)
- Yeni JS dosyası → `index.html`'e script tag ekle
- API çağrıları her zaman `api.js` üzerinden
- SVG harita renk kodları değiştirilmez:
  🔵 Aktif · 🟠 Beklemede · 🟢 Tamamlandı · 🔴 Gecikmeli · ⬜ Projesiz

### Flutter
- Base URL `.env`'den oku, sabit yazma
- JWT token → secure storage
- Her API hatasında kullanıcıya anlamlı mesaj
- Offline senaryoyu her ekranda düşün (Faz 4'ten itibaren)

### Test
- Her yeni endpoint → minimum 3 test senaryosu
- `pytest -q` mevcut 28 test hep geçmeli
- Test isimleri açıklayıcı: `test_admin_can_delete_project`

---

## 🚨 Önemli Kurallar

```
✅ Her yeni apps/ modülü → config/api.py'ye router ekle
✅ provinces.py ve provinces.js daima senkron
✅ Pydantic V2 uyumu — validator yerine field_validator kullan
✅ Migration commit'le — asla atlama
✅ USE_SQLITE=False production'da zorunlu
✅ seed_demo komutu test verisini sıfırlar — dikkatli kullan

❌ rm -rf çalıştırma
❌ API URL'lerini Flutter/JS'de sabit yazma
❌ Mevcut 28 testi bozan değişiklik yapma
❌ provinces listesini tek tarafta değiştirme
❌ AuthBearer olmadan yazma endpoint'i açma
```

---

## 🔌 API Özet Tablosu

### Mevcut
| Method | URL | Min. Rol |
|--------|-----|----------|
| POST | /api/auth/login | — |
| GET | /api/auth/me | İzleyici |
| GET | /api/projects/ | İzleyici |
| GET | /api/projects/map | İzleyici |
| POST/PATCH | /api/projects/ | Editör |
| DELETE | /api/projects/{id} | Admin |
| GET/POST | /api/projects/{id}/tasks | İzleyici/Editör |
| GET/PATCH | /api/budget/{id} | İzleyici/Editör |
| GET/POST | /api/documents/{id} | İzleyici/Editör |
| GET | /api/reports/* | İzleyici |

### Eklenecek (Faz Sırasıyla)
| Faz | Endpoint Grubu | Adet |
|-----|---------------|------|
| Faz 1 | /api/notifications/* | 3 |
| Faz 1 | /api/audit/* | 2 |
| Faz 1 | /api/reports/export/* | 3 |
| Faz 2 | /api/projects/{id}/gantt | 1 |
| Faz 2 | /api/resources/* | 5 |
| Faz 2 | /api/projects/{id}/risks/* | 4 |
| Faz 3 | /api/dashboard/kpi | 1 |
| Faz 3 | /api/projects/{id}/s-curve | 1 |
| Faz 3 | /api/projects/{id}/timesheets | 4 |
| Faz 4 | /api/projects/{id}/site-photos | 3 |
| Faz 4 | /api/notifications/register-device | 1 |
| Faz 5 | /api/contractor/* | 3 |
| Faz 6 | /api/ai/* | 3 |

---

## 📊 Faz Özet Tablosu

| Faz | İçerik | Süre | Öncelik |
|-----|--------|------|---------|
| ✅ Faz 0 | Mevcut sistem | Tamamlandı | — |
| 🔴 Faz 1 | Bildirim, Audit Log, Export | 3-4 hafta | Yüksek |
| 🔴 Faz 2 | İş Programı, Kaynak, Risk | 4-5 hafta | Yüksek |
| 🟡 Faz 3 | KPI Dashboard, S-Eğrisi, Hakediş | 3 hafta | Orta |
| 🟡 Faz 4 | Mobil Offline, GPS, Push | 4-5 hafta | Orta |
| 🟢 Faz 5 | Müteahhit Portalı | 3-4 hafta | Düşük |
| 🔵 Faz 6 | Yapay Zeka | 6+ hafta | Vizyon |

---

*Bu dosya her faz tamamlandığında güncellenir.*
*Son güncelleme: Haziran 2026*

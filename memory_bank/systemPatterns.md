
# System Patterns — ProjeHaritası

*Son güncelleme: 2026-06-25*

## Genel Mimari

```
Tarayıcı (Vanilla JS SPA)
        ↕ REST (JSON)
Django-Ninja API (/api/)
        ↕
  services.py (iş mantığı)
        ↕
  Django ORM
        ↕
PostgreSQL / SQLite
```

## Backend Katman Yapısı

Her `apps/<app>/` modülü şu yapıyı takip eder:

```
apps/<app>/
  models.py     # Django ORM modelleri
  schemas.py    # Ninja Schema (giriş/çıkış DTO'ları)
  api.py        # Router + endpoint tanımları (ince — sadece yönlendirme)
  services.py   # İş mantığı (ORM sorguları buraya)
  admin.py      # Django admin kaydı
  migrations/   # Veritabanı migration'ları
  management/commands/seed_*.py  # Idempotent seed komutları
```

## API Tasarım Deseni

```python
# api.py — SADECE yönlendirme
router = Router(tags=["risks"])

@router.get("/", response=List[RiskOut])
def list_risks(request, proje_id: int = None):
    return RiskService.list(proje_id)

# services.py — İŞ MANTIĞI
class RiskService:
    @staticmethod
    def list(proje_id=None):
        qs = Risk.objects.select_related("proje")
        if proje_id:
            qs = qs.filter(proje_id=proje_id)
        return qs
```

## Frontend Modül Deseni

Her sekme kendi IIFE modülüdür:

```javascript
// frontend/static/js/risks.js
const RisksModule = (() => {
    function init() { /* ... */ }
    function render(data) { /* ... */ }
    return { init };
})();
```

`app.js`'de kayıt:
```javascript
switchTab('risks', RisksModule.init);
```

## Auth Deseni

- JWT token — `Authorization: Bearer <token>` header'ı
- `AuthBearer` middleware ile tüm korumalı endpoint'ler
- Roller: `admin` / `editor` / `viewer`
- Meslek rolleri: `ELK` / `PLC` / `SCADA` / `SAHA` / `PM`

## Harita Deseni

- SVG Türkiye haritası — il bazlı renklendirme
- Her il `data-province` attribute ile eşleştirilir
- Proje durumuna göre renk (aktif/tamamlandı/risk vb.)

## Grafik Deseni

- Chart.js kullanılır
- Raporlar sekmesinde yönetim dashboard'u
- Risk modülünde bubble chart (olasılık × etki × büyüklük)

## Seed Deseni

```python
# Idempotent — her zaman güvenli çalışır
Risk.objects.get_or_create(
    proje=proje,
    baslik="Örnek Risk",
    defaults={"olasilik": 3, "etki": 4}
)
```

## CSS Versiyonlama

```html
<!-- index.html -->
<link rel="stylesheet" href="/static/css/app.css?v=14">
<script src="/static/js/risks.js?v=3"></script>
```
CSS veya JS değiştiğinde `?v=` numarası artırılır.

## Agent Motoru

`apps/agents/engine.py` — deterministik kural tabanlı:
- PM Ajanı: geciken görevleri saptar, bildirim üretir
- Risk Ajanı: yüksek riskli projeleri işaretler

## Modül İlişkileri

```
projects ←── budget
projects ←── documents
projects ←── skills (ProjeGorev)
projects ←── risks
projects ←── punchlist
projects ←── iolist
accounts ──→ skills (atanan mühendis)
agents ──→ projects, risks (okur, bildirim üretir)
reports ──→ projects, budget, skills (aggregation)
```

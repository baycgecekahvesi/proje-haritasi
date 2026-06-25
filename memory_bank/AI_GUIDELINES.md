# AI Guidelines for ProjeHaritası Development

> [!IMPORTANT]
> Bu projeye katkıda bulunan tüm AI asistanlar, herhangi bir kod değişikliği önermeden veya uygulamadan önce bu kılavuzu okumalı ve uymalıdır.

---

## 1. Stack Bütünlüğü Kuralı (ZORUNLU)

- **Kural**: Frontend'e asla React, Vue, Angular veya herhangi bir JS framework ekleme. Proje saf Vanilla JS + HTML/CSS kullanır.
- **Kural**: Backend için Django 5.0 + django-ninja 1.3 stack'i korunmalıdır. Başka bir REST framework ekleme.
- **Kural**: `api.py` içine doğrudan ORM sorgusu yazma — iş mantığı `services.py`'e taşınmalıdır.
- **Kural**: Schema tanımları sadece `apps/<app>/schemas.py` içinde, Ninja `Schema` sınıfları olarak tutulmalıdır.
- **Gerekçe**: Stack bütünlüğü bozulursa Railway deploy'u, mevcut frontend modülleri ve tüm servis katmanı çöker.

---

## 2. Güvenlik Sıfır İhlal Kuralı (ZORUNLU)

- **Kural**: `SECRET_KEY`, DB şifresi veya herhangi bir `API_KEY` kaynak koduna yazılmaz. Her zaman `python-decouple` + `.env` kullanılır.
- **Kural**: `db.sqlite3` veya `.env` dosyası commit edilmez.
- **Kural**: SQL injection, XSS ve OWASP Top 10 açıklarına karşı dikkatli olunmalıdır — ORM kullanıldığında bu büyük ölçüde sağlanır, raw SQL kullanılmamalıdır.
- **Kural**: Model değişikliği olmadan `makemigrations` çalıştırılmaz; migration üretilmez.

---

## 3. Kalıcı Bilgi Tabanı Kuralı (ZORUNLU)

AI'nın oturumlar arası sürekliliği koruması için:

- **Kural**: `memory_bank/` klasöründeki tüm dosyalar her göreve başlamadan ÖNCE okunmalıdır.
- **Kural**: Eklenen her yeni özellik veya sistemsel geliştirme (küçük/büyük fark etmeksizin) ANINDA `memory_bank/activeContext.md` dosyasına işlenmelidir.
- **Kural**: Hata düzeltmeleri, çökme çözümleri ve kararlılık yamaları ANINDA `memory_bank/progress.md` dosyasına kaydedilmelidir.
- **Kural**: Bu bir TAVSİYE DEĞİL, ZORUNLULUKTUR. Değişikliği tamamladıktan sonra ilgili `memory_bank/` dosyasını güncellemezseniz kural ihlali yapmış olursunuz.
- **Kural**: Mevcut modülleri, mimariyi veya çözülmüş sorunları anlamak için `memory_bank/` klasörüne başvurun.

### Zorunlu Memory Bank Yapısı

```
memory_bank/
  README.md          # Bu klasörün amacı ve içeriği
  AI_GUIDELINES.md   # Bu dosya — AI davranış kuralları
  activeContext.md   # Aktif odak, son değişiklikler, sonraki adımlar
  progress.md        # Ne çalışıyor, ne kaldı, bilinen sorunlar
  systemPatterns.md  # Mimari kararlar, tasarım desenleri, modül ilişkileri
  techContext.md     # Teknolojiler, bağımlılıklar, geliştirme kurulumu
  projectBrief.md    # Proje kapsamı, hedefler, temel gereksinimler
```

---

## 4. Modüler Sorumluluk Kuralı

- **Kural**: `api.py` ince tutulmalıdır — sadece router ve endpoint tanımları içermelidir.
- **Kural**: İş mantığı `services.py`'e delege edilmelidir.
- **Kural**: Frontend'de her modül kendi ayrı IIFE dosyasında olmalıdır (`projects.js`, `reports.js`, vb.).
- **Kural**: Birden fazla sorumluluğu olan "God Object" sınıf veya modüller oluşturulmamalıdır.
- **Kural**: Yeni frontend sekmesi eklenirken: yeni IIFE dosyası oluştur + `app.js`'de `switchTab` kaydını ekle.

---

## 5. Doğrulama Standartları

- **Kural**: Yapısal değişiklikten sonra her zaman `python manage.py check` çalıştırın — sıfır hata hedefleyin.
- **Kural**: Test için `pytest` kullanın. Kritik değişikliklerde testler yazılmalıdır.
- **Kural**: CSS değişikliğinde: `app.css`'teki versiyon numarasını artır, `index.html`'deki `?v=` parametresini güncelle.
- **Kural**: JS değişikliğinde: `index.html`'deki `?v=` parametresini artır (tarayıcı cache kırılmalıdır).
- **Kural**: Seed komutları idempotent olmalıdır (`get_or_create` veya `update_or_create` kullanın).

---

## 6. Dosya Sınırı Kuralı (ZORUNLU)

- **Kural**: Mevcut modül sınırları kesindir ve değiştirilemez.
- **Kural**: Dosyaları birleştirme, modülleri daraltma veya açıkça talimat verilmediği sürece mantığı modüller arasında taşıma.
- **Kural**: Her modülün tek bir sorumluluğu vardır ve izole kalmalıdır.
- **Kural**: Bir görev birden fazla modülde değişiklik gerektiriyorsa, bunları ayrı ayrı değiştirin — ASLA birleştirmeyin.

- **İhlal Koşulu**: Bir AI modülleri birleştirir, dosyaları katlarsa veya mantığı tek dosyada merkezileştirirse çözüm GEÇERSİZDİR.

---

## 7. Kapsam İzolasyon Kuralı

- **Kural**: AI yalnızca açıkça istenen dosya veya modülü değiştirmelidir.
- **Kural**: İstenen alanın ötesine kapsam genişletmek YASAKTIR.
- **Kural**: Verilen kapsam dışında "iyileştirme", "refactor" veya "optimizasyon" yapılamaz.

- **Örnek**: `punchlist.js`'de bir hata düzeltmesi istenirse:
  → SADECE `punchlist.js`'i değiştir
  → `risks.js`, `iolist.js` veya diğer modüllere dokunma

- **İhlal Koşulu**: AI ilgisiz modülleri değiştirirse cevap GEÇERSİZDİR.

---

## 8. Örtük Refactor Yasağı

- **Kural**: Refactoring YALNIZCA açıkça istendiğinde yapılabilir.
- **Kural**: AI, talimat verilmediği sürece kodu yeniden organize etmemeli, yapılandırmamamalı veya yeniden yazmamalıdır.

- **Yasak Eylemler**:
  - Birden fazla modülü tek bir dosyada birleştirmek
  - "Okunabilirlik için" mantığı taşımak
  - Açık izin olmadan mimariyi değiştirmek

- **İzin Verilenler**:
  - Minimal, yerelleştirilmiş düzeltmeler

---

## 9. Mimari Koruma Kuralı

- **Kural**: Mevcut mimari KARARLIDIР ve korunmalıdır.
- **Kural**: AI kod tabanına bir üretim sistemi olarak davranmalıdır; prototip değil.

- **Öncelik Sırası**:
  1. Kararlılık
  2. Modülerlik
  3. Okunabilirlik
  4. Performans

- **Kural**: Bir değişiklik mimariyi bozma riski taşıyorsa UYGULANMAMALIDIR.

---

## 10. Küçük Fonksiyon Kuralı

- **Kural**: Fonksiyonlar küçük ve odaklı kalmalıdır (ideal olarak Python'da <50 satır, JS'de <80 satır).
- **Kural**: Bir fonksiyon çok büyüyorsa daha küçük yardımcı fonksiyonlara bölün.
- **Kural**: Django `services.py` fonksiyonları tek bir iş eylemini gerçekleştirmelidir.

- **Yasak**:
  - Büyük monolitik fonksiyonlar
  - Çok sorumlu fonksiyonlar

---

## 11. Çok Modüllü Koordinasyon Kuralı

- **Kural**: Birden fazla modülde çalışırken:
  1. Tüm modülleri analiz et
  2. Plan öner
  3. Onay bekle
  4. Sonra uygula

- **Kural**: Planlama olmadan doğrudan çok modüllü değişiklikler YASAKTIR.

---

## 12. Anti-God Object Kuralı

- **Kural**: Hiçbir sınıf makul bir sorumluluk kapsamını aşamaz.
- **Kural**: Büyük model sınıfları daha küçük alt sistemlere ayrılmalıdır.
- **Kural**: Django modellerinde `Meta`, `__str__`, property ve iş mantığı birbirinden ayrılmalıdır — karmaşık iş mantığı `services.py`'e taşınmalıdır.

- **Yasak**:
  - Her şeyi kontrol eden merkezi "manager" nesneleri
  - Aşırı yüklenmiş durum konteynerleri

---

## 13. AI Davranış Kilidi

- AI eksik bağlamı VARSAYMAMALDIR.
- AI belirtilmemiş alanları "iyileştirmemelidir".
- AI talimatların ötesinde inisiyatif ALAMAZ.

- Emin değilse:
  → Kodu değiştirmek yerine SOR.

---

## 14. Tek Sorumluluk Kuralı (SRP)

- **Kural**: Her Python modülü (`.py`) ve JavaScript dosyası (`.js`) açıkça tanımlanmış TEK bir sorumluluğa sahip olmalı ve bunu mükemmel şekilde yerine getirmelidir.
- **Backend**: `models.py` veri yapısı, `schemas.py` serileştirme, `services.py` iş mantığı, `api.py` routing.
- **Frontend**: Her `.js` dosyası tek bir UI modülünü temsil eder (örn. `risks.js` sadece Risk Kayıt Defteri'ni yönetir).
- **Hedef**: Hatalar derinlemesine yerelleştirilir; bir modüldeki hata diğerini etkilemez.

---

## 15. N+1 Sorgu Yasağı

- **Kural**: ORM sorgularında N+1 sorgusundan kaçınılmalıdır.
- **Kural**: İlişkili veriler için `select_related()` ve `prefetch_related()` kullanılmalıdır.
- **Kural**: Toplu hesaplamalar için `annotate()` ve `aggregate()` tercih edilmelidir.
- **Gerekçe**: Üretim PostgreSQL veritabanında büyük veri setleriyle N+1 sorguları kritik performans sorunlarına yol açar.

---

## 16. Dokümantasyon Kalitesi Kuralı

- **Kural**: Yeni veya değiştirilen tüm `public` Python fonksiyonları ve sınıfları için docstring yazılmalıdır.
- **Kural**: Docstring'ler amacı, parametreleri ve dönüş değerini açıklamalıdır — sadece fonksiyon adını tekrarlamamalıdır.
- **Kural**: JavaScript'te karmaşık mantık için JSDoc formatında yorum eklenmelidir.
- **Kural**: Yorum NEDEN'i açıklamalıdır, NE YAPTIĞını değil (iyi adlandırılmış değişkenler bunu zaten anlatır).

### Dokümantasyon Skor Anlamı

```
0/10 = Eksik dokümantasyon.
3/10 = Çoğunlukla fonksiyon adını tekrarlıyor.
5/10 = Temel açıklama, eksik.
7/10 = İnsanlar için yeterince iyi, ancak uzun vadeli AI bağlamı için güçlü değil.
8/10 = Kabul edilebilir: net amaç, davranış ve ilgili bağlam.
10/10 = Mükemmel: gelecek-kanıtlı, kesin, teknik açıdan zengin.
```

---

## 17. Veritabanı Güvenlik Kuralı

- **Kural**: Migration'lar her zaman `python manage.py makemigrations` ile oluşturulur; elle yazılmaz.
- **Kural**: Production'da yıkıcı migration (kolon silme, tablo drop) doğrudan uygulanmaz — önce yedek alınır.
- **Kural**: `db.sqlite3` dosyası asla commit edilmez.
- **Kural**: Üretimde ham SQL sorgusu çalıştırmadan önce kullanıcı onayı alınmalıdır.

---

*Uyarlanma: Aeon Engine AI Guidelines → ProjeHaritası (Django + Vanilla JS)*
*Geçerli Stack: Python 3.12 / Django 5.0 / django-ninja 1.3 / Vanilla JS / PostgreSQL*

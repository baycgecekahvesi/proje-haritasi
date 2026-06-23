from django.conf import settings
from django.db import models


class GorevDurumu(models.Model):
    """skill-ekosistemi.json → gorev_durumlari: görev durumu tanımları."""

    deger = models.CharField(max_length=30, unique=True)  # "Planlandı", "Tamamlandı" ...
    renk = models.CharField(max_length=7)
    ikon = models.CharField(max_length=10, blank=True)
    sira = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Görev Durumu"
        verbose_name_plural = "Görev Durumları"
        ordering = ["sira"]

    def __str__(self):
        return self.deger


class RoleSkill(models.Model):
    """Endüstriyel otomasyon birimindeki bir rolü ve skill tanımını temsil eder."""

    rol_id = models.CharField(max_length=20, unique=True)  # PLCProg, SCADAEng, ...
    rol_adi = models.CharField(max_length=100)
    renk_kodu = models.CharField(max_length=7, default="#4f6ef7")
    ikon = models.CharField(max_length=10, blank=True)
    sorumluluklar = models.JSONField(default=list)
    yetkinlikler = models.JSONField(default=list)
    durum_alanlari = models.JSONField(default=list)  # role özgü status tracking alanları
    skill_icerik = models.TextField(blank=True)       # SKILL.md içeriği

    class Meta:
        verbose_name = "Rol Skill"
        verbose_name_plural = "Rol Skill'leri"
        ordering = ["rol_adi"]

    def __str__(self):
        return f"{self.ikon} {self.rol_adi} ({self.rol_id})"


class TaskTemplate(models.Model):
    """Bir role ait standart görev şablonu."""

    class Faz(models.TextChoices):
        BASLANGIC   = "Başlangıç",   "Başlangıç"
        PLANLAMA    = "Planlama",    "Planlama"
        HAZIRLIK    = "Hazırlık",    "Hazırlık"
        TASARIM     = "Tasarım",     "Tasarım"
        TEDARIK     = "Tedarik",     "Tedarik"
        GELISTIRME  = "Geliştirme",  "Geliştirme"
        KURULUM     = "Kurulum",     "Kurulum"
        ENTEGRASYON = "Entegrasyon", "Entegrasyon"
        TEST        = "Test",        "Test"
        DEVREYE_ALMA = "Devreye Alma", "Devreye Alma"
        KABUL       = "Kabul",       "Kabul"
        YURUTME     = "Yürütme",     "Yürütme"
        KAPANIS     = "Kapanış",     "Kapanış"

    rol = models.ForeignKey(
        RoleSkill, on_delete=models.CASCADE, related_name="gorev_sablonlari"
    )
    gorev_id_prefix = models.CharField(max_length=10)   # PLC, SCADA, SAHA, ELK, PM
    gorev_sira = models.PositiveSmallIntegerField(default=0)
    gorev_adi = models.CharField(max_length=200)
    faz = models.CharField(max_length=30, choices=Faz.choices)
    min_gun = models.DecimalField(max_digits=4, decimal_places=1)
    max_gun = models.DecimalField(max_digits=4, decimal_places=1)
    onkosullar = models.JSONField(default=list)   # ["ELK-001", "PLC-003", ...]
    teslimati = models.CharField(max_length=255, blank=True)
    tekrar = models.CharField(max_length=20, blank=True)  # "haftalık" vb.

    class Meta:
        verbose_name = "Görev Şablonu"
        verbose_name_plural = "Görev Şablonları"
        ordering = ["rol", "gorev_sira"]

    def __str__(self):
        return f"{self.gorev_id_prefix}-{self.gorev_sira:03d} {self.gorev_adi}"

    @property
    def gorev_id(self) -> str:
        return f"{self.gorev_id_prefix}-{self.gorev_sira:03d}"


class ReferansDoc(models.Model):
    """Bir role ait teknik referans dokümanı (referans/ klasöründen yüklenir)."""

    rol = models.ForeignKey(
        RoleSkill, on_delete=models.CASCADE, related_name="referans_dokumanlar"
    )
    slug = models.SlugField(max_length=100, unique=True)   # "ekipman-secimi"
    baslik = models.CharField(max_length=200)
    standart = models.CharField(max_length=200, blank=True)  # "IEC 61131-3" / kapsam
    revizyon = models.CharField(max_length=20, blank=True)
    icerik = models.TextField()

    class Meta:
        verbose_name = "Referans Doküman"
        verbose_name_plural = "Referans Dokümanlar"
        ordering = ["rol", "slug"]

    def __str__(self):
        return f"{self.rol.rol_id} / {self.baslik}"


class ProjeGorev(models.Model):
    """Otomasyon projesindeki somut görev kaydı (proje-takip.jsx verisinden)."""

    class Durum(models.TextChoices):
        PLANLANDI  = "Planlandı",    "Planlandı"
        DEVAM      = "Devam Ediyor", "Devam Ediyor"
        INCELEMEDE = "İncelemede",   "İncelemede"
        TAMAMLANDI = "Tamamlandı",   "Tamamlandı"
        ENGELLENDI = "Engellendi",   "Engellendi"

    gorev_id      = models.CharField(max_length=20, unique=True)
    rol           = models.CharField(max_length=10)
    gorev_adi     = models.CharField(max_length=200)
    faz           = models.CharField(max_length=30)
    gun           = models.PositiveSmallIntegerField()
    onk           = models.JSONField(default=list)
    teslim        = models.CharField(max_length=200, blank=True)
    baslangic_gun = models.IntegerField(default=0)
    durum         = models.CharField(
        max_length=20, choices=Durum.choices, default=Durum.PLANLANDI
    )
    tamamlanma    = models.PositiveSmallIntegerField(default=0)
    not_metni     = models.TextField(blank=True)
    atanan        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="atanan_gorevler",
    )

    class Meta:
        verbose_name = "Proje Görevi"
        verbose_name_plural = "Proje Görevleri"
        ordering = ["baslangic_gun", "gorev_id"]

    def __str__(self):
        return f"{self.gorev_id} – {self.gorev_adi}"

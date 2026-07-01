import os

from django.conf import settings
from django.db import models

from apps.accounts.models import User
from apps.projects.models import Project


class Document(models.Model):
    class DocType(models.TextChoices):
        CONTRACT = "contract", "Sözleşme"
        REPORT = "report", "Rapor"
        DRAWING = "drawing", "Çizim/Plan"
        PHOTO = "photo", "Fotoğraf"
        OTHER = "other", "Diğer"

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="documents"
    )
    title = models.CharField(max_length=255)
    doc_type = models.CharField(
        max_length=20, choices=DocType.choices, default=DocType.OTHER
    )
    file = models.FileField(upload_to="documents/%Y/%m/")
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="documents"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Döküman"
        verbose_name_plural = "Dökümanlar"
        ordering = ["-uploaded_at"]

    @property
    def file_extension(self) -> str:
        _, ext = os.path.splitext(self.file.name)
        return ext.lower()

    @property
    def file_size_kb(self) -> float:
        try:
            return round(self.file.size / 1024, 1)
        except Exception:
            return 0

    def __str__(self):
        return self.title


class TechnicalSpec(models.Model):
    class SpecType(models.TextChoices):
        PLC_SCADA = "plc_scada", "PLC/SCADA"
        ROBOT     = "robot",     "Robot Sistemleri"
        MES       = "mes",       "MES"
        VISION    = "vizyon",    "Vizyon Sistemi"
        ELECTRIC  = "elektrik",  "Elektrik Altyapı"
        SERVO     = "servo",     "Servo/Hareket"
        GENERAL   = "genel",     "Genel"

    class Status(models.TextChoices):
        DRAFT    = "taslak",   "Taslak"
        REVIEW   = "inceleme", "İncelemede"
        APPROVED = "onaylı",   "Onaylı"
        REVISED  = "revize",   "Revize"

    # Genel Bilgiler
    title       = models.CharField(max_length=255)
    spec_type   = models.CharField(max_length=20, choices=SpecType.choices, default=SpecType.GENERAL)
    customer    = models.CharField(max_length=255, blank=True)
    contract_no = models.CharField(max_length=100, blank=True)
    revision    = models.CharField(max_length=20, default="Rev.0")
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    scope       = models.TextField(blank=True)
    standards   = models.TextField(blank=True)

    # Şartname bölümleri
    system_requirements = models.TextField(blank=True)
    hardware_specs      = models.TextField(blank=True)
    software_specs      = models.TextField(blank=True)
    communication       = models.TextField(blank=True)
    acceptance_tests    = models.TextField(blank=True)
    documentation_req   = models.TextField(blank=True)
    training_warranty   = models.TextField(blank=True)

    project    = models.ForeignKey(
        "projects.Project", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="specs"
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="specs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Teknik Şartname"
        verbose_name_plural = "Teknik Şartnameler"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class TechnicalDocument(models.Model):
    class Category(models.TextChoices):
        PLC_SCADA = "plc_scada", "PLC/SCADA"
        ROBOT     = "robot",     "Robot Sistemleri"
        MES       = "mes",       "MES"
        VISION    = "vizyon",    "Vizyon Sistemi"
        ELECTRIC  = "elektrik",  "Elektrik Altyapı"
        SERVO     = "servo",     "Servo/Hareket"
        GENERAL   = "genel",     "Genel"

    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category    = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    file        = models.FileField(upload_to="techdocs/%Y/%m/")
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="tech_documents"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Teknik Döküman"
        verbose_name_plural = "Teknik Dökümanlar"
        ordering = ["-uploaded_at"]

    @property
    def file_extension(self) -> str:
        _, ext = os.path.splitext(self.file.name)
        return ext.lower()

    @property
    def file_size_kb(self) -> float:
        try:
            return round(self.file.size / 1024, 1)
        except Exception:
            return 0

    def __str__(self):
        return self.title


class EplanDokuman(models.Model):
    class DokumanTipi(models.TextChoices):
        SEMA          = "sema",          "Elektrik Şeması"
        PANEL_LAYOUT  = "panel_layout",  "Panel Layout"
        KABLO_LISTESI = "kablo_listesi", "Kablo Listesi"
        BOM           = "bom",           "BOM (Malzeme Listesi)"
        AS_BUILT      = "as_built",      "As-Built Şema"
        DIGER         = "diger",         "Diğer"

    class OnayDurumu(models.TextChoices):
        TASLAK           = "taslak",           "Taslak"
        IC_KONTROL       = "ic_kontrol",       "İç Kontrol"
        MUSTERI_INCELEME = "musteri_inceleme", "Müşteri İncelemesinde"
        ONAYLANDI        = "onaylandi",        "Onaylandı"
        AS_BUILT         = "as_built",         "As-Built"
        IPTAL            = "iptal",            "İptal"

    seri_no       = models.CharField(max_length=50)
    baslik        = models.CharField(max_length=255)
    proje         = models.ForeignKey(
        "projects.Project", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="eplan_dokumanlar"
    )
    dokuman_tipi  = models.CharField(max_length=30, choices=DokumanTipi.choices, default=DokumanTipi.SEMA)
    revizyon_no   = models.CharField(max_length=20, default="Rev.0")
    onay_durumu   = models.CharField(max_length=30, choices=OnayDurumu.choices, default=OnayDurumu.TASLAK)
    aciklama      = models.TextField(blank=True)
    notlar        = models.TextField(blank=True)
    dosya         = models.FileField(upload_to="eplan/%Y/%m/", null=True, blank=True)
    yukleyen      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="eplan_dokumanlar"
    )
    onaylayan     = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="eplan_onaylari"
    )
    onay_tarihi       = models.DateField(null=True, blank=True)
    yukleme_tarihi    = models.DateTimeField(auto_now_add=True)
    guncelleme_tarihi = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "E-Plan Döküman"
        verbose_name_plural = "E-Plan Dökümanlar"
        ordering = ["seri_no", "-yukleme_tarihi"]
        unique_together = [["seri_no", "revizyon_no"]]

    @property
    def file_extension(self) -> str:
        if not self.dosya:
            return ""
        _, ext = os.path.splitext(self.dosya.name)
        return ext.lower()

    @property
    def file_size_kb(self) -> float:
        try:
            return round(self.dosya.size / 1024, 1)
        except Exception:
            return 0

    def __str__(self):
        return f"{self.seri_no} {self.baslik} ({self.revizyon_no})"


class PermitType(models.TextChoices):
    YAPI_RUHSATI = "yapi_ruhsati", "Yapı Ruhsatı"
    CEVRE_IZNI = "cevre_izni", "Çevre İzni"
    ISG_BELGESI = "isg_belgesi", "İSG Belgesi"
    BELEDIYE_ONAYI = "belediye_onayi", "Belediye Onayı"
    DIGER = "diger", "Diğer"


class PermitStatus(models.TextChoices):
    ACTIVE = "active", "Aktif"
    EXPIRED = "expired", "Süresi Dolmuş"
    PENDING_RENEWAL = "pending_renewal", "Yenileme Bekliyor"


class LegalPermit(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="permits")
    permit_type = models.CharField(max_length=20, choices=PermitType.choices)
    permit_no = models.CharField(max_length=100)
    issued_by = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=PermitStatus.choices, default=PermitStatus.ACTIVE
    )
    file = models.FileField(upload_to="permits/%Y/", null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Yasal İzin/Ruhsat"
        verbose_name_plural = "Yasal İzinler/Ruhsatlar"
        ordering = ["expiry_date"]

    def __str__(self):
        return f"{self.get_permit_type_display()} — {self.permit_no}"


class SitePhoto(models.Model):
    project     = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="site_photos")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="site_photos")
    photo       = models.ImageField(upload_to="site_photos/%Y/%m/")
    description = models.TextField(blank=True)
    latitude    = models.FloatField(null=True, blank=True)
    longitude   = models.FloatField(null=True, blank=True)
    taken_at    = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-taken_at", "-uploaded_at"]
        verbose_name = "Saha Fotoğrafı"
        verbose_name_plural = "Saha Fotoğrafları"

    def __str__(self):
        return f"{self.project.name} — {self.uploaded_at:%Y-%m-%d}"

import os

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

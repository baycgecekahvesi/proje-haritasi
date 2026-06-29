from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Özel kullanıcı modeli — ileride alan eklemeye hazır."""

    pass


class Role(models.TextChoices):
    ADMIN = "admin", "Admin"
    EDITOR = "editor", "Editör"
    VIEWER = "viewer", "İzleyici"


class MeslekRolu(models.TextChoices):
    ELK   = "ELK",   "Elektrik/Otomasyon Müh."
    PLC   = "PLC",   "PLC Programcısı"
    SCADA = "SCADA", "SCADA Mühendisi"
    SAHA  = "SAHA",  "Saha Teknisyeni"
    PM    = "PM",    "Proje Müdürü"


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.VIEWER
    )
    meslek_rolu = models.CharField(
        max_length=10, choices=MeslekRolu.choices, blank=True, default=""
    )
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Kullanıcı Profili"
        verbose_name_plural = "Kullanıcı Profilleri"

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Bildirim(models.Model):
    alici       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bildirimler")
    baslik      = models.CharField(max_length=200)
    mesaj       = models.TextField(blank=True)
    gorev_id    = models.CharField(max_length=20, blank=True)
    okundu      = models.BooleanField(default=False)
    olusturuldu = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-olusturuldu"]
        verbose_name = "Bildirim"
        verbose_name_plural = "Bildirimler"

    def __str__(self):
        return f"{self.alici.username} — {self.baslik}"


class ContractorProfile(models.Model):
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contractor_profile")
    company_name   = models.CharField(max_length=200)
    tax_number     = models.CharField(max_length=20, blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    phone          = models.CharField(max_length=20, blank=True)
    address        = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Müteahhit Profili"
        verbose_name_plural = "Müteahhit Profilleri"

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"


class ProjectContractor(models.Model):
    project         = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="contractors")
    contractor      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contractor_projects")
    role            = models.CharField(max_length=100, blank=True)
    contract_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    start_date      = models.DateField(null=True, blank=True)
    end_date        = models.DateField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("project", "contractor")]
        verbose_name = "Proje Müteahhiti"
        verbose_name_plural = "Proje Müteahhitleri"

    def __str__(self):
        return f"{self.project.name} — {self.contractor.username}"

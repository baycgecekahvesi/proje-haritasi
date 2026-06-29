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


class DeviceToken(models.Model):
    class DeviceType(models.TextChoices):
        ANDROID = "android", "Android"
        IOS     = "ios",     "iOS"

    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_tokens")
    fcm_token   = models.TextField()
    device_type = models.CharField(max_length=10, choices=DeviceType.choices, default=DeviceType.ANDROID)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cihaz Token"
        verbose_name_plural = "Cihaz Tokenları"

    def __str__(self):
        return f"{self.user.username} — {self.device_type}"

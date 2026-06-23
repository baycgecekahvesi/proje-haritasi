from django.db import models
from apps.accounts.models import User
from apps.projects.models import Project


class Risk(models.Model):
    class Kategori(models.TextChoices):
        TEKNIK   = "teknik",   "Teknik"
        MALI     = "mali",     "Mali"
        ZAMAN    = "zaman",    "Zaman"
        KAYNAK   = "kaynak",   "Kaynak"
        DIS      = "dis",      "Dış Etken"
        GUVENLIK = "guvenlik", "Güvenlik"

    class Durum(models.TextChoices):
        ACIK      = "acik",      "Açık"
        IZLENIYOR = "izleniyor", "İzleniyor"
        AZALTILDI = "azaltildi", "Azaltıldı"
        KAPANDI   = "kapandi",   "Kapandı"
        REALIZE   = "realize",   "Gerçekleşti"

    proje         = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="riskler")
    baslik        = models.CharField(max_length=255)
    aciklama      = models.TextField(blank=True)
    kategori      = models.CharField(max_length=20, choices=Kategori.choices, default=Kategori.TEKNIK)
    olasilik      = models.PositiveSmallIntegerField(default=3, help_text="1=Çok Düşük … 5=Çok Yüksek")
    etki          = models.PositiveSmallIntegerField(default=3, help_text="1=Önemsiz … 5=Kritik")
    mitigasyon    = models.TextField(blank=True, help_text="Azaltma / önlem planı")
    sorumlu       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="riskler")
    hedef_tarih   = models.DateField(null=True, blank=True)
    durum         = models.CharField(max_length=20, choices=Durum.choices, default=Durum.ACIK)
    olusturuldu   = models.DateTimeField(auto_now_add=True)
    guncellendi   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Risk"
        verbose_name_plural = "Riskler"
        ordering = ["-olasilik", "-etki"]

    @property
    def skor(self) -> int:
        return self.olasilik * self.etki

    @property
    def seviye(self) -> str:
        s = self.skor
        if s >= 15: return "kritik"
        if s >= 10: return "yuksek"
        if s >= 5:  return "orta"
        return "dusuk"

    def __str__(self):
        return f"[{self.proje}] {self.baslik} ({self.skor})"

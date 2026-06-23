from django.db import models
from apps.accounts.models import User
from apps.projects.models import Project


class PunchItem(models.Model):
    class Tur(models.TextChoices):
        FAT = "fat", "FAT (Fabrika Kabul Testi)"
        SAT = "sat", "SAT (Saha Kabul Testi)"
        KOMISYON = "komisyon", "Devreye Alma"
        DIGER = "diger", "Diğer"

    class Kategori(models.TextChoices):
        ELEKTRIK    = "elektrik",    "Elektrik"
        OTOMASYON   = "otomasyon",   "Otomasyon / PLC"
        MEKANIK     = "mekanik",     "Mekanik"
        DOKUMAN     = "dokuman",     "Döküman"
        GUVENLIK    = "guvenlik",    "Güvenlik / SIL"
        YAZILIM     = "yazilim",     "Yazılım / SCADA"
        DIGER       = "diger",       "Diğer"

    class Oncelik(models.TextChoices):
        A = "A", "A — Kritik (İşi Engelliyor)"
        B = "B", "B — Önemli (Yakında Çözülmeli)"
        C = "C", "C — İstenen (Fırsat Bulununca)"

    class Durum(models.TextChoices):
        ACIK     = "acik",     "Açık"
        DEVAM    = "devam",    "Devam Ediyor"
        KAPANDI  = "kapandi",  "Kapandı"
        IPTAL    = "iptal",    "İptal"

    proje        = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="punch_items")
    tur          = models.CharField(max_length=20, choices=Tur.choices, default=Tur.FAT)
    no           = models.CharField(max_length=20, blank=True, help_text="FAT-001 vb. otomatik atanır")
    baslik       = models.CharField(max_length=300)
    aciklama     = models.TextField(blank=True)
    kategori     = models.CharField(max_length=20, choices=Kategori.choices, default=Kategori.DIGER)
    oncelik      = models.CharField(max_length=2, choices=Oncelik.choices, default=Oncelik.B)
    durum        = models.CharField(max_length=20, choices=Durum.choices, default=Durum.ACIK)
    sorumlu      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="punch_items")
    hedef_tarih  = models.DateField(null=True, blank=True)
    kapanma_tarihi = models.DateField(null=True, blank=True)
    kapatma_notu = models.TextField(blank=True)
    tespit_tarihi = models.DateField(null=True, blank=True, help_text="Test sırasında tespit tarihi")
    olusturuldu  = models.DateTimeField(auto_now_add=True)
    guncellendi  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Punch Item"
        verbose_name_plural = "Punch List"
        ordering = ["oncelik", "tur", "no"]

    def save(self, *args, **kwargs):
        if not self.no:
            prefix = self.tur.upper()
            son = (PunchItem.objects.filter(proje=self.proje, tur=self.tur).count() + 1)
            self.no = f"{prefix}-{son:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.proje}] {self.no} — {self.baslik}"

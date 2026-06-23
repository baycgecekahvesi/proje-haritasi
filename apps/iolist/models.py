from django.db import models
from apps.projects.models import Project


class IOPoint(models.Model):
    class SinyalTipi(models.TextChoices):
        DI  = "DI",  "DI — Dijital Giriş"
        DO  = "DO",  "DO — Dijital Çıkış"
        AI  = "AI",  "AI — Analog Giriş"
        AO  = "AO",  "AO — Analog Çıkış"
        RTD = "RTD", "RTD — Sıcaklık (PT100)"
        TC  = "TC",  "TC — Termokupul"
        PI  = "PI",  "PI — Puls Giriş"
        COM = "COM", "COM — İletişim"

    class Durum(models.TextChoices):
        TASLAK   = "taslak",   "Taslak"
        ONAYLANDI = "onaylandi","Onaylandı"
        REVIZE   = "revize",   "Revize"
        IPTAL    = "iptal",    "İptal"

    class KabloDurum(models.TextChoices):
        BEKLIYOR    = "bekliyor",   "Bekliyor"
        CEKILDI     = "cekildi",    "Çekildi"
        BAGLANDI    = "baglandi",   "Bağlandı"
        TEST_OK     = "test_ok",    "Test OK"
        TEST_HATA   = "test_hata",  "Test Hatası"

    proje        = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="io_points")
    tag_no       = models.CharField(max_length=50, help_text="FIC-101, LSH-201 vb.")
    tanim        = models.CharField(max_length=255, help_text="Etiket açıklaması")
    sinyal_tipi  = models.CharField(max_length=10, choices=SinyalTipi.choices)
    proses_deger = models.CharField(max_length=100, blank=True, help_text="4-20mA, 0-10V, NC/NO vb.")
    plc_rack     = models.CharField(max_length=20, blank=True, help_text="Rack numarası")
    plc_slot     = models.CharField(max_length=20, blank=True, help_text="Slot numarası")
    plc_kanal    = models.CharField(max_length=20, blank=True, help_text="Kanal numarası")
    panel_no     = models.CharField(max_length=30, blank=True, help_text="Panel/MCC numarası")
    klemens_no   = models.CharField(max_length=30, blank=True)
    kablo_no     = models.CharField(max_length=50, blank=True)
    alan_cihaz   = models.CharField(max_length=150, blank=True, help_text="Saha enstrümanı/cihaz")
    sil_seviye   = models.CharField(max_length=10, blank=True, help_text="SIL 1/2/3 veya boş")
    notlar       = models.TextField(blank=True)
    durum        = models.CharField(max_length=20, choices=Durum.choices, default=Durum.TASLAK)
    kablo_durum  = models.CharField(max_length=20, choices=KabloDurum.choices, default=KabloDurum.BEKLIYOR)
    olusturuldu  = models.DateTimeField(auto_now_add=True)
    guncellendi  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "I/O Noktası"
        verbose_name_plural = "I/O Listesi"
        ordering = ["sinyal_tipi", "tag_no"]
        unique_together = [["proje", "tag_no"]]

    def __str__(self):
        return f"[{self.proje}] {self.tag_no} ({self.sinyal_tipi})"

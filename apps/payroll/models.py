from django.conf import settings
from django.db import models


class TimesheetStatus(models.TextChoices):
    DRAFT     = "draft",     "Taslak"
    SUBMITTED = "submitted", "Gönderildi"
    APPROVED  = "approved",  "Onaylandı"
    REJECTED  = "rejected",  "Reddedildi"


class PaymentStatus(models.TextChoices):
    DRAFT     = "draft",     "Taslak"
    SUBMITTED = "submitted", "Gönderildi"
    APPROVED  = "approved",  "Onaylandı"
    REJECTED  = "rejected",  "Reddedildi"


class Timesheet(models.Model):
    project          = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="timesheets"
    )
    resource         = models.ForeignKey(
        "resources.Resource",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="timesheets",
    )
    user             = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="timesheets"
    )
    work_date        = models.DateField()
    hours_worked     = models.DecimalField(max_digits=5, decimal_places=2, default=8)
    work_description = models.TextField(blank=True)
    approved_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_timesheets",
    )
    status           = models.CharField(
        max_length=20, choices=TimesheetStatus.choices, default=TimesheetStatus.DRAFT
    )
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-work_date"]
        verbose_name = "Puantaj"
        verbose_name_plural = "Puantajlar"

    def __str__(self):
        return f"{self.user.username} — {self.project.name} — {self.work_date}"


class ProgressPayment(models.Model):
    project         = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="payments"
    )
    period_start    = models.DateField()
    period_end      = models.DateField()
    planned_amount  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    actual_amount   = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    approved_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    description     = models.TextField(blank=True)
    status          = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.DRAFT
    )
    approved_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_payments",
    )
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-period_end"]
        verbose_name = "Hakediş"
        verbose_name_plural = "Hakedişler"

    def __str__(self):
        return f"{self.project.name} — {self.period_start} / {self.period_end}"


class MetrajSatiri(models.Model):
    progress_payment = models.ForeignKey(
        ProgressPayment, on_delete=models.CASCADE, related_name="metraj_satirlari"
    )
    poz_no = models.CharField(max_length=50)
    tanim = models.CharField(max_length=255)
    birim = models.CharField(max_length=20)
    sozlesme_miktari = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    gerceklesen_miktar = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    birim_fiyat = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    @property
    def tutar(self):
        return self.gerceklesen_miktar * self.birim_fiyat

    class Meta:
        verbose_name = "Metraj Satırı"
        verbose_name_plural = "Metraj Satırları"
        ordering = ["poz_no"]

    def __str__(self):
        return f"{self.poz_no} — {self.tanim}"


class FiyatFarki(models.Model):
    progress_payment = models.ForeignKey(
        ProgressPayment, on_delete=models.CASCADE, related_name="fiyat_farklari"
    )
    endeks_turu = models.CharField(max_length=100)
    baslangic_endeksi = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    bitis_endeksi = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    fark_tutari = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    @property
    def katsayi(self):
        if self.baslangic_endeksi == 0:
            return 0
        return round(float(self.bitis_endeksi) / float(self.baslangic_endeksi), 4)

    class Meta:
        verbose_name = "Fiyat Farkı"
        verbose_name_plural = "Fiyat Farkları"

    def __str__(self):
        return f"{self.endeks_turu} — {self.fark_tutari}"

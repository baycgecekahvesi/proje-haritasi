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

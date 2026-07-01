from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class HoldPointType(models.TextChoices):
    H = "H", "Hold"
    W = "W", "Witness"
    R = "R", "Review"


class InspectionStatus(models.TextChoices):
    PENDING = "pending", "Bekliyor"
    PASSED = "passed", "Geçti"
    FAILED = "failed", "Kaldı"
    WAIVED = "waived", "Muaf"


class NCRStatus(models.TextChoices):
    OPEN = "open", "Açık"
    IN_PROGRESS = "in_progress", "İşlemde"
    CLOSED = "closed", "Kapalı"
    ACCEPTED = "accepted", "Kabul Edildi"


class NCRSeverity(models.TextChoices):
    MINOR = "minor", "Minör"
    MAJOR = "major", "Majör"
    CRITICAL = "critical", "Kritik"


class InspectionPlan(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="inspection_plans"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Muayene Planı"
        verbose_name_plural = "Muayene Planları"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class InspectionItem(models.Model):
    plan = models.ForeignKey(
        InspectionPlan, on_delete=models.CASCADE, related_name="items"
    )
    activity_name = models.CharField(max_length=255)
    hold_point_type = models.CharField(
        max_length=1, choices=HoldPointType.choices, default=HoldPointType.W
    )
    responsible_party = models.CharField(max_length=255, blank=True)
    standard_ref = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20, choices=InspectionStatus.choices, default=InspectionStatus.PENDING
    )
    inspected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inspections",
    )
    inspection_date = models.DateField(null=True, blank=True)
    result_notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Muayene Kalemi"
        verbose_name_plural = "Muayene Kalemleri"
        ordering = ["activity_name"]

    def __str__(self):
        return self.activity_name


class NCR(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="ncrs"
    )
    inspection_item = models.ForeignKey(
        InspectionItem, on_delete=models.SET_NULL, null=True, blank=True
    )
    ncr_no = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(
        max_length=10, choices=NCRSeverity.choices, default=NCRSeverity.MINOR
    )
    raised_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="raised_ncrs"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_ncrs",
    )
    status = models.CharField(
        max_length=20, choices=NCRStatus.choices, default=NCRStatus.OPEN
    )
    action_plan = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Uygunsuzluk Raporu"
        verbose_name_plural = "Uygunsuzluk Raporları"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ncr_no} — {self.title}"

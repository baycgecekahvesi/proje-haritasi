from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class AccidentSeverity(models.TextChoices):
    NEAR_MISS = "near_miss", "Ramak Kala"
    MINOR = "minor", "Hafif"
    MAJOR = "major", "Ağır"
    FATAL = "fatal", "Ölümlü"


class HSEInspectionStatus(models.TextChoices):
    OPEN = "open", "Açık"
    CLOSED = "closed", "Kapalı"


class WorkerEntry(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="worker_entries"
    )
    date = models.DateField()
    worker_count = models.PositiveIntegerField(default=0)
    subcontractor_name = models.CharField(max_length=255, blank=True)
    registered_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="worker_entries"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "İşçi Giriş Kaydı"
        verbose_name_plural = "İşçi Giriş Kayıtları"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.project.name} — {self.date} — {self.worker_count} işçi"


class WorkAccident(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="accidents"
    )
    accident_date = models.DateField()
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=AccidentSeverity.choices,
        default=AccidentSeverity.NEAR_MISS,
    )
    injured_person = models.CharField(max_length=255, blank=True)
    action_taken = models.TextField(blank=True)
    reported_to_sgk = models.BooleanField(default=False)
    sgk_report_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reported_accidents"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "İş Kazası"
        verbose_name_plural = "İş Kazaları"
        ordering = ["-accident_date"]

    def __str__(self):
        return f"{self.project.name} — {self.accident_date} — {self.get_severity_display()}"


class HSEInspection(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="hse_inspections"
    )
    inspection_date = models.DateField()
    inspector = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="hse_inspections"
    )
    findings = models.TextField()
    action_required = models.TextField(blank=True)
    next_inspection_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=HSEInspectionStatus.choices,
        default=HSEInspectionStatus.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "İSG Denetimi"
        verbose_name_plural = "İSG Denetimleri"
        ordering = ["-inspection_date"]

    def __str__(self):
        return f"{self.project.name} — {self.inspection_date}"

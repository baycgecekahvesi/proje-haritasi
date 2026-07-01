from django.db import models

from apps.projects.models import Project


class InfluenceLevel(models.TextChoices):
    LOW = "low", "Düşük"
    MEDIUM = "medium", "Orta"
    HIGH = "high", "Yüksek"


class CommunicationFrequency(models.TextChoices):
    DAILY = "daily", "Günlük"
    WEEKLY = "weekly", "Haftalık"
    MONTHLY = "monthly", "Aylık"
    AS_NEEDED = "as_needed", "Gerektiğinde"


class Stakeholder(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="stakeholders"
    )
    name = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    influence_level = models.CharField(
        max_length=10,
        choices=InfluenceLevel.choices,
        default=InfluenceLevel.MEDIUM,
    )
    interest_level = models.CharField(
        max_length=10,
        choices=InfluenceLevel.choices,
        default=InfluenceLevel.MEDIUM,
    )
    communication_frequency = models.CharField(
        max_length=20,
        choices=CommunicationFrequency.choices,
        default=CommunicationFrequency.WEEKLY,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Paydaş"
        verbose_name_plural = "Paydaşlar"
        ordering = ["-influence_level", "name"]

    def __str__(self):
        return f"{self.name} ({self.organization})"

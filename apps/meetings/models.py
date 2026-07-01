from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class MeetingType(models.TextChoices):
    KICKOFF = "kickoff", "Açılış Toplantısı"
    WEEKLY = "weekly", "Haftalık"
    MONTHLY = "monthly", "Aylık"
    DESIGN_REVIEW = "design_review", "Tasarım İnceleme"
    SITE = "site", "Saha Toplantısı"
    OTHER = "other", "Diğer"


class ActionItemStatus(models.TextChoices):
    OPEN = "open", "Açık"
    IN_PROGRESS = "in_progress", "Devam Ediyor"
    COMPLETED = "completed", "Tamamlandı"
    CANCELLED = "cancelled", "İptal"


class Meeting(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="meetings"
    )
    title = models.CharField(max_length=255)
    type = models.CharField(
        max_length=20, choices=MeetingType.choices, default=MeetingType.WEEKLY
    )
    meeting_date = models.DateField()
    location = models.CharField(max_length=255, blank=True)
    participants = models.ManyToManyField(User, blank=True, related_name="meetings")
    minutes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_meetings"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Toplantı"
        verbose_name_plural = "Toplantılar"
        ordering = ["-meeting_date"]

    def __str__(self):
        return f"{self.title} — {self.meeting_date}"


class ActionItem(models.Model):
    meeting = models.ForeignKey(
        Meeting, on_delete=models.CASCADE, related_name="action_items"
    )
    description = models.TextField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="action_items"
    )
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=ActionItemStatus.choices,
        default=ActionItemStatus.OPEN,
    )
    completed_at = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Aksiyon Kalemi"
        verbose_name_plural = "Aksiyon Kalemleri"
        ordering = ["due_date"]

    def __str__(self):
        return self.description[:60]

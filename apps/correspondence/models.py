from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class CorrespondenceType(models.TextChoices):
    RFI = "RFI", "Teknik Talep (RFI)"
    DCN = "DCN", "Tasarım Değişik. (DCN)"
    LETTER = "letter", "Resmi Yazı"
    MEMO = "memo", "İç Yazışma"
    TRANSMITTAL = "transmittal", "Transmittal"


class CorrespondenceStatus(models.TextChoices):
    OPEN = "open", "Açık"
    RESPONDED = "responded", "Yanıtlandı"
    CLOSED = "closed", "Kapalı"
    OVERDUE = "overdue", "Gecikmiş"


class Correspondence(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="correspondences"
    )
    ref_no = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=CorrespondenceType.choices)
    subject = models.CharField(max_length=255)
    from_party = models.CharField(max_length=255)
    to_party = models.CharField(max_length=255)
    sent_at = models.DateField()
    response_due = models.DateField(null=True, blank=True)
    responded_at = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=CorrespondenceStatus.choices,
        default=CorrespondenceStatus.OPEN,
    )
    content = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        from datetime import date
        if (
            self.response_due
            and not self.responded_at
            and self.response_due < date.today()
        ):
            self.status = CorrespondenceStatus.OVERDUE
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Yazışma"
        verbose_name_plural = "Yazışmalar"
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.ref_no} — {self.subject}"

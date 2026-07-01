from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class ChangeOrderReason(models.TextChoices):
    SCOPE = "scope", "Kapsam Değişikliği"
    DESIGN = "design", "Tasarım Değişikliği"
    CLIENT_REQUEST = "client_request", "Müşteri Talebi"
    UNFORESEEN = "unforeseen", "Öngörülemeyen Durum"
    OTHER = "other", "Diğer"


class ChangeOrderStatus(models.TextChoices):
    DRAFT = "draft", "Taslak"
    SUBMITTED = "submitted", "Gönderildi"
    APPROVED = "approved", "Onaylandı"
    REJECTED = "rejected", "Reddedildi"


class ChangeOrder(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="change_orders"
    )
    co_number = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    reason = models.CharField(
        max_length=20, choices=ChangeOrderReason.choices, default=ChangeOrderReason.OTHER
    )
    cost_impact = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    schedule_impact_days = models.IntegerField(default=0)
    requested_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="requested_cos"
    )
    status = models.CharField(
        max_length=20, choices=ChangeOrderStatus.choices, default=ChangeOrderStatus.DRAFT
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_cos",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Değişiklik Emri"
        verbose_name_plural = "Değişiklik Emirleri"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.co_number} — {self.title}"

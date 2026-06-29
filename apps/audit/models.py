from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = "CREATE", "Oluşturuldu"
        UPDATE = "UPDATE", "Güncellendi"
        DELETE = "DELETE", "Silindi"
        LOGIN  = "LOGIN",  "Giriş"
        LOGOUT = "LOGOUT", "Çıkış"

    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action      = models.CharField(max_length=10, choices=Action.choices)
    model_name  = models.CharField(max_length=100, blank=True)
    object_id   = models.CharField(max_length=50, blank=True)
    object_repr = models.CharField(max_length=200, blank=True)
    old_value   = models.JSONField(null=True, blank=True)
    new_value   = models.JSONField(null=True, blank=True)
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Loglar"

    def __str__(self):
        return f"{self.user} — {self.action} {self.model_name} #{self.object_id}"

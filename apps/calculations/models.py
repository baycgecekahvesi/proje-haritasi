from django.db import models
from django.conf import settings


class SavedCalculation(models.Model):
    """Kullanıcının kaydettiği hesaplama geçmişi."""
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="calculations")
    project    = models.ForeignKey("projects.Project", on_delete=models.SET_NULL, null=True, blank=True, related_name="calculations")
    category   = models.CharField(max_length=50)   # "electric" / "electronic" / "automation"
    calc_type  = models.CharField(max_length=100)   # "cable_section" / "motor_current" vb.
    title      = models.CharField(max_length=200)
    inputs     = models.JSONField()
    result     = models.JSONField()
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Hesaplama"
        verbose_name_plural = "Hesaplamalar"

    def __str__(self):
        return f"{self.title} ({self.created_at:%Y-%m-%d})"

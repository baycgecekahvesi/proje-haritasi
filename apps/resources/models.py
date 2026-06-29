from django.db import models


class ResourceType(models.TextChoices):
    PERSONNEL = "PERSONNEL", "Personel"
    EQUIPMENT = "EQUIPMENT", "Ekipman"
    MATERIAL  = "MATERIAL",  "Malzeme"


class Resource(models.Model):
    name             = models.CharField(max_length=200)
    resource_type    = models.CharField(max_length=20, choices=ResourceType.choices)
    unit             = models.CharField(max_length=50, default="adet")  # saat, kg, m, adet...
    capacity_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=8)
    cost_per_unit    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active        = models.BooleanField(default=True)
    notes            = models.TextField(blank=True)

    class Meta:
        ordering = ["resource_type", "name"]
        verbose_name = "Kaynak"
        verbose_name_plural = "Kaynaklar"

    def __str__(self):
        return f"{self.name} ({self.get_resource_type_display()})"


class TaskResource(models.Model):
    """Göreve atanan kaynak."""
    task              = models.ForeignKey(
        "projects.Task", on_delete=models.CASCADE, related_name="resources"
    )
    resource          = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="task_assignments"
    )
    planned_quantity  = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    actual_quantity   = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    unit_cost         = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = [("task", "resource")]
        verbose_name = "Görev Kaynağı"
        verbose_name_plural = "Görev Kaynakları"

    @property
    def planned_cost(self):
        return self.planned_quantity * self.unit_cost

    @property
    def actual_cost(self):
        if self.actual_quantity is None:
            return None
        return self.actual_quantity * self.unit_cost

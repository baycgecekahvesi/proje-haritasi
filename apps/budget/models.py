from decimal import Decimal

from django.db import models

from apps.projects.models import Project


class Currency(models.TextChoices):
    TRY = "TRY", "Türk Lirası (₺)"
    USD = "USD", "Dolar ($)"
    EUR = "EUR", "Euro (€)"


class Budget(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name="budget"
    )
    planned_amount = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.TRY
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bütçe"
        verbose_name_plural = "Bütçeler"

    def __str__(self):
        return f"{self.project.name} bütçesi"

    @property
    def total_spent(self) -> Decimal:
        return self.expenses.aggregate(total=models.Sum("amount"))["total"] or Decimal("0")

    @property
    def remaining(self) -> Decimal:
        return self.planned_amount - self.total_spent

    @property
    def usage_percent(self) -> float:
        if self.planned_amount == 0:
            return 0
        return round(float(self.total_spent) / float(self.planned_amount) * 100, 1)

    @property
    def is_over_budget(self) -> bool:
        return self.total_spent > self.planned_amount


class Expense(models.Model):
    class ExpenseType(models.TextChoices):
        LABOR = "labor", "İşçilik"
        MATERIAL = "material", "Malzeme"
        EQUIPMENT = "equipment", "Ekipman"
        SERVICE = "service", "Hizmet"
        OTHER = "other", "Diğer"

    budget = models.ForeignKey(
        Budget, on_delete=models.CASCADE, related_name="expenses"
    )
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_type = models.CharField(
        max_length=20, choices=ExpenseType.choices, default=ExpenseType.OTHER
    )
    date = models.DateField()
    invoice_no = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Harcama"
        verbose_name_plural = "Harcamalar"
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.description} — {self.amount}"

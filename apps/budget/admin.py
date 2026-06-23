from django.contrib import admin

from .models import Budget, Expense


class ExpenseInline(admin.TabularInline):
    model = Expense
    extra = 0
    fields = ("description", "amount", "expense_type", "date", "invoice_no")


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = (
        "project", "planned_amount", "currency",
        "total_spent", "remaining", "usage_percent", "is_over_budget",
    )
    search_fields = ("project__name",)
    autocomplete_fields = ("project",)
    inlines = [ExpenseInline]
    readonly_fields = ("total_spent", "remaining", "usage_percent", "is_over_budget")

    @admin.display(boolean=True, description="Bütçe Aşımı")
    def is_over_budget(self, obj):
        return obj.is_over_budget


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("description", "budget", "amount", "expense_type", "date", "invoice_no")
    list_filter = ("expense_type", "date")
    search_fields = ("description", "invoice_no")

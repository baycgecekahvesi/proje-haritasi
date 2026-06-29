from django.contrib import admin
from .models import SavedCalculation


@admin.register(SavedCalculation)
class SavedCalculationAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "calc_type", "user", "project", "created_at"]
    list_filter = ["category", "calc_type"]
    search_fields = ["title", "user__username"]

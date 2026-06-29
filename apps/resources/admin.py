from django.contrib import admin
from .models import Resource, TaskResource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display  = ["name", "resource_type", "unit", "capacity_per_day", "cost_per_unit", "is_active"]
    list_filter   = ["resource_type", "is_active"]
    search_fields = ["name"]


@admin.register(TaskResource)
class TaskResourceAdmin(admin.ModelAdmin):
    list_display = ["task", "resource", "planned_quantity", "actual_quantity", "unit_cost"]
    list_filter  = ["resource__resource_type"]

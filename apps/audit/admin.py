from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        "created_at",
        "user",
        "action",
        "model_name",
        "object_id",
        "object_repr",
        "ip_address",
    ]
    list_filter  = ["action", "model_name"]
    search_fields = ["user__username", "model_name", "object_repr"]
    readonly_fields = [
        "user",
        "action",
        "model_name",
        "object_id",
        "object_repr",
        "old_value",
        "new_value",
        "ip_address",
        "created_at",
    ]

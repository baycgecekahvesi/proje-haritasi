from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title", "project", "doc_type", "file_size_kb",
        "uploaded_by", "uploaded_at",
    )
    list_filter = ("doc_type", "uploaded_at")
    search_fields = ("title", "project__name")
    autocomplete_fields = ("project", "uploaded_by")
    readonly_fields = ("uploaded_at", "file_extension", "file_size_kb")

from django.contrib import admin

from .models import Document, EplanDokuman


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


@admin.register(EplanDokuman)
class EplanDokumanAdmin(admin.ModelAdmin):
    list_display = (
        "seri_no", "baslik", "dokuman_tipi", "revizyon_no",
        "onay_durumu", "proje", "yukleyen", "yukleme_tarihi",
    )
    list_filter = ("dokuman_tipi", "onay_durumu", "yukleme_tarihi")
    search_fields = ("seri_no", "baslik", "proje__name")
    readonly_fields = ("yukleme_tarihi", "guncelleme_tarihi", "file_extension", "file_size_kb")

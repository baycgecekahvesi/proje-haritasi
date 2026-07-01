from django.contrib import admin

from .models import Document, EplanDokuman, LegalPermit, SitePhoto


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


@admin.register(SitePhoto)
class SitePhotoAdmin(admin.ModelAdmin):
    list_display = ["project", "uploaded_by", "taken_at", "latitude", "longitude"]
    list_filter = ("taken_at", "uploaded_at")
    search_fields = ("project__name", "uploaded_by__username", "description")
    readonly_fields = ("uploaded_at",)


@admin.register(LegalPermit)
class LegalPermitAdmin(admin.ModelAdmin):
    list_display = ("permit_no", "project", "permit_type", "issued_by", "issue_date", "expiry_date", "status")
    list_filter = ("permit_type", "status")
    search_fields = ("permit_no", "project__name", "issued_by")
    readonly_fields = ("created_at",)

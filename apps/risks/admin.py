from django.contrib import admin
from .models import Risk


@admin.register(Risk)
class RiskAdmin(admin.ModelAdmin):
    list_display = ("baslik", "proje", "kategori", "olasilik", "etki", "skor", "seviye", "durum", "sorumlu")
    list_filter = ("kategori", "durum", "olusturuldu")
    search_fields = ("baslik", "proje__name")
    readonly_fields = ("olusturuldu", "guncellendi", "skor", "seviye")

    @admin.display(description="Skor")
    def skor(self, obj): return obj.skor

    @admin.display(description="Seviye")
    def seviye(self, obj): return obj.seviye

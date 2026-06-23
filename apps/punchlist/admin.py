from django.contrib import admin
from .models import PunchItem


@admin.register(PunchItem)
class PunchItemAdmin(admin.ModelAdmin):
    list_display = ("no", "baslik", "proje", "tur", "kategori", "oncelik", "durum", "sorumlu", "hedef_tarih")
    list_filter = ("tur", "oncelik", "durum", "kategori")
    search_fields = ("no", "baslik", "proje__name")
    readonly_fields = ("no", "olusturuldu", "guncellendi")

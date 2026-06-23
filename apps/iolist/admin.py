from django.contrib import admin
from .models import IOPoint


@admin.register(IOPoint)
class IOPointAdmin(admin.ModelAdmin):
    list_display = ("tag_no", "tanim", "proje", "sinyal_tipi", "plc_rack", "plc_slot", "plc_kanal", "durum", "kablo_durum")
    list_filter  = ("sinyal_tipi", "durum", "kablo_durum")
    search_fields = ("tag_no", "tanim", "alan_cihaz", "proje__name")
    readonly_fields = ("olusturuldu", "guncellendi")

from django.contrib import admin

from .models import FiyatFarki, MetrajSatiri, ProgressPayment, Timesheet


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ["work_date", "user", "project", "hours_worked", "status"]
    list_filter  = ["status", "work_date"]


@admin.register(ProgressPayment)
class ProgressPaymentAdmin(admin.ModelAdmin):
    list_display = ["project", "period_start", "period_end", "actual_amount", "status"]
    list_filter  = ["status"]


@admin.register(MetrajSatiri)
class MetrajSatiriAdmin(admin.ModelAdmin):
    list_display = ["poz_no", "tanim", "birim", "gerceklesen_miktar", "birim_fiyat"]


@admin.register(FiyatFarki)
class FiyatFarkiAdmin(admin.ModelAdmin):
    list_display = ["endeks_turu", "baslangic_endeksi", "bitis_endeksi", "fark_tutari"]

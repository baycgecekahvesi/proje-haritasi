from django.contrib import admin

from .models import ProgressPayment, Timesheet


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ["work_date", "user", "project", "hours_worked", "status"]
    list_filter  = ["status", "work_date"]


@admin.register(ProgressPayment)
class ProgressPaymentAdmin(admin.ModelAdmin):
    list_display = ["project", "period_start", "period_end", "actual_amount", "status"]
    list_filter  = ["status"]

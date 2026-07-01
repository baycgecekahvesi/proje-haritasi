from django.contrib import admin

from .models import WorkerEntry, WorkAccident, HSEInspection

admin.site.register(WorkerEntry)
admin.site.register(WorkAccident)
admin.site.register(HSEInspection)

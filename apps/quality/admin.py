from django.contrib import admin

from .models import InspectionPlan, InspectionItem, NCR

admin.site.register(InspectionPlan)
admin.site.register(InspectionItem)
admin.site.register(NCR)

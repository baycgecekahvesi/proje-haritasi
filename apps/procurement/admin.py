from django.contrib import admin

from .models import PurchaseRequest, PurchaseOrder, MaterialDelivery

admin.site.register(PurchaseRequest)
admin.site.register(PurchaseOrder)
admin.site.register(MaterialDelivery)

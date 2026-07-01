from django.db import models

from apps.projects.models import Project
from apps.accounts.models import User


class PurchaseRequestStatus(models.TextChoices):
    DRAFT = "draft", "Taslak"
    APPROVED = "approved", "Onaylandı"
    ORDERED = "ordered", "Sipariş Verildi"
    DELIVERED = "delivered", "Teslim Alındı"
    CANCELLED = "cancelled", "İptal"


class PurchaseOrderStatus(models.TextChoices):
    PENDING = "pending", "Bekliyor"
    PARTIAL = "partial", "Kısmi Teslim"
    DELIVERED = "delivered", "Teslim Edildi"
    CANCELLED = "cancelled", "İptal"


class DeliveryInspectionStatus(models.TextChoices):
    PENDING = "pending", "Bekliyor"
    PASSED = "passed", "Kabul"
    REJECTED = "rejected", "Red"


class PurchaseRequest(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="purchase_requests"
    )
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit = models.CharField(max_length=50, default="adet")
    required_date = models.DateField(null=True, blank=True)
    requested_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="purchase_requests"
    )
    status = models.CharField(
        max_length=20,
        choices=PurchaseRequestStatus.choices,
        default=PurchaseRequestStatus.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Satın Alma Talebi"
        verbose_name_plural = "Satın Alma Talepleri"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.item_name} ({self.project.name})"


class PurchaseOrder(models.Model):
    request = models.ForeignKey(
        PurchaseRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    po_number = models.CharField(max_length=50)
    supplier_name = models.CharField(max_length=255)
    supplier_contact = models.CharField(max_length=255, blank=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="TRY")
    order_date = models.DateField()
    expected_delivery = models.DateField()
    actual_delivery = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PurchaseOrderStatus.choices,
        default=PurchaseOrderStatus.PENDING,
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Satın Alma Siparişi"
        verbose_name_plural = "Satın Alma Siparişleri"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.po_number} — {self.supplier_name}"


class MaterialDelivery(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="deliveries"
    )
    delivery_date = models.DateField()
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    inspection_status = models.CharField(
        max_length=20,
        choices=DeliveryInspectionStatus.choices,
        default=DeliveryInspectionStatus.PENDING,
    )
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="deliveries"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Malzeme Teslimi"
        verbose_name_plural = "Malzeme Teslimleri"
        ordering = ["-delivery_date"]

    def __str__(self):
        return f"{self.purchase_order.po_number} — {self.delivery_date}"

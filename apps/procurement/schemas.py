from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


# ── PurchaseRequest ───────────────────────────────────────────────────────────

class PurchaseRequestIn(Schema):
    project_id: int
    item_name: str
    description: str = ""
    quantity: Decimal = Decimal("1")
    unit: str = "adet"
    required_date: Optional[date] = None


class PurchaseRequestPatch(Schema):
    item_name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    required_date: Optional[date] = None
    status: Optional[str] = None


class PurchaseRequestOut(Schema):
    id: int
    project_id: int
    project_name: str
    item_name: str
    description: str
    quantity: Decimal
    unit: str
    required_date: Optional[date] = None
    requested_by_username: str
    status: str
    status_display: str
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_requested_by_username(obj) -> str:
        return obj.requested_by.username

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()


# ── PurchaseOrder ─────────────────────────────────────────────────────────────

class PurchaseOrderIn(Schema):
    project_id: int
    request_id: Optional[int] = None
    po_number: str
    supplier_name: str
    supplier_contact: str = ""
    total_amount: Decimal = Decimal("0")
    currency: str = "TRY"
    order_date: date
    expected_delivery: date
    notes: str = ""


class PurchaseOrderPatch(Schema):
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PurchaseOrderOut(Schema):
    id: int
    project_id: int
    project_name: str
    request_id: Optional[int] = None
    po_number: str
    supplier_name: str
    supplier_contact: str
    total_amount: Decimal
    currency: str
    order_date: date
    expected_delivery: date
    actual_delivery: Optional[date] = None
    status: str
    status_display: str
    notes: str
    created_by_username: Optional[str] = None
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_created_by_username(obj) -> Optional[str]:
        return obj.created_by.username if obj.created_by else None


# ── MaterialDelivery ──────────────────────────────────────────────────────────

class MaterialDeliveryIn(Schema):
    delivery_date: date
    quantity_received: Decimal = Decimal("0")
    inspection_status: str = "pending"
    notes: str = ""


class MaterialDeliveryOut(Schema):
    id: int
    purchase_order_id: int
    delivery_date: date
    quantity_received: Decimal
    inspection_status: str
    inspection_status_display: str
    notes: str
    received_by_username: str
    created_at: datetime

    @staticmethod
    def resolve_inspection_status_display(obj) -> str:
        return obj.get_inspection_status_display()

    @staticmethod
    def resolve_received_by_username(obj) -> str:
        return obj.received_by.username

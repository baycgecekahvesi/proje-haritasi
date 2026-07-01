from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import MaterialDelivery, PurchaseOrder, PurchaseRequest
from .schemas import (
    MaterialDeliveryIn,
    MaterialDeliveryOut,
    PurchaseOrderIn,
    PurchaseOrderOut,
    PurchaseOrderPatch,
    PurchaseRequestIn,
    PurchaseRequestOut,
    PurchaseRequestPatch,
)

router = Router()


# ── PurchaseRequest ───────────────────────────────────────────────────────────

@router.get("/requests", response=list[PurchaseRequestOut])
def list_requests(request, project_id: Optional[int] = None):
    qs = PurchaseRequest.objects.select_related("project", "requested_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/requests", response={200: PurchaseRequestOut})
@require_role("admin", "editor")
def create_request(request, payload: PurchaseRequestIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    pr = PurchaseRequest.objects.create(
        project=project,
        item_name=payload.item_name,
        description=payload.description,
        quantity=payload.quantity,
        unit=payload.unit,
        required_date=payload.required_date,
        requested_by_id=auth["user_id"],
    )
    return PurchaseRequest.objects.select_related("project", "requested_by").get(id=pr.id)


@router.patch("/requests/{pr_id}", response=PurchaseRequestOut)
@require_role("admin", "editor")
def update_request(request, pr_id: int, payload: PurchaseRequestPatch):
    pr = get_object_or_404(PurchaseRequest, id=pr_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pr, field, value)
    pr.save()
    return PurchaseRequest.objects.select_related("project", "requested_by").get(id=pr.id)


# ── PurchaseOrder ─────────────────────────────────────────────────────────────

@router.get("/orders", response=list[PurchaseOrderOut])
def list_orders(request, project_id: Optional[int] = None):
    qs = PurchaseOrder.objects.select_related("project", "request", "created_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/orders", response={200: PurchaseOrderOut})
@require_role("admin", "editor")
def create_order(request, payload: PurchaseOrderIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    po = PurchaseOrder.objects.create(
        project=project,
        request_id=payload.request_id,
        po_number=payload.po_number,
        supplier_name=payload.supplier_name,
        supplier_contact=payload.supplier_contact,
        total_amount=payload.total_amount,
        currency=payload.currency,
        order_date=payload.order_date,
        expected_delivery=payload.expected_delivery,
        notes=payload.notes,
        created_by_id=auth.get("user_id"),
    )
    return PurchaseOrder.objects.select_related("project", "request", "created_by").get(id=po.id)


@router.patch("/orders/{po_id}", response=PurchaseOrderOut)
@require_role("admin", "editor")
def update_order(request, po_id: int, payload: PurchaseOrderPatch):
    po = get_object_or_404(PurchaseOrder, id=po_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(po, field, value)
    po.save()
    return PurchaseOrder.objects.select_related("project", "request", "created_by").get(id=po.id)


# ── MaterialDelivery ──────────────────────────────────────────────────────────

@router.post("/orders/{po_id}/deliveries", response={200: MaterialDeliveryOut})
@require_role("admin", "editor")
def create_delivery(request, po_id: int, payload: MaterialDeliveryIn):
    po = get_object_or_404(PurchaseOrder, id=po_id)
    auth = getattr(request, "auth", {}) or {}
    delivery = MaterialDelivery.objects.create(
        purchase_order=po,
        delivery_date=payload.delivery_date,
        quantity_received=payload.quantity_received,
        inspection_status=payload.inspection_status,
        notes=payload.notes,
        received_by_id=auth["user_id"],
    )
    return MaterialDelivery.objects.select_related("purchase_order", "received_by").get(
        id=delivery.id
    )

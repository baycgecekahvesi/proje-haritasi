from typing import Optional

from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import InspectionPlan, InspectionItem, NCR, NCRStatus
from .schemas import (
    InspectionPlanIn,
    InspectionPlanOut,
    InspectionItemIn,
    InspectionItemOut,
    InspectionItemPatch,
    NCRIn,
    NCROut,
    NCRPatch,
)

router = Router()


# ── InspectionPlan ────────────────────────────────────────────────────────────

@router.get("/plans", response=list[InspectionPlanOut])
def list_plans(request, project_id: Optional[int] = None):
    qs = InspectionPlan.objects.select_related("project", "created_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/plans", response={200: InspectionPlanOut})
@require_role("admin", "editor")
def create_plan(request, payload: InspectionPlanIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    plan = InspectionPlan.objects.create(
        project=project,
        title=payload.title,
        description=payload.description,
        created_by_id=auth.get("user_id"),
    )
    return InspectionPlan.objects.select_related("project", "created_by").get(id=plan.id)


# ── InspectionItem ────────────────────────────────────────────────────────────

@router.get("/plans/{plan_id}/items", response=list[InspectionItemOut])
def list_items(request, plan_id: int):
    get_object_or_404(InspectionPlan, id=plan_id)
    return list(
        InspectionItem.objects.select_related("plan", "inspected_by").filter(plan_id=plan_id)
    )


@router.post("/plans/{plan_id}/items", response={200: InspectionItemOut})
@require_role("admin", "editor")
def create_item(request, plan_id: int, payload: InspectionItemIn):
    plan = get_object_or_404(InspectionPlan, id=plan_id)
    item = InspectionItem.objects.create(
        plan=plan,
        activity_name=payload.activity_name,
        hold_point_type=payload.hold_point_type,
        responsible_party=payload.responsible_party,
        standard_ref=payload.standard_ref,
        status=payload.status,
        inspected_by_id=payload.inspected_by_id,
        inspection_date=payload.inspection_date,
        result_notes=payload.result_notes,
    )
    return InspectionItem.objects.select_related("plan", "inspected_by").get(id=item.id)


@router.patch("/plans/{plan_id}/items/{item_id}", response=InspectionItemOut)
@require_role("admin", "editor")
def update_item(request, plan_id: int, item_id: int, payload: InspectionItemPatch):
    item = get_object_or_404(InspectionItem, id=item_id, plan_id=plan_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.save()
    return InspectionItem.objects.select_related("plan", "inspected_by").get(id=item.id)


# ── NCR ───────────────────────────────────────────────────────────────────────

@router.get("/{project_id}/ncrs", response=list[NCROut])
def list_ncrs(request, project_id: int):
    get_object_or_404(Project, id=project_id)
    return list(
        NCR.objects.select_related(
            "project", "raised_by", "assigned_to", "inspection_item"
        ).filter(project_id=project_id)
    )


@router.post("/{project_id}/ncrs", response={200: NCROut})
@require_role("admin", "editor")
def create_ncr(request, project_id: int, payload: NCRIn):
    project = get_object_or_404(Project, id=project_id)
    auth = getattr(request, "auth", {}) or {}
    ncr = NCR.objects.create(
        project=project,
        inspection_item_id=payload.inspection_item_id,
        ncr_no=payload.ncr_no,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        raised_by_id=auth["user_id"],
        assigned_to_id=payload.assigned_to_id,
        action_plan=payload.action_plan,
    )
    return NCR.objects.select_related(
        "project", "raised_by", "assigned_to", "inspection_item"
    ).get(id=ncr.id)


@router.patch("/{project_id}/ncrs/{ncr_id}", response=NCROut)
@require_role("admin", "editor")
def update_ncr(request, project_id: int, ncr_id: int, payload: NCRPatch):
    ncr = get_object_or_404(NCR, id=ncr_id, project_id=project_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ncr, field, value)
    ncr.save()
    return NCR.objects.select_related(
        "project", "raised_by", "assigned_to", "inspection_item"
    ).get(id=ncr.id)


@router.post("/ncrs/{ncr_id}/close", response=NCROut)
@require_role("admin")
def close_ncr(request, ncr_id: int):
    ncr = get_object_or_404(NCR, id=ncr_id)
    ncr.status = NCRStatus.CLOSED
    ncr.closed_at = timezone.now()
    ncr.save()
    return NCR.objects.select_related(
        "project", "raised_by", "assigned_to", "inspection_item"
    ).get(id=ncr.id)

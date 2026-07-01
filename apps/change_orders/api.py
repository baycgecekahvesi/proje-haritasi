from typing import Optional

from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import ChangeOrder, ChangeOrderStatus
from .schemas import ChangeOrderIn, ChangeOrderOut, ChangeOrderPatch

router = Router()


def _select_related(qs):
    return qs.select_related("project", "requested_by", "approved_by")


@router.get("", response=list[ChangeOrderOut])
def list_change_orders(request, project_id: Optional[int] = None):
    qs = _select_related(ChangeOrder.objects.all())
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("", response={200: ChangeOrderOut})
@require_role("admin", "editor")
def create_change_order(request, payload: ChangeOrderIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    co = ChangeOrder.objects.create(
        project=project,
        co_number=payload.co_number,
        title=payload.title,
        description=payload.description,
        reason=payload.reason,
        cost_impact=payload.cost_impact,
        schedule_impact_days=payload.schedule_impact_days,
        requested_by_id=auth["user_id"],
    )
    return _select_related(ChangeOrder.objects).get(id=co.id)


@router.patch("/{co_id}", response=ChangeOrderOut)
@require_role("admin", "editor")
def update_change_order(request, co_id: int, payload: ChangeOrderPatch):
    co = get_object_or_404(ChangeOrder, id=co_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(co, field, value)
    co.save()
    return _select_related(ChangeOrder.objects).get(id=co.id)


@router.post("/{co_id}/submit", response=ChangeOrderOut)
@require_role("admin", "editor")
def submit_change_order(request, co_id: int):
    co = get_object_or_404(ChangeOrder, id=co_id)
    co.status = ChangeOrderStatus.SUBMITTED
    co.save()
    return _select_related(ChangeOrder.objects).get(id=co.id)


@router.post("/{co_id}/approve", response=ChangeOrderOut)
@require_role("admin")
def approve_change_order(request, co_id: int):
    from apps.budget.models import Budget
    co = get_object_or_404(ChangeOrder, id=co_id)
    auth = getattr(request, "auth", {}) or {}
    co.status = ChangeOrderStatus.APPROVED
    co.approved_by_id = auth["user_id"]
    co.approved_at = timezone.now()
    co.save()
    # Bütçeyi güncelle
    budget, _ = Budget.objects.get_or_create(
        project=co.project,
        defaults={"planned_amount": 0},
    )
    budget.planned_amount += co.cost_impact
    budget.save()
    return _select_related(ChangeOrder.objects).get(id=co.id)


@router.post("/{co_id}/reject", response=ChangeOrderOut)
@require_role("admin")
def reject_change_order(request, co_id: int):
    co = get_object_or_404(ChangeOrder, id=co_id)
    co.status = ChangeOrderStatus.REJECTED
    co.save()
    return _select_related(ChangeOrder.objects).get(id=co.id)

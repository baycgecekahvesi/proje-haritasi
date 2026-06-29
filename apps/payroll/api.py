from decimal import Decimal, InvalidOperation
from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.pagination import PageNumberPagination, paginate

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import ProgressPayment, PaymentStatus, Timesheet, TimesheetStatus
from .schemas import (
    ProgressPaymentIn,
    ProgressPaymentOut,
    ProgressPaymentPatch,
    TimesheetIn,
    TimesheetOut,
    TimesheetPatch,
)

router = Router()

# ── Puantaj ───────────────────────────────────────────────────────────────────


@router.get("/timesheets", response=list[TimesheetOut])
@paginate(PageNumberPagination, page_size=50)
def list_timesheets(
    request,
    project_id: Optional[int] = None,
    user_id: Optional[int] = None,
):
    qs = Timesheet.objects.select_related(
        "project", "user", "resource", "approved_by"
    )
    if project_id:
        qs = qs.filter(project_id=project_id)

    auth = getattr(request, "auth", {}) or {}
    if auth.get("role") == "viewer":
        qs = qs.filter(user_id=auth["user_id"])
    elif user_id:
        qs = qs.filter(user_id=user_id)

    return qs


@router.post("/timesheets", response={200: TimesheetOut})
@require_role("admin", "editor")
def create_timesheet(request, payload: TimesheetIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    user = get_object_or_404(User, id=auth["user_id"])
    ts = Timesheet.objects.create(
        project=project,
        user=user,
        resource_id=payload.resource_id,
        work_date=payload.work_date,
        hours_worked=payload.hours_worked,
        work_description=payload.work_description,
    )
    return Timesheet.objects.select_related(
        "project", "user", "resource", "approved_by"
    ).get(id=ts.id)


@router.patch("/timesheets/{ts_id}", response=TimesheetOut)
@require_role("admin", "editor")
def update_timesheet(request, ts_id: int, payload: TimesheetPatch):
    ts = get_object_or_404(Timesheet, id=ts_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ts, field, value)
    ts.save()
    return Timesheet.objects.select_related(
        "project", "user", "resource", "approved_by"
    ).get(id=ts.id)


@router.post("/timesheets/{ts_id}/approve", response=TimesheetOut)
@require_role("admin")
def approve_timesheet(request, ts_id: int):
    ts = get_object_or_404(Timesheet, id=ts_id)
    auth = getattr(request, "auth", {}) or {}
    ts.status = TimesheetStatus.APPROVED
    ts.approved_by_id = auth["user_id"]
    ts.save()
    return Timesheet.objects.select_related(
        "project", "user", "resource", "approved_by"
    ).get(id=ts.id)


@router.delete("/timesheets/{ts_id}", response={200: dict})
@require_role("admin", "editor")
def delete_timesheet(request, ts_id: int):
    get_object_or_404(Timesheet, id=ts_id).delete()
    return {"detail": "Puantaj silindi"}


# ── Hakediş ───────────────────────────────────────────────────────────────────


@router.get("/payments", response=list[ProgressPaymentOut])
@paginate(PageNumberPagination, page_size=50)
def list_payments(request, project_id: Optional[int] = None):
    qs = ProgressPayment.objects.select_related("project", "approved_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return qs


@router.post("/payments", response={200: ProgressPaymentOut})
@require_role("admin", "editor")
def create_payment(request, payload: ProgressPaymentIn):
    project = get_object_or_404(Project, id=payload.project_id)
    pp = ProgressPayment.objects.create(
        project=project,
        period_start=payload.period_start,
        period_end=payload.period_end,
        planned_amount=payload.planned_amount,
        actual_amount=payload.actual_amount,
        description=payload.description,
    )
    return ProgressPayment.objects.select_related("project", "approved_by").get(id=pp.id)


@router.patch("/payments/{pp_id}", response=ProgressPaymentOut)
@require_role("admin", "editor")
def update_payment(request, pp_id: int, payload: ProgressPaymentPatch):
    pp = get_object_or_404(ProgressPayment, id=pp_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pp, field, value)
    pp.save()
    return ProgressPayment.objects.select_related("project", "approved_by").get(id=pp.id)


@router.post("/payments/{pp_id}/approve", response=ProgressPaymentOut)
@require_role("admin")
def approve_payment(request, pp_id: int, approved_amount: Optional[str] = None):
    pp = get_object_or_404(ProgressPayment, id=pp_id)
    auth = getattr(request, "auth", {}) or {}
    pp.status = PaymentStatus.APPROVED
    pp.approved_by_id = auth["user_id"]
    if approved_amount:
        try:
            pp.approved_amount = Decimal(approved_amount)
        except InvalidOperation:
            pass
    pp.save()
    return ProgressPayment.objects.select_related("project", "approved_by").get(id=pp.id)


@router.delete("/payments/{pp_id}", response={200: dict})
@require_role("admin")
def delete_payment(request, pp_id: int):
    get_object_or_404(ProgressPayment, id=pp_id).delete()
    return {"detail": "Hakediş silindi"}

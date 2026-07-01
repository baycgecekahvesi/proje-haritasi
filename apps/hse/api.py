from typing import Optional

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import HSEInspection, HSEInspectionStatus, WorkAccident, WorkerEntry
from .schemas import (
    HSEInspectionIn,
    HSEInspectionOut,
    HSEInspectionPatch,
    HSESummaryOut,
    WorkAccidentIn,
    WorkAccidentOut,
    WorkAccidentPatch,
    WorkerEntryIn,
    WorkerEntryOut,
)

router = Router()


# ── WorkerEntry ───────────────────────────────────────────────────────────────

@router.get("/worker-entries", response=list[WorkerEntryOut])
def list_worker_entries(request, project_id: Optional[int] = None):
    qs = WorkerEntry.objects.select_related("project", "registered_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/worker-entries", response={200: WorkerEntryOut})
@require_role("admin", "editor")
def create_worker_entry(request, payload: WorkerEntryIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    entry = WorkerEntry.objects.create(
        project=project,
        date=payload.date,
        worker_count=payload.worker_count,
        subcontractor_name=payload.subcontractor_name,
        registered_by_id=auth["user_id"],
    )
    return WorkerEntry.objects.select_related("project", "registered_by").get(id=entry.id)


# ── WorkAccident ──────────────────────────────────────────────────────────────

@router.get("/accidents", response=list[WorkAccidentOut])
def list_accidents(request, project_id: Optional[int] = None):
    qs = WorkAccident.objects.select_related("project", "created_by")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/accidents", response={200: WorkAccidentOut})
@require_role("admin", "editor")
def create_accident(request, payload: WorkAccidentIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    acc = WorkAccident.objects.create(
        project=project,
        accident_date=payload.accident_date,
        description=payload.description,
        severity=payload.severity,
        injured_person=payload.injured_person,
        action_taken=payload.action_taken,
        reported_to_sgk=payload.reported_to_sgk,
        sgk_report_date=payload.sgk_report_date,
        created_by_id=auth["user_id"],
    )
    return WorkAccident.objects.select_related("project", "created_by").get(id=acc.id)


@router.patch("/accidents/{acc_id}", response=WorkAccidentOut)
@require_role("admin", "editor")
def update_accident(request, acc_id: int, payload: WorkAccidentPatch):
    acc = get_object_or_404(WorkAccident, id=acc_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(acc, field, value)
    acc.save()
    return WorkAccident.objects.select_related("project", "created_by").get(id=acc.id)


# ── HSEInspection ─────────────────────────────────────────────────────────────

@router.get("/inspections", response=list[HSEInspectionOut])
def list_inspections(request, project_id: Optional[int] = None):
    qs = HSEInspection.objects.select_related("project", "inspector")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/inspections", response={200: HSEInspectionOut})
@require_role("admin", "editor")
def create_inspection(request, payload: HSEInspectionIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    insp = HSEInspection.objects.create(
        project=project,
        inspection_date=payload.inspection_date,
        inspector_id=auth["user_id"],
        findings=payload.findings,
        action_required=payload.action_required,
        next_inspection_date=payload.next_inspection_date,
        status=payload.status,
    )
    return HSEInspection.objects.select_related("project", "inspector").get(id=insp.id)


@router.patch("/inspections/{insp_id}", response=HSEInspectionOut)
@require_role("admin", "editor")
def update_inspection(request, insp_id: int, payload: HSEInspectionPatch):
    insp = get_object_or_404(HSEInspection, id=insp_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(insp, field, value)
    insp.save()
    return HSEInspection.objects.select_related("project", "inspector").get(id=insp.id)


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/summary", response=HSESummaryOut)
def hse_summary(request, project_id: Optional[int] = None):
    worker_qs = WorkerEntry.objects.all()
    accident_qs = WorkAccident.objects.all()
    inspection_qs = HSEInspection.objects.all()

    if project_id:
        worker_qs = worker_qs.filter(project_id=project_id)
        accident_qs = accident_qs.filter(project_id=project_id)
        inspection_qs = inspection_qs.filter(project_id=project_id)

    total_workers = worker_qs.aggregate(total=Sum("worker_count"))["total"] or 0
    total_accidents = accident_qs.count()
    open_inspections = inspection_qs.filter(status=HSEInspectionStatus.OPEN).count()

    return HSESummaryOut(
        total_workers=total_workers,
        total_accidents=total_accidents,
        open_inspections=open_inspections,
    )

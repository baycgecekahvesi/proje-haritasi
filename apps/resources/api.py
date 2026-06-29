from decimal import Decimal
from typing import Optional

from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.projects.models import Task
from .models import Resource, TaskResource
from .schemas import (
    ResourceIn,
    ResourceOut,
    ResourcePatch,
    TaskResourceIn,
    TaskResourceOut,
)

router = Router()

# ── Kaynak CRUD ──────────────────────────────────────────────────────────────


@router.get("", response=list[ResourceOut], summary="Kaynak listesi")
def list_resources(
    request,
    resource_type: Optional[str] = None,
    is_active: Optional[bool] = None,
):
    qs = Resource.objects.all()
    if resource_type:
        qs = qs.filter(resource_type=resource_type)
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return list(qs)


@router.post("", response=ResourceOut, summary="Yeni kaynak ekle")
@require_role("admin", "editor")
def create_resource(request, payload: ResourceIn):
    return Resource.objects.create(**payload.model_dump())


@router.get("/{resource_id}", response=ResourceOut, summary="Kaynak detayı")
def get_resource(request, resource_id: int):
    return get_object_or_404(Resource, id=resource_id)


@router.patch("/{resource_id}", response=ResourceOut, summary="Kaynak güncelle")
@require_role("admin", "editor")
def update_resource(request, resource_id: int, payload: ResourcePatch):
    resource = get_object_or_404(Resource, id=resource_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)
    resource.save()
    return resource


@router.delete("/{resource_id}", response={200: dict}, summary="Kaynak sil")
@require_role("admin")
def delete_resource(request, resource_id: int):
    get_object_or_404(Resource, id=resource_id).delete()
    return {"detail": "Kaynak silindi"}


# ── Yük Raporu ────────────────────────────────────────────────────────────────


@router.get("/workload/summary", response=list[dict], summary="Kaynak yük raporu")
def resource_workload(request):
    """Her kaynağın toplam planlanan ve gerçekleşen miktarı."""
    dec = DecimalField(max_digits=14, decimal_places=2)
    rows = (
        TaskResource.objects
        .select_related("resource")
        .values(
            "resource__id",
            "resource__name",
            "resource__resource_type",
            "resource__unit",
        )
        .annotate(
            total_planned=Coalesce(Sum("planned_quantity"), Decimal("0"), output_field=dec),
            total_actual=Coalesce(Sum("actual_quantity"), Decimal("0"), output_field=dec),
        )
        .order_by("resource__resource_type", "resource__name")
    )
    return [
        {
            "resource_id":   r["resource__id"],
            "resource_name": r["resource__name"],
            "resource_type": r["resource__resource_type"],
            "unit":          r["resource__unit"],
            "total_planned": r["total_planned"],
            "total_actual":  r["total_actual"],
        }
        for r in rows
    ]


# ── Görev Kaynakları ─────────────────────────────────────────────────────────


@router.get("/tasks/{task_id}/resources", response=list[TaskResourceOut], summary="Görev kaynak listesi")
def list_task_resources(request, task_id: int):
    get_object_or_404(Task, id=task_id)
    return list(
        TaskResource.objects.filter(task_id=task_id).select_related("resource")
    )


@router.post("/tasks/{task_id}/resources", response=TaskResourceOut, summary="Göreve kaynak ata")
@require_role("admin", "editor")
def assign_resource_to_task(request, task_id: int, payload: TaskResourceIn):
    task = get_object_or_404(Task, id=task_id)
    resource = get_object_or_404(Resource, id=payload.resource_id)
    tr, _ = TaskResource.objects.get_or_create(
        task=task,
        resource=resource,
        defaults={
            "planned_quantity": payload.planned_quantity,
            "actual_quantity":  payload.actual_quantity,
            "unit_cost":        payload.unit_cost,
        },
    )
    return TaskResource.objects.select_related("resource").get(id=tr.id)


@router.patch(
    "/tasks/{task_id}/resources/{tr_id}",
    response=TaskResourceOut,
    summary="Görev kaynağı güncelle",
)
@require_role("admin", "editor")
def update_task_resource(request, task_id: int, tr_id: int, payload: TaskResourceIn):
    tr = get_object_or_404(TaskResource, id=tr_id, task_id=task_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "resource_id":
            continue
        setattr(tr, field, value)
    tr.save()
    return TaskResource.objects.select_related("resource").get(id=tr.id)


@router.delete(
    "/tasks/{task_id}/resources/{tr_id}",
    response={200: dict},
    summary="Görev kaynağı kaldır",
)
@require_role("admin", "editor")
def remove_resource_from_task(request, task_id: int, tr_id: int):
    get_object_or_404(TaskResource, id=tr_id, task_id=task_id).delete()
    return {"detail": "Kaynak ataması kaldırıldı"}

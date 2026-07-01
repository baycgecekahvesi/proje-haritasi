from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.projects.models import Project

from .models import LegalPermit
from .schemas import LegalPermitIn, LegalPermitOut, LegalPermitPatch

permits_router = Router()


@permits_router.get("/", response=list[LegalPermitOut])
def list_permits(request, project_id: Optional[int] = None):
    qs = LegalPermit.objects.select_related("project")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@permits_router.post("/", response={200: LegalPermitOut})
@require_role("admin", "editor")
def create_permit(request, payload: LegalPermitIn):
    project = get_object_or_404(Project, id=payload.project_id)
    permit = LegalPermit.objects.create(
        project=project,
        permit_type=payload.permit_type,
        permit_no=payload.permit_no,
        issued_by=payload.issued_by,
        issue_date=payload.issue_date,
        expiry_date=payload.expiry_date,
        status=payload.status,
        notes=payload.notes,
    )
    return LegalPermit.objects.select_related("project").get(id=permit.id)


@permits_router.patch("/{permit_id}", response=LegalPermitOut)
@require_role("admin", "editor")
def update_permit(request, permit_id: int, payload: LegalPermitPatch):
    permit = get_object_or_404(LegalPermit, id=permit_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(permit, field, value)
    permit.save()
    return LegalPermit.objects.select_related("project").get(id=permit.id)


@permits_router.delete("/{permit_id}", response={200: dict})
@require_role("admin")
def delete_permit(request, permit_id: int):
    permit = get_object_or_404(LegalPermit, id=permit_id)
    if permit.file:
        permit.file.delete(save=False)
    permit.delete()
    return {"detail": "Izin/Ruhsat silindi"}

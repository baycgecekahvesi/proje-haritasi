from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.projects.models import Project

from .models import Stakeholder
from .schemas import StakeholderIn, StakeholderOut, StakeholderPatch

router = Router()


def _select_related(qs):
    return qs.select_related("project")


@router.get("", response=list[StakeholderOut])
def list_stakeholders(request, project_id: Optional[int] = None):
    qs = _select_related(Stakeholder.objects.all())
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("", response={200: StakeholderOut})
@require_role("admin", "editor")
def create_stakeholder(request, payload: StakeholderIn):
    project = get_object_or_404(Project, id=payload.project_id)
    sh = Stakeholder.objects.create(
        project=project,
        name=payload.name,
        organization=payload.organization,
        role=payload.role,
        email=payload.email,
        phone=payload.phone,
        influence_level=payload.influence_level,
        interest_level=payload.interest_level,
        communication_frequency=payload.communication_frequency,
        notes=payload.notes,
    )
    return _select_related(Stakeholder.objects).get(id=sh.id)


@router.patch("/{sh_id}", response=StakeholderOut)
@require_role("admin", "editor")
def update_stakeholder(request, sh_id: int, payload: StakeholderPatch):
    sh = get_object_or_404(Stakeholder, id=sh_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sh, field, value)
    sh.save()
    return _select_related(Stakeholder.objects).get(id=sh.id)


@router.delete("/{sh_id}", response={200: dict})
@require_role("admin")
def delete_stakeholder(request, sh_id: int):
    get_object_or_404(Stakeholder, id=sh_id).delete()
    return {"detail": "Paydaş silindi"}

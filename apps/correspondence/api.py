from datetime import date
from typing import Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import Correspondence, CorrespondenceStatus
from .schemas import CorrespondenceIn, CorrespondenceOut, CorrespondencePatch

router = Router()


def _select_related(qs):
    return qs.select_related("project", "created_by")


@router.get("", response=list[CorrespondenceOut])
def list_correspondence(request, project_id: Optional[int] = None):
    qs = _select_related(Correspondence.objects.all())
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("", response={200: CorrespondenceOut})
@require_role("admin", "editor")
def create_correspondence(request, payload: CorrespondenceIn):
    project = get_object_or_404(Project, id=payload.project_id)
    auth = getattr(request, "auth", {}) or {}
    obj = Correspondence.objects.create(
        project=project,
        ref_no=payload.ref_no,
        type=payload.type,
        subject=payload.subject,
        from_party=payload.from_party,
        to_party=payload.to_party,
        sent_at=payload.sent_at,
        response_due=payload.response_due,
        content=payload.content,
        created_by_id=auth.get("user_id"),
    )
    return _select_related(Correspondence.objects).get(id=obj.id)


@router.patch("/{corr_id}", response=CorrespondenceOut)
@require_role("admin", "editor")
def update_correspondence(request, corr_id: int, payload: CorrespondencePatch):
    obj = get_object_or_404(Correspondence, id=corr_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    obj.save()
    return _select_related(Correspondence.objects).get(id=obj.id)


@router.post("/{corr_id}/respond", response=CorrespondenceOut)
@require_role("admin", "editor")
def respond_correspondence(request, corr_id: int):
    obj = get_object_or_404(Correspondence, id=corr_id)
    obj.responded_at = date.today()
    obj.status = CorrespondenceStatus.RESPONDED
    obj.save()
    return _select_related(Correspondence.objects).get(id=obj.id)

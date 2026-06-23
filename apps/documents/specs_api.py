from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from apps.accounts.decorators import require_role
from apps.accounts.models import User  # noqa: F401 (used in get_object_or_404)

from .models import TechnicalSpec
from .schemas import TechSpecIn, TechSpecOut

router = Router()


@router.get("/", response=list[TechSpecOut])
def list_specs(request, spec_type: str = None, status: str = None, search: str = None):
    qs = TechnicalSpec.objects.select_related("created_by", "project")
    if spec_type:
        qs = qs.filter(spec_type=spec_type)
    if status:
        qs = qs.filter(status=status)
    if search:
        qs = qs.filter(title__icontains=search)
    return list(qs)


@router.post("/", response={200: TechSpecOut})
@require_role("admin", "editor")
def create_spec(request, payload: TechSpecIn):
    data = payload.dict()
    if data.get("spec_type") not in TechnicalSpec.SpecType.values:
        data["spec_type"] = TechnicalSpec.SpecType.GENERAL
    if data.get("status") not in TechnicalSpec.Status.values:
        data["status"] = TechnicalSpec.Status.DRAFT
    user = get_object_or_404(User, id=request.auth["user_id"])
    spec = TechnicalSpec.objects.create(created_by=user, **data)
    return TechnicalSpec.objects.select_related("created_by", "project").get(id=spec.id)


@router.get("/{spec_id}", response=TechSpecOut)
def get_spec(request, spec_id: int):
    return get_object_or_404(
        TechnicalSpec.objects.select_related("created_by", "project"), id=spec_id
    )


@router.put("/{spec_id}", response=TechSpecOut)
@require_role("admin", "editor")
def update_spec(request, spec_id: int, payload: TechSpecIn):
    spec = get_object_or_404(TechnicalSpec, id=spec_id)
    data = payload.dict()
    if data.get("spec_type") not in TechnicalSpec.SpecType.values:
        data["spec_type"] = TechnicalSpec.SpecType.GENERAL
    if data.get("status") not in TechnicalSpec.Status.values:
        data["status"] = TechnicalSpec.Status.DRAFT
    for field, value in data.items():
        setattr(spec, field, value)
    spec.save()
    return TechnicalSpec.objects.select_related("created_by", "project").get(id=spec.id)


@router.delete("/{spec_id}", response={200: dict})
@require_role("admin", "editor")
def delete_spec(request, spec_id: int):
    spec = get_object_or_404(TechnicalSpec, id=spec_id)
    spec.delete()
    return {"detail": "Şartname silindi"}

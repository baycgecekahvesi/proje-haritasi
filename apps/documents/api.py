import os
from typing import Optional

from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import File, Form, Router
from ninja.errors import HttpError
from ninja.files import UploadedFile

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from apps.projects.models import Project

from .models import Document, LegalPermit, SitePhoto
from .schemas import DocumentOut, LegalPermitIn, LegalPermitOut, LegalPermitPatch, SitePhotoOut

router = Router()


def _validate_upload(file: UploadedFile):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
        raise HttpError(
            400,
            f"İzin verilmeyen dosya türü: {ext}. "
            f"İzin verilenler: {', '.join(settings.ALLOWED_UPLOAD_EXTENSIONS)}",
        )
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file.size > max_bytes:
        raise HttpError(
            400, f"Dosya boyutu {settings.MAX_UPLOAD_SIZE_MB} MB sınırını aşıyor"
        )


@router.get("/{project_id}", response=list[DocumentOut])
def list_documents(request, project_id: int):
    get_object_or_404(Project, id=project_id)
    return list(
        Document.objects.select_related("uploaded_by").filter(
            project_id=project_id
        )
    )


@router.post("/{project_id}", response={200: DocumentOut})
@require_role("admin", "editor")
def upload_document(
    request,
    project_id: int,
    file: UploadedFile = File(...),
    title: str = Form(""),
    doc_type: str = Form("other"),
):
    project = get_object_or_404(Project, id=project_id)
    _validate_upload(file)

    if doc_type not in Document.DocType.values:
        doc_type = Document.DocType.OTHER

    uploader = User.objects.filter(id=request.auth["user_id"]).first()
    return Document.objects.create(
        project=project,
        title=title or file.name,
        doc_type=doc_type,
        file=file,
        uploaded_by=uploader,
    )


# NOT: Silme yolu liste yolu (/{project_id}) ile çakışmaması için
# "/file/" ön ekiyle ayrıştırıldı (tek segmentli iki desen Django'da çakışır).
@router.delete("/file/{document_id}", response={200: dict})
@require_role("admin", "editor")
def delete_document(request, document_id: int):
    doc = get_object_or_404(Document, id=document_id)
    doc.file.delete(save=False)  # diskten temizle
    doc.delete()
    return {"detail": "Döküman silindi"}


# --- Saha Fotoğrafları ---

@router.get("/site-photos/{project_id}", response=list[SitePhotoOut])
def list_site_photos(request, project_id: int, date: str = None):
    from apps.projects.models import Project as _Project
    get_object_or_404(_Project, id=project_id)
    qs = SitePhoto.objects.filter(project_id=project_id).select_related("uploaded_by")
    if date:
        try:
            from datetime import datetime as dt
            d = dt.strptime(date, "%Y-%m-%d").date()
            qs = qs.filter(taken_at__date=d)
        except ValueError:
            pass
    return list(qs)


@router.post("/site-photos/{project_id}", response={200: SitePhotoOut})
@require_role("admin", "editor")
def upload_site_photo(
    request,
    project_id: int,
    file: UploadedFile = File(...),
    description: str = Form(""),
    latitude: float = Form(None),
    longitude: float = Form(None),
    taken_at: str = Form(None),
):
    from apps.projects.models import Project as _Project
    from datetime import datetime as dt
    project = get_object_or_404(_Project, id=project_id)
    auth = getattr(request, "auth", {}) or {}
    taken_at_dt = None
    if taken_at:
        try:
            taken_at_dt = dt.fromisoformat(taken_at)
        except ValueError:
            pass
    photo = SitePhoto.objects.create(
        project=project,
        uploaded_by_id=auth["user_id"],
        photo=file,
        description=description,
        latitude=latitude,
        longitude=longitude,
        taken_at=taken_at_dt,
    )
    return SitePhoto.objects.select_related("uploaded_by").get(id=photo.id)


@router.delete("/site-photos/{project_id}/{photo_id}", response={200: dict})
@require_role("admin", "editor")
def delete_site_photo(request, project_id: int, photo_id: int):
    photo = get_object_or_404(SitePhoto, id=photo_id, project_id=project_id)
    photo.photo.delete(save=False)
    photo.delete()
    return {"detail": "Fotoğraf silindi"}


# ── LegalPermit ───────────────────────────────────────────────────────────────

@router.get("/permits", response=list[LegalPermitOut])
def list_permits(request, project_id: Optional[int] = None):
    qs = LegalPermit.objects.select_related("project")
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs)


@router.post("/permits", response={200: LegalPermitOut})
@require_role("admin", "editor")
def create_permit(request, payload: LegalPermitIn):
    from apps.projects.models import Project as _Project
    project = get_object_or_404(_Project, id=payload.project_id)
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


@router.patch("/permits/{permit_id}", response=LegalPermitOut)
@require_role("admin", "editor")
def update_permit(request, permit_id: int, payload: LegalPermitPatch):
    permit = get_object_or_404(LegalPermit, id=permit_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(permit, field, value)
    permit.save()
    return LegalPermit.objects.select_related("project").get(id=permit.id)


@router.delete("/permits/{permit_id}", response={200: dict})
@require_role("admin")
def delete_permit(request, permit_id: int):
    permit = get_object_or_404(LegalPermit, id=permit_id)
    if permit.file:
        permit.file.delete(save=False)
    permit.delete()
    return {"detail": "İzin/Ruhsat silindi"}

import os

from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import File, Form, Router
from ninja.errors import HttpError
from ninja.files import UploadedFile

from apps.accounts.decorators import require_role
from apps.accounts.models import User

from .models import TechnicalDocument
from .schemas import TechDocOut

router = Router()


def _validate(file: UploadedFile):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
        raise HttpError(400, f"İzin verilmeyen dosya türü: {ext}")
    if file.size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HttpError(400, f"Dosya boyutu {settings.MAX_UPLOAD_SIZE_MB} MB sınırını aşıyor")


@router.get("/", response=list[TechDocOut])
def list_techdocs(request, category: str = None, search: str = None):
    qs = TechnicalDocument.objects.select_related("uploaded_by")
    if category:
        qs = qs.filter(category=category)
    if search:
        qs = qs.filter(title__icontains=search)
    return list(qs)


@router.post("/", response={200: TechDocOut})
@require_role("admin", "editor")
def upload_techdoc(
    request,
    file: UploadedFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    category: str = Form("genel"),
):
    _validate(file)
    if category not in TechnicalDocument.Category.values:
        category = TechnicalDocument.Category.GENERAL
    uploader = get_object_or_404(User, id=request.auth["user_id"])
    return TechnicalDocument.objects.create(
        title=title or file.name,
        description=description,
        category=category,
        file=file,
        uploaded_by=uploader,
    )


@router.delete("/{doc_id}", response={200: dict})
@require_role("admin", "editor")
def delete_techdoc(request, doc_id: int):
    doc = get_object_or_404(TechnicalDocument, id=doc_id)
    doc.file.delete(save=False)
    doc.delete()
    return {"detail": "Döküman silindi"}

from typing import Optional
from datetime import datetime, date

from django.shortcuts import get_object_or_404
from ninja import Router, Schema, File, Form
from ninja.files import UploadedFile
from ninja.errors import HttpError

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from .models import EplanDokuman

router = Router()


# ── Schemas ──────────────────────────────────────────────────────────────────

class EplanIn(Schema):
    seri_no: str
    baslik: str
    dokuman_tipi: str = "sema"
    revizyon_no: str = "Rev.0"
    onay_durumu: str = "taslak"
    aciklama: str = ""
    notlar: str = ""
    proje_id: Optional[int] = None
    onay_tarihi: Optional[date] = None


class EplanOut(Schema):
    id: int
    seri_no: str
    baslik: str
    dokuman_tipi: str
    dokuman_tipi_display: str
    revizyon_no: str
    onay_durumu: str
    onay_durumu_display: str
    aciklama: str
    notlar: str
    proje_id: Optional[int]
    proje_adi: Optional[str]
    dosya_url: Optional[str]
    dosya_uzanti: str
    dosya_kb: float
    yukleyen_username: Optional[str]
    onaylayan_username: Optional[str]
    onay_tarihi: Optional[date]
    yukleme_tarihi: datetime
    guncelleme_tarihi: datetime

    @staticmethod
    def resolve_dokuman_tipi_display(obj) -> str:
        return obj.get_dokuman_tipi_display()

    @staticmethod
    def resolve_onay_durumu_display(obj) -> str:
        return obj.get_onay_durumu_display()

    @staticmethod
    def resolve_proje_adi(obj) -> Optional[str]:
        return obj.proje.name if obj.proje_id else None

    @staticmethod
    def resolve_dosya_url(obj) -> Optional[str]:
        return obj.dosya.url if obj.dosya else None

    @staticmethod
    def resolve_dosya_uzanti(obj) -> str:
        return obj.file_extension

    @staticmethod
    def resolve_dosya_kb(obj) -> float:
        return obj.file_size_kb

    @staticmethod
    def resolve_yukleyen_username(obj) -> Optional[str]:
        return obj.yukleyen.username if obj.yukleyen_id else None

    @staticmethod
    def resolve_onaylayan_username(obj) -> Optional[str]:
        return obj.onaylayan.username if obj.onaylayan_id else None


class EplanPatch(Schema):
    onay_durumu: Optional[str] = None
    notlar: Optional[str] = None
    aciklama: Optional[str] = None
    onay_tarihi: Optional[date] = None
    onaylayan_id: Optional[int] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response=list[EplanOut], summary="E-Plan döküman listesi")
def list_eplan(
    request,
    proje_id: Optional[int] = None,
    dokuman_tipi: Optional[str] = None,
    onay_durumu: Optional[str] = None,
    seri_no: Optional[str] = None,
):
    qs = EplanDokuman.objects.select_related("proje", "yukleyen", "onaylayan")
    if proje_id:
        qs = qs.filter(proje_id=proje_id)
    if dokuman_tipi:
        qs = qs.filter(dokuman_tipi=dokuman_tipi)
    if onay_durumu:
        qs = qs.filter(onay_durumu=onay_durumu)
    if seri_no:
        qs = qs.filter(seri_no__icontains=seri_no)
    return list(qs)


@router.get("/{dok_id}", response=EplanOut, summary="E-Plan döküman detayı")
def get_eplan(request, dok_id: int):
    return get_object_or_404(
        EplanDokuman.objects.select_related("proje", "yukleyen", "onaylayan"),
        id=dok_id,
    )


@router.post("", response=EplanOut, summary="Yeni E-Plan döküman ekle")
@require_role("admin", "editor")
def create_eplan(
    request,
    seri_no: str = Form(...),
    baslik: str = Form(...),
    dokuman_tipi: str = Form("sema"),
    revizyon_no: str = Form("Rev.0"),
    onay_durumu: str = Form("taslak"),
    aciklama: str = Form(""),
    notlar: str = Form(""),
    proje_id: Optional[int] = Form(None),
    onay_tarihi: Optional[date] = Form(None),
    dosya: Optional[UploadedFile] = File(None),
):
    if EplanDokuman.objects.filter(seri_no=seri_no, revizyon_no=revizyon_no).exists():
        raise HttpError(400, f"{seri_no} / {revizyon_no} kombinasyonu zaten mevcut.")

    yukleyen = get_object_or_404(User, id=request.auth["user_id"])
    dok = EplanDokuman.objects.create(
        seri_no=seri_no,
        baslik=baslik,
        dokuman_tipi=dokuman_tipi,
        revizyon_no=revizyon_no,
        onay_durumu=onay_durumu,
        aciklama=aciklama,
        notlar=notlar,
        proje_id=proje_id,
        onay_tarihi=onay_tarihi,
        yukleyen=yukleyen,
        dosya=dosya,
    )
    return dok


@router.patch("/{dok_id}", response=EplanOut, summary="Durum / not güncelle")
@require_role("admin", "editor")
def patch_eplan(request, dok_id: int, payload: EplanPatch):
    dok = get_object_or_404(EplanDokuman, id=dok_id)
    data = payload.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(dok, field, val)
    dok.save()
    return dok


@router.delete("/{dok_id}", response={200: dict}, summary="E-Plan döküman sil")
@require_role("admin")
def delete_eplan(request, dok_id: int):
    dok = get_object_or_404(EplanDokuman, id=dok_id)
    if dok.dosya:
        try:
            dok.dosya.delete(save=False)
        except Exception:
            pass
    dok.delete()
    return {"detail": "silindi"}

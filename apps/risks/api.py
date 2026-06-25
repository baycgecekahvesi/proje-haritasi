from datetime import datetime, date
from typing import Optional
from django.shortcuts import get_object_or_404
from ninja import Router, Schema
from ninja.errors import HttpError

from apps.accounts.decorators import require_role
from apps.accounts.models import User
from .models import Risk

router = Router()


# ── Schemas ──────────────────────────────────────────────────────────────────

class RiskIn(Schema):
    proje_id: int
    baslik: str
    aciklama: str = ""
    kategori: str = "teknik"
    olasilik: int = 3
    etki: int = 3
    mitigasyon: str = ""
    sorumlu_id: Optional[int] = None
    hedef_tarih: Optional[date] = None
    durum: str = "acik"


class RiskPatch(Schema):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    kategori: Optional[str] = None
    olasilik: Optional[int] = None
    etki: Optional[int] = None
    mitigasyon: Optional[str] = None
    sorumlu_id: Optional[int] = None
    hedef_tarih: Optional[date] = None
    durum: Optional[str] = None


class RiskOut(Schema):
    id: int
    proje_id: int
    proje_adi: str
    baslik: str
    aciklama: str
    kategori: str
    kategori_display: str
    olasilik: int
    etki: int
    skor: int
    seviye: str
    mitigasyon: str
    sorumlu_id: Optional[int]
    sorumlu_username: Optional[str]
    hedef_tarih: Optional[date]
    durum: str
    durum_display: str
    olusturuldu: datetime
    guncellendi: datetime

    @staticmethod
    def resolve_proje_adi(obj) -> str:
        return obj.proje.name

    @staticmethod
    def resolve_kategori_display(obj) -> str:
        return obj.get_kategori_display()

    @staticmethod
    def resolve_durum_display(obj) -> str:
        return obj.get_durum_display()

    @staticmethod
    def resolve_skor(obj) -> int:
        return obj.skor

    @staticmethod
    def resolve_seviye(obj) -> str:
        return obj.seviye

    @staticmethod
    def resolve_sorumlu_username(obj) -> Optional[str]:
        return obj.sorumlu.username if obj.sorumlu_id else None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response=list[RiskOut], summary="Risk listesi")
def list_risks(
    request,
    proje_id: Optional[int] = None,
    durum: Optional[str] = None,
    kategori: Optional[str] = None,
    seviye: Optional[str] = None,
):
    qs = Risk.objects.select_related("proje", "sorumlu")
    if proje_id:
        qs = qs.filter(proje_id=proje_id)
    if durum:
        qs = qs.filter(durum=durum)
    if kategori:
        qs = qs.filter(kategori=kategori)
    risks = list(qs)
    if seviye:
        risks = [r for r in risks if r.seviye == seviye]
    return risks


@router.get("/{risk_id}", response=RiskOut, summary="Risk detayı")
def get_risk(request, risk_id: int):
    return get_object_or_404(Risk.objects.select_related("proje", "sorumlu"), id=risk_id)


@router.post("", response=RiskOut, summary="Yeni risk ekle")
@require_role("admin", "editor")
def create_risk(request, payload: RiskIn):
    if not 1 <= payload.olasilik <= 5:
        raise HttpError(400, "Olasılık 1-5 arasında olmalı")
    if not 1 <= payload.etki <= 5:
        raise HttpError(400, "Etki 1-5 arasında olmalı")
    risk = Risk.objects.create(**payload.model_dump())
    return Risk.objects.select_related("proje", "sorumlu").get(id=risk.id)


@router.patch("/{risk_id}", response=RiskOut, summary="Risk güncelle")
@require_role("admin", "editor")
def patch_risk(request, risk_id: int, payload: RiskPatch):
    risk = get_object_or_404(Risk, id=risk_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(risk, k, v)
    risk.save()
    return Risk.objects.select_related("proje", "sorumlu").get(id=risk.id)


@router.delete("/{risk_id}", response={200: dict}, summary="Risk sil")
@require_role("admin", "editor")
def delete_risk(request, risk_id: int):
    get_object_or_404(Risk, id=risk_id).delete()
    return {"detail": "silindi"}


@router.get("/heatmap/data", response=list[dict], summary="Isı haritası verisi")
def heatmap_data(request, proje_id: Optional[int] = None):
    qs = Risk.objects.select_related("proje")
    if proje_id:
        qs = qs.filter(proje_id=proje_id)
    return [
        {"x": r.olasilik, "y": r.etki, "skor": r.skor,
         "seviye": r.seviye, "baslik": r.baslik,
         "proje": r.proje.name, "durum": r.durum}
        for r in qs if r.durum not in ("kapandi",)
    ]

import csv
import io
from datetime import datetime, date
from typing import Optional
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from apps.accounts.decorators import require_role
from .models import PunchItem

router = Router()


# ── Schemas ───────────────────────────────────────────────────────────────────

class PunchIn(Schema):
    proje_id: int
    tur: str = "fat"
    baslik: str
    aciklama: str = ""
    kategori: str = "diger"
    oncelik: str = "B"
    sorumlu_id: Optional[int] = None
    hedef_tarih: Optional[date] = None
    tespit_tarihi: Optional[date] = None


class PunchPatch(Schema):
    baslik: Optional[str] = None
    aciklama: Optional[str] = None
    kategori: Optional[str] = None
    oncelik: Optional[str] = None
    durum: Optional[str] = None
    sorumlu_id: Optional[int] = None
    hedef_tarih: Optional[date] = None
    kapanma_tarihi: Optional[date] = None
    kapatma_notu: Optional[str] = None
    tespit_tarihi: Optional[date] = None


class PunchOut(Schema):
    id: int
    proje_id: int
    proje_adi: str
    tur: str
    tur_display: str
    no: str
    baslik: str
    aciklama: str
    kategori: str
    kategori_display: str
    oncelik: str
    oncelik_display: str
    durum: str
    durum_display: str
    sorumlu_id: Optional[int]
    sorumlu_username: Optional[str]
    hedef_tarih: Optional[date]
    kapanma_tarihi: Optional[date]
    kapatma_notu: str
    tespit_tarihi: Optional[date]
    olusturuldu: datetime
    guncellendi: datetime

    @staticmethod
    def resolve_proje_adi(obj): return obj.proje.name
    @staticmethod
    def resolve_tur_display(obj): return obj.get_tur_display()
    @staticmethod
    def resolve_kategori_display(obj): return obj.get_kategori_display()
    @staticmethod
    def resolve_oncelik_display(obj): return obj.get_oncelik_display()
    @staticmethod
    def resolve_durum_display(obj): return obj.get_durum_display()
    @staticmethod
    def resolve_sorumlu_username(obj): return obj.sorumlu.username if obj.sorumlu_id else None


class PunchOzet(Schema):
    toplam: int
    acik: int
    devam: int
    kapandi: int
    iptal: int
    kritik_acik: int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response=list[PunchOut], summary="Punch list")
def list_punch(
    request,
    proje_id: Optional[int] = None,
    tur: Optional[str] = None,
    durum: Optional[str] = None,
    oncelik: Optional[str] = None,
    kategori: Optional[str] = None,
):
    qs = PunchItem.objects.select_related("proje", "sorumlu")
    if proje_id:  qs = qs.filter(proje_id=proje_id)
    if tur:       qs = qs.filter(tur=tur)
    if durum:     qs = qs.filter(durum=durum)
    if oncelik:   qs = qs.filter(oncelik=oncelik)
    if kategori:  qs = qs.filter(kategori=kategori)
    return list(qs)


@router.get("/ozet", response=PunchOzet, summary="Punch list özeti")
def punch_ozet(request, proje_id: Optional[int] = None):
    qs = PunchItem.objects.all()
    if proje_id: qs = qs.filter(proje_id=proje_id)
    items = list(qs)
    return PunchOzet(
        toplam=len(items),
        acik=sum(1 for i in items if i.durum == "acik"),
        devam=sum(1 for i in items if i.durum == "devam"),
        kapandi=sum(1 for i in items if i.durum == "kapandi"),
        iptal=sum(1 for i in items if i.durum == "iptal"),
        kritik_acik=sum(1 for i in items if i.durum in ("acik","devam") and i.oncelik == "A"),
    )


@router.get("/export", summary="Punch list CSV export")
def export_punch(
    request,
    proje_id: Optional[int] = None,
    tur: Optional[str] = None,
):
    qs = PunchItem.objects.select_related("proje", "sorumlu")
    if proje_id: qs = qs.filter(proje_id=proje_id)
    if tur:      qs = qs.filter(tur=tur)

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "no", "baslik", "tur", "kategori", "oncelik", "durum",
        "sorumlu", "hedef_tarih", "kapanma_tarihi", "kapatma_notu",
        "proje", "tespit_tarihi",
    ])
    for item in qs:
        writer.writerow([
            item.no,
            item.baslik,
            item.get_tur_display(),
            item.get_kategori_display(),
            item.get_oncelik_display(),
            item.get_durum_display(),
            item.sorumlu.username if item.sorumlu_id else "",
            item.hedef_tarih or "",
            item.kapanma_tarihi or "",
            item.kapatma_notu,
            item.proje.name,
            item.tespit_tarihi or "",
        ])

    response = HttpResponse(buf.getvalue(), content_type="text/csv; charset=utf-8-sig")
    response["Content-Disposition"] = 'attachment; filename="punchlist.csv"'
    return response


@router.get("/{item_id}", response=PunchOut)
def get_punch(request, item_id: int):
    return get_object_or_404(PunchItem.objects.select_related("proje", "sorumlu"), id=item_id)


@router.post("", response=PunchOut, summary="Yeni punch item")
@require_role("admin", "editor")
def create_punch(request, payload: PunchIn):
    item = PunchItem.objects.create(**payload.model_dump())
    return PunchItem.objects.select_related("proje", "sorumlu").get(id=item.id)


@router.patch("/{item_id}", response=PunchOut, summary="Punch item güncelle")
@require_role("admin", "editor")
def patch_punch(request, item_id: int, payload: PunchPatch):
    item = get_object_or_404(PunchItem, id=item_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    item.save()
    return PunchItem.objects.select_related("proje", "sorumlu").get(id=item.id)


@router.delete("/{item_id}", response={200: dict})
@require_role("admin", "editor")
def delete_punch(request, item_id: int):
    get_object_or_404(PunchItem, id=item_id).delete()
    return {"detail": "silindi"}

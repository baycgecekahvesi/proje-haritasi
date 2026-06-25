import csv
import io
from datetime import datetime
from typing import Optional
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from apps.accounts.decorators import require_role
from .models import IOPoint

router = Router()


# ── Schemas ───────────────────────────────────────────────────────────────────

class IOIn(Schema):
    proje_id: int
    tag_no: str
    tanim: str
    sinyal_tipi: str
    proses_deger: str = ""
    plc_rack: str = ""
    plc_slot: str = ""
    plc_kanal: str = ""
    panel_no: str = ""
    klemens_no: str = ""
    kablo_no: str = ""
    alan_cihaz: str = ""
    sil_seviye: str = ""
    notlar: str = ""
    durum: str = "taslak"
    kablo_durum: str = "bekliyor"


class IOPatch(Schema):
    tanim: Optional[str] = None
    sinyal_tipi: Optional[str] = None
    proses_deger: Optional[str] = None
    plc_rack: Optional[str] = None
    plc_slot: Optional[str] = None
    plc_kanal: Optional[str] = None
    panel_no: Optional[str] = None
    klemens_no: Optional[str] = None
    kablo_no: Optional[str] = None
    alan_cihaz: Optional[str] = None
    sil_seviye: Optional[str] = None
    notlar: Optional[str] = None
    durum: Optional[str] = None
    kablo_durum: Optional[str] = None


class IOOut(Schema):
    id: int
    proje_id: int
    proje_adi: str
    tag_no: str
    tanim: str
    sinyal_tipi: str
    sinyal_tipi_display: str
    proses_deger: str
    plc_rack: str
    plc_slot: str
    plc_kanal: str
    panel_no: str
    klemens_no: str
    kablo_no: str
    alan_cihaz: str
    sil_seviye: str
    notlar: str
    durum: str
    durum_display: str
    kablo_durum: str
    kablo_durum_display: str
    olusturuldu: datetime
    guncellendi: datetime

    @staticmethod
    def resolve_proje_adi(obj): return obj.proje.name
    @staticmethod
    def resolve_sinyal_tipi_display(obj): return obj.get_sinyal_tipi_display()
    @staticmethod
    def resolve_durum_display(obj): return obj.get_durum_display()
    @staticmethod
    def resolve_kablo_durum_display(obj): return obj.get_kablo_durum_display()


class IOOzet(Schema):
    toplam: int
    di: int
    do_: int
    ai: int
    ao: int
    diger: int
    kablo_test_ok: int
    kablo_bekliyor: int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response=list[IOOut], summary="I/O listesi")
def list_io(
    request,
    proje_id: Optional[int] = None,
    sinyal_tipi: Optional[str] = None,
    durum: Optional[str] = None,
    kablo_durum: Optional[str] = None,
    q: Optional[str] = None,
):
    qs = IOPoint.objects.select_related("proje")
    if proje_id:    qs = qs.filter(proje_id=proje_id)
    if sinyal_tipi: qs = qs.filter(sinyal_tipi=sinyal_tipi)
    if durum:       qs = qs.filter(durum=durum)
    if kablo_durum: qs = qs.filter(kablo_durum=kablo_durum)
    if q:
        from django.db.models import Q
        qs = qs.filter(Q(tag_no__icontains=q) | Q(tanim__icontains=q) | Q(alan_cihaz__icontains=q))
    return list(qs)


@router.get("/ozet", response=IOOzet, summary="I/O özet istatistikleri")
def io_ozet(request, proje_id: Optional[int] = None):
    qs = IOPoint.objects.all()
    if proje_id: qs = qs.filter(proje_id=proje_id)
    items = list(qs)
    return IOOzet(
        toplam=len(items),
        di=sum(1 for i in items if i.sinyal_tipi == "DI"),
        do_=sum(1 for i in items if i.sinyal_tipi == "DO"),
        ai=sum(1 for i in items if i.sinyal_tipi == "AI"),
        ao=sum(1 for i in items if i.sinyal_tipi == "AO"),
        diger=sum(1 for i in items if i.sinyal_tipi not in ("DI","DO","AI","AO")),
        kablo_test_ok=sum(1 for i in items if i.kablo_durum == "test_ok"),
        kablo_bekliyor=sum(1 for i in items if i.kablo_durum in ("bekliyor","cekildi")),
    )


@router.get("/export", summary="I/O listesi CSV export")
def export_io(
    request,
    proje_id: Optional[int] = None,
    sinyal_tipi: Optional[str] = None,
):
    qs = IOPoint.objects.select_related("proje")
    if proje_id:    qs = qs.filter(proje_id=proje_id)
    if sinyal_tipi: qs = qs.filter(sinyal_tipi=sinyal_tipi)

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "tag_no", "tanim", "sinyal_tipi", "plc_rack", "plc_slot", "plc_kanal",
        "panel_no", "klemens_no", "kablo_no", "alan_cihaz", "sil_seviye",
        "durum", "kablo_durum", "proje", "notlar",
    ])
    for item in qs:
        writer.writerow([
            item.tag_no,
            item.tanim,
            item.get_sinyal_tipi_display(),
            item.plc_rack,
            item.plc_slot,
            item.plc_kanal,
            item.panel_no,
            item.klemens_no,
            item.kablo_no,
            item.alan_cihaz,
            item.sil_seviye,
            item.get_durum_display(),
            item.get_kablo_durum_display(),
            item.proje.name,
            item.notlar,
        ])

    response = HttpResponse(buf.getvalue(), content_type="text/csv; charset=utf-8-sig")
    response["Content-Disposition"] = 'attachment; filename="iolist.csv"'
    return response


@router.get("/{io_id}", response=IOOut)
def get_io(request, io_id: int):
    return get_object_or_404(IOPoint.objects.select_related("proje"), id=io_id)


@router.post("", response=IOOut, summary="Yeni I/O noktası")
@require_role("admin", "editor")
def create_io(request, payload: IOIn):
    item = IOPoint.objects.create(**payload.model_dump())
    return IOPoint.objects.select_related("proje").get(id=item.id)


@router.patch("/{io_id}", response=IOOut, summary="I/O noktası güncelle")
@require_role("admin", "editor")
def patch_io(request, io_id: int, payload: IOPatch):
    item = get_object_or_404(IOPoint, id=io_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    item.save()
    return IOPoint.objects.select_related("proje").get(id=item.id)


@router.delete("/{io_id}", response={200: dict})
@require_role("admin", "editor")
def delete_io(request, io_id: int):
    get_object_or_404(IOPoint, id=io_id).delete()
    return {"detail": "silindi"}

from typing import List, Optional

from django.db import transaction
from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from .models import GorevDurumu, ProjeGorev, ReferansDoc, RoleSkill, TaskTemplate
from .schemas import (
    EkosistemOut,
    GorevDurumuOut,
    ProjeGorevGuncelleIn,
    ProjeGorevEkleIn,
    ProjeGorevOut,
    ReferansDocListOut,
    ReferansDocOut,
    RoleSkillListOut,
    RoleSkillOut,
    TaskTemplateOut,
)

router = Router()


def _bildirim_olustur(alici_user, baslik: str, mesaj: str, gorev_id: str = ""):
    from apps.accounts.models import Bildirim
    Bildirim.objects.create(alici=alici_user, baslik=baslik, mesaj=mesaj, gorev_id=gorev_id)

# proje_fazlari JSON'dan türetilmiştir; TaskTemplate.Faz ile senkron tutulur
PROJE_FAZLARI = [
    "Başlangıç", "Planlama", "Tasarım", "Tedarik", "Geliştirme",
    "Entegrasyon", "Test", "Devreye Alma", "Kabul", "Yürütme", "Kapanış",
]


def _task_template_out(t: TaskTemplate) -> TaskTemplateOut:
    return TaskTemplateOut(
        gorev_id=t.gorev_id,
        gorev_sira=t.gorev_sira,
        gorev_adi=t.gorev_adi,
        faz=t.faz,
        min_gun=float(t.min_gun),
        max_gun=float(t.max_gun),
        onkosullar=t.onkosullar,
        teslimati=t.teslimati,
        tekrar=t.tekrar,
    )


@router.get("", response=EkosistemOut, summary="Ekosistem özeti (roller, durumlar, fazlar)")
def get_ekosistem(request):
    """skill-ekosistemi.json'un tamamını özetleyen tek endpoint."""
    roller = RoleSkill.objects.prefetch_related("gorev_sablonlari").all()
    return EkosistemOut(
        roller=[
            RoleSkillListOut(
                rol_id=r.rol_id,
                rol_adi=r.rol_adi,
                renk_kodu=r.renk_kodu,
                ikon=r.ikon,
                gorev_sayisi=r.gorev_sablonlari.count(),
            )
            for r in roller
        ],
        gorev_durumlari=list(GorevDurumu.objects.all()),
        proje_fazlari=PROJE_FAZLARI,
    )


@router.get("/roles", response=List[RoleSkillListOut], summary="Tüm roller")
def list_roles(request):
    roller = RoleSkill.objects.prefetch_related("gorev_sablonlari").all()
    return [
        RoleSkillListOut(
            rol_id=r.rol_id,
            rol_adi=r.rol_adi,
            renk_kodu=r.renk_kodu,
            ikon=r.ikon,
            gorev_sayisi=r.gorev_sablonlari.count(),
        )
        for r in roller
    ]


@router.get("/roles/{rol_id}", response=RoleSkillOut, summary="Rol detayı ve görev şablonları")
def get_role(request, rol_id: str):
    rol = get_object_or_404(
        RoleSkill.objects.prefetch_related("gorev_sablonlari"), rol_id=rol_id
    )
    return RoleSkillOut(
        rol_id=rol.rol_id,
        rol_adi=rol.rol_adi,
        renk_kodu=rol.renk_kodu,
        ikon=rol.ikon,
        sorumluluklar=rol.sorumluluklar,
        yetkinlikler=rol.yetkinlikler,
        durum_alanlari=rol.durum_alanlari,
        gorev_sablonlari=[_task_template_out(t) for t in rol.gorev_sablonlari.all()],
    )


@router.get("/roles/{rol_id}/skill-content", response=dict, summary="SKILL.md ham içeriği")
def get_skill_content(request, rol_id: str):
    rol = get_object_or_404(RoleSkill, rol_id=rol_id)
    return {"rol_id": rol.rol_id, "icerik": rol.skill_icerik}


@router.get("/statuses", response=List[GorevDurumuOut], summary="Görev durumu tanımları")
def list_statuses(request):
    return list(GorevDurumu.objects.all())


@router.get("/phases", response=List[str], summary="Proje fazları")
def list_phases(request):
    return PROJE_FAZLARI


# --- Referans Dokümanlar ---

def _referans_list_out(d: ReferansDoc) -> ReferansDocListOut:
    return ReferansDocListOut(
        slug=d.slug,
        baslik=d.baslik,
        standart=d.standart,
        revizyon=d.revizyon,
        rol_id=d.rol.rol_id,
    )


@router.get("/references", response=List[ReferansDocListOut], summary="Tüm referans dokümanlar")
def list_references(request):
    return [_referans_list_out(d) for d in ReferansDoc.objects.select_related("rol").all()]


@router.get("/references/{slug}", response=ReferansDocOut, summary="Referans doküman detayı")
def get_reference(request, slug: str):
    doc = get_object_or_404(ReferansDoc.objects.select_related("rol"), slug=slug)
    return ReferansDocOut(
        slug=doc.slug,
        baslik=doc.baslik,
        standart=doc.standart,
        revizyon=doc.revizyon,
        rol_id=doc.rol.rol_id,
        icerik=doc.icerik,
    )


@router.get(
    "/roles/{rol_id}/references",
    response=List[ReferansDocListOut],
    summary="Role ait referans dokümanlar",
)
def list_role_references(request, rol_id: str):
    rol = get_object_or_404(RoleSkill, rol_id=rol_id)
    return [_referans_list_out(d) for d in rol.referans_dokumanlar.all()]


# --- Proje Görevleri ---

def _gorev_out(g: ProjeGorev) -> ProjeGorevOut:
    atanan = g.atanan
    atanan_adi = None
    if atanan:
        parts = [atanan.first_name, atanan.last_name]
        atanan_adi = " ".join(p for p in parts if p) or atanan.username
    return ProjeGorevOut(
        gorev_id=g.gorev_id,
        rol=g.rol,
        gorev_adi=g.gorev_adi,
        faz=g.faz,
        gun=g.gun,
        onk=g.onk,
        teslim=g.teslim,
        baslangic_gun=g.baslangic_gun,
        durum=g.durum,
        tamamlanma=g.tamamlanma,
        not_metni=g.not_metni,
        atanan_id=atanan.id if atanan else None,
        atanan_adi=atanan_adi,
    )


@router.get("/tasks/benim", response=List[ProjeGorevOut], summary="Bana atanan görevler")
def my_tasks(request):
    user_id = request.auth["user_id"]
    return [_gorev_out(g) for g in ProjeGorev.objects.select_related("atanan").filter(atanan_id=user_id)]


@router.get("/tasks", response=List[ProjeGorevOut], summary="Tüm proje görevleri")
def list_tasks(request, limit: int = 200, offset: int = 0):
    qs = ProjeGorev.objects.select_related("atanan").all()[offset: offset + limit]
    return [_gorev_out(g) for g in qs]


@router.patch("/tasks/{gorev_id}", response=ProjeGorevOut, summary="Görev durumu güncelle")
@require_role("admin", "editor")
def update_task(request, gorev_id: str, data: ProjeGorevGuncelleIn):
    g = get_object_or_404(ProjeGorev.objects.select_related("atanan"), gorev_id=gorev_id)
    eski_durum = g.durum
    eski_atanan = g.atanan

    if data.durum is not None:
        g.durum = data.durum
    if data.tamamlanma is not None:
        g.tamamlanma = data.tamamlanma
    if data.not_metni is not None:
        g.not_metni = data.not_metni
    if data.atanan_id is not None:
        from apps.accounts.models import User as AccountUser
        if data.atanan_id == 0:
            g.atanan = None
        else:
            g.atanan = AccountUser.objects.filter(id=data.atanan_id).first()

    g.save()

    # Durum değişince atanana bildirim
    if data.durum is not None and data.durum != eski_durum and g.atanan:
        _bildirim_olustur(
            g.atanan,
            f"Görev durumu güncellendi: {g.gorev_adi}",
            f"{g.gorev_id} görevi '{eski_durum}' → '{g.durum}' olarak güncellendi.",
            g.gorev_id,
        )

    # Yeni kişi atanınca bildirim
    if data.atanan_id is not None and g.atanan and g.atanan != eski_atanan:
        _bildirim_olustur(
            g.atanan,
            f"Size görev atandı: {g.gorev_adi}",
            f"{g.gorev_id} görevi size atandı. Durum: {g.durum}",
            g.gorev_id,
        )

    return _gorev_out(g)


@router.post("/tasks", response=ProjeGorevOut, summary="Yeni görev ekle")
@require_role("admin", "editor")
def create_task(request, data: ProjeGorevEkleIn):
    import re
    from apps.accounts.models import User as AccountUser

    prefix = data.rol.upper()
    atanan = None
    if data.atanan_id:
        atanan = AccountUser.objects.filter(id=data.atanan_id).first()

    with transaction.atomic():
        existing_tasks = ProjeGorev.objects.select_for_update().filter(rol=prefix)
        max_num = 0
        for task in existing_tasks:
            match = re.match(r"^" + re.escape(prefix) + r"-(\d+)$", task.gorev_id, re.IGNORECASE)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
        new_id = f"{prefix}-{max_num + 1:03d}"

    task = ProjeGorev.objects.create(
        gorev_id=new_id,
        rol=prefix,
        gorev_adi=data.gorev_adi,
        faz=data.faz,
        gun=data.gun,
        onk=data.onk or [],
        teslim=data.teslim or "",
        baslangic_gun=data.baslangic_gun or 0,
        durum=data.durum or "Planlandı",
        tamamlanma=data.tamamlanma or 0,
        not_metni=data.not_metni or "",
        atanan=atanan,
    )

    if atanan:
        _bildirim_olustur(
            atanan,
            f"Size yeni görev atandı: {task.gorev_adi}",
            f"{task.gorev_id} — {task.faz} fazında {task.gun} günlük görev oluşturuldu.",
            task.gorev_id,
        )

    return _gorev_out(task)


@router.delete("/tasks/{gorev_id}", response={200: dict}, summary="Görev sil")
@require_role("admin", "editor")
def delete_task(request, gorev_id: str):
    task = get_object_or_404(ProjeGorev, gorev_id=gorev_id)
    task.delete()
    return {"detail": "Görev başarıyla silindi."}


# --- Ajan Raporu ---

@router.get("/agents/report", summary="PM Koordinatör + Risk/QA ajan raporu")
def agents_report(request):
    from apps.agents.engine import run_all
    return run_all()

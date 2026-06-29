from ninja import Router
from django.shortcuts import get_object_or_404
from typing import Optional

from .schemas import CalcRequest, CalcResult, SaveCalcIn, SavedCalcOut
from . import services
from .models import SavedCalculation

router = Router()


@router.get("/types", response=dict, auth=None)
def get_calc_types(request):
    """Desteklenen hesaplama türlerini listele."""
    return services.list_calc_types()


@router.post("/run", response=CalcResult)
def run_calculation(request, payload: CalcRequest):
    """Hesaplama çalıştır (kaydetmeden)."""
    return services.run_calculation(payload.calc_type, payload.inputs)


@router.post("/save", response={200: SavedCalcOut})
def save_calculation(request, payload: SaveCalcIn):
    """Hesaplama sonucunu kaydet."""
    auth = getattr(request, "auth", {}) or {}
    calc = SavedCalculation.objects.create(
        user_id=auth["user_id"],
        project_id=payload.project_id,
        category=payload.category,
        calc_type=payload.calc_type,
        title=payload.title,
        inputs=payload.inputs,
        result=payload.result,
        notes=payload.notes,
    )
    return calc


@router.get("/history", response=list[SavedCalcOut])
def get_history(request, category: Optional[str] = None, project_id: Optional[int] = None):
    """Kullanıcının kayıtlı hesaplamalarını listele."""
    auth = getattr(request, "auth", {}) or {}
    qs = SavedCalculation.objects.filter(user_id=auth["user_id"])
    if category:
        qs = qs.filter(category=category)
    if project_id:
        qs = qs.filter(project_id=project_id)
    return list(qs[:50])


@router.delete("/history/{calc_id}", response={200: dict})
def delete_saved_calculation(request, calc_id: int):
    auth = getattr(request, "auth", {}) or {}
    calc = get_object_or_404(SavedCalculation, id=calc_id, user_id=auth["user_id"])
    calc.delete()
    return {"detail": "Hesaplama silindi"}

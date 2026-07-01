from django.shortcuts import get_object_or_404
from ninja import Router

from apps.accounts.decorators import require_role
from apps.projects.models import Project

from .models import Budget, BudgetLine, Expense
from .schemas import BudgetLineIn, BudgetLinePatch, BudgetLineOut, BudgetOut, BudgetPatch, ExpenseIn, ExpenseOut

router = Router()


def _get_or_create_budget(project_id: int) -> Budget:
    project = get_object_or_404(Project, id=project_id)
    budget, _ = Budget.objects.get_or_create(project=project)
    return budget


@router.get("/{project_id}", response=BudgetOut)
def get_budget(request, project_id: int):
    """Proje bütçesini getir (yoksa boş bütçe oluşturur)."""
    budget = _get_or_create_budget(project_id)
    budget = Budget.objects.prefetch_related("expenses", "lines").get(id=budget.id)
    return budget


@router.patch("/{project_id}", response=BudgetOut)
@require_role("admin", "editor")
def update_budget(request, project_id: int, payload: BudgetPatch):
    budget = _get_or_create_budget(project_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    budget.save()
    return Budget.objects.prefetch_related("expenses", "lines").get(id=budget.id)


@router.get("/{project_id}/lines", response=list[BudgetLineOut])
def list_lines(request, project_id: int):
    """Bütçe kalemlerini listele."""
    budget = _get_or_create_budget(project_id)
    return budget.lines.all()


@router.post("/{project_id}/lines", response={200: BudgetLineOut})
@require_role("admin", "editor")
def add_line(request, project_id: int, payload: BudgetLineIn):
    """Yeni bütçe kalemi ekle."""
    budget = _get_or_create_budget(project_id)
    return BudgetLine.objects.create(budget=budget, **payload.model_dump())


@router.patch("/{project_id}/lines/{line_id}", response={200: BudgetLineOut})
@require_role("admin", "editor")
def update_line(request, project_id: int, line_id: int, payload: BudgetLinePatch):
    """Bütçe kalemini güncelle."""
    line = get_object_or_404(BudgetLine, id=line_id, budget__project_id=project_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(line, field, value)
    line.save()
    return line


@router.delete("/{project_id}/lines/{line_id}", response={200: dict})
@require_role("admin", "editor")
def delete_line(request, project_id: int, line_id: int):
    """Bütçe kalemini sil."""
    line = get_object_or_404(BudgetLine, id=line_id, budget__project_id=project_id)
    line.delete()
    return {"detail": "Kalem silindi"}


@router.post("/{project_id}/expenses", response={200: ExpenseOut})
@require_role("admin", "editor")
def add_expense(request, project_id: int, payload: ExpenseIn):
    budget = _get_or_create_budget(project_id)
    return Expense.objects.create(budget=budget, **payload.model_dump())


@router.delete("/{project_id}/expenses/{expense_id}", response={200: dict})
@require_role("admin", "editor")
def delete_expense(request, project_id: int, expense_id: int):
    expense = get_object_or_404(
        Expense, id=expense_id, budget__project_id=project_id
    )
    expense.delete()
    return {"detail": "Harcama silindi"}

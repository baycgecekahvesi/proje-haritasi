from ninja import Router

from . import services
from .schemas import (
    BudgetOverviewOut,
    GanttItemOut,
    ProvinceStatOut,
    SummaryOut,
    TimelineItemOut,
)

router = Router()


@router.get("/summary", response=SummaryOut)
def report_summary(request):
    return services.summary()


@router.get("/by-province", response=list[ProvinceStatOut])
def report_by_province(request):
    return services.by_province()


@router.get("/budget-overview", response=BudgetOverviewOut)
def report_budget_overview(request):
    return services.budget_overview()


@router.get("/timeline", response=list[TimelineItemOut])
def report_timeline(request):
    return services.timeline()


@router.get("/gantt", response=list[GanttItemOut])
def report_gantt(request):
    return services.gantt()

from ninja import Router

from . import services
from .schemas import (
    BudgetByProvinceOut,
    BudgetOverviewOut,
    GanttItemOut,
    MonthlyActivityOut,
    ProgressBucketOut,
    ProvinceStatOut,
    StatusDistOut,
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


@router.get("/progress-buckets", response=list[ProgressBucketOut])
def report_progress_buckets(request):
    return services.progress_buckets()


@router.get("/monthly-activity", response=list[MonthlyActivityOut])
def report_monthly_activity(request):
    return services.monthly_activity()


@router.get("/budget-by-province", response=list[BudgetByProvinceOut])
def report_budget_by_province(request):
    return services.budget_by_province()


@router.get("/status-distribution", response=list[StatusDistOut])
def report_status_distribution(request):
    return services.status_distribution()

from django.http import HttpResponse
from ninja import Router

from . import export_service, services
from .schemas import (
    BudgetByProvinceOut,
    BudgetOverviewOut,
    GanttItemOut,
    KpiDashboardOut,
    MonthlyActivityOut,
    ProgressBucketOut,
    ProvinceStatOut,
    SCurvePointOut,
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


@router.get("/dashboard/kpi", response=KpiDashboardOut)
def kpi_dashboard(request):
    return services.kpi_dashboard()


@router.get("/projects/{project_id}/s-curve", response=list[SCurvePointOut])
def project_s_curve(request, project_id: int):
    from django.shortcuts import get_object_or_404
    from apps.projects.models import Project
    get_object_or_404(Project, id=project_id)
    return services.s_curve(project_id)


@router.get("/export/excel")
def export_excel(request, project_id: int = None):
    data = export_service.generate_summary_excel(project_id)
    resp = HttpResponse(
        data,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    filename = f"proje-raporu-{project_id}.xlsx" if project_id else "projeler-ozet.xlsx"
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    return resp


@router.get("/export/pdf")
def export_pdf(request, project_id: int = None):
    data = export_service.generate_summary_pdf(project_id)
    resp = HttpResponse(data, content_type="application/pdf")
    filename = f"proje-raporu-{project_id}.pdf" if project_id else "projeler-ozet.pdf"
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    return resp

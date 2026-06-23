"""
Raporlama hesaplama mantığı — N+1 sorgudan kaçınmak için aggregate kullanır.
"""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, DecimalField, F, Q, Sum
from django.db.models.functions import Coalesce, TruncMonth

from apps.budget.models import Budget
from apps.projects.models import Project, ProjectStatus


def summary() -> dict:
    """Genel özet: toplam / aktif / tamamlanan / geciken proje sayıları."""
    today = date.today()
    counts = Project.objects.aggregate(
        total=Count("id"),
        active=Count("id", filter=Q(status=ProjectStatus.ACTIVE)),
        pending=Count("id", filter=Q(status=ProjectStatus.PENDING)),
        completed=Count("id", filter=Q(status=ProjectStatus.COMPLETED)),
        cancelled=Count("id", filter=Q(status=ProjectStatus.CANCELLED)),
        avg_progress=Avg("progress"),
    )

    delayed = (
        Project.objects.filter(planned_end__lt=today)
        .exclude(status=ProjectStatus.COMPLETED)
        .exclude(planned_end__isnull=True)
        .count()
    )

    return {
        "total_projects": counts["total"] or 0,
        "active_projects": counts["active"] or 0,
        "pending_projects": counts["pending"] or 0,
        "completed_projects": counts["completed"] or 0,
        "cancelled_projects": counts["cancelled"] or 0,
        "delayed_projects": delayed,
        "avg_progress": round(counts["avg_progress"] or 0, 1),
    }


def by_province() -> list[dict]:
    """İl bazlı proje dağılımı."""
    rows = (
        Project.objects.values("province")
        .annotate(
            project_count=Count("id"),
            avg_progress=Avg("progress"),
        )
        .order_by("-project_count")
    )
    return [
        {
            "province": r["province"],
            "project_count": r["project_count"],
            "avg_progress": round(r["avg_progress"] or 0, 1),
        }
        for r in rows
    ]


def budget_overview() -> dict:
    """Toplam planlanan bütçe, toplam harcama ve bütçe aşan projeler."""
    money = DecimalField(max_digits=18, decimal_places=2)

    totals = Budget.objects.aggregate(
        total_planned=Coalesce(Sum("planned_amount"), Decimal("0"), output_field=money),
        total_spent=Coalesce(
            Sum("expenses__amount"), Decimal("0"), output_field=money
        ),
    )
    total_planned = totals["total_planned"] or Decimal("0")
    total_spent = totals["total_spent"] or Decimal("0")

    # Bütçe aşan projeler
    over = []
    budgets = (
        Budget.objects.select_related("project")
        .annotate(
            spent=Coalesce(
                Sum("expenses__amount"), Decimal("0"), output_field=money
            )
        )
        .filter(spent__gt=F("planned_amount"))
    )
    for b in budgets:
        over.append(
            {
                "project_id": b.project_id,
                "project_name": b.project.name,
                "planned_amount": b.planned_amount,
                "spent": b.spent,
                "overage": b.spent - b.planned_amount,
                "currency": b.currency,
            }
        )

    usage_percent = (
        round(float(total_spent) / float(total_planned) * 100, 1)
        if total_planned
        else 0
    )

    return {
        "total_planned": total_planned,
        "total_spent": total_spent,
        "total_remaining": total_planned - total_spent,
        "usage_percent": usage_percent,
        "over_budget_count": len(over),
        "over_budget_projects": over,
    }


def gantt() -> list[dict]:
    """Tüm tarihli projeler — Gantt çizelgesi için."""
    projects = (
        Project.objects.exclude(planned_start=None)
        .exclude(planned_end=None)
        .order_by("planned_start")
    )
    return [
        {
            "project_id": p.id,
            "project_name": p.name,
            "province": p.province,
            "status": p.status,
            "progress": p.progress,
            "planned_start": p.planned_start,
            "planned_end": p.planned_end,
            "actual_start": p.actual_start,
            "actual_end": p.actual_end,
            "is_delayed": p.is_delayed,
        }
        for p in projects
    ]


def progress_buckets() -> list[dict]:
    """Projeleri ilerleme yüzdesine göre gruplar: 0-25, 25-50, 50-75, 75-99, 100."""
    buckets = [
        {"label": "0–25%",   "min": 0,   "max": 25},
        {"label": "25–50%",  "min": 25,  "max": 50},
        {"label": "50–75%",  "min": 50,  "max": 75},
        {"label": "75–99%",  "min": 75,  "max": 99},
        {"label": "Tamamlandı", "min": 100, "max": 100},
    ]
    result = []
    for b in buckets:
        if b["min"] == b["max"]:
            count = Project.objects.filter(progress=100).count()
        else:
            count = Project.objects.filter(
                progress__gte=b["min"], progress__lt=b["max"] + 1
            ).count()
        result.append({"label": b["label"], "count": count})
    return result


def monthly_activity() -> list[dict]:
    """Son 12 ayın başlangıç ve tamamlanma proje sayıları."""
    today = date.today()
    twelve_months_ago = today.replace(day=1) - timedelta(days=365)

    started = (
        Project.objects.filter(actual_start__gte=twelve_months_ago)
        .annotate(month=TruncMonth("actual_start"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    completed = (
        Project.objects.filter(
            actual_end__gte=twelve_months_ago,
            status=ProjectStatus.COMPLETED,
        )
        .annotate(month=TruncMonth("actual_end"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    started_map  = {r["month"].strftime("%Y-%m"): r["count"] for r in started}
    completed_map = {r["month"].strftime("%Y-%m"): r["count"] for r in completed}

    months = []
    cur = twelve_months_ago
    while cur <= today:
        key = cur.strftime("%Y-%m")
        months.append({
            "month": key,
            "started": started_map.get(key, 0),
            "completed": completed_map.get(key, 0),
        })
        # Sonraki ay
        if cur.month == 12:
            cur = cur.replace(year=cur.year + 1, month=1)
        else:
            cur = cur.replace(month=cur.month + 1)
    return months


def budget_by_province() -> list[dict]:
    """İl bazlı toplam planlanan ve harcanan bütçe."""
    money = DecimalField(max_digits=18, decimal_places=2)
    rows = (
        Budget.objects.select_related("project")
        .values("project__province")
        .annotate(
            planned=Coalesce(Sum("planned_amount"), Decimal("0"), output_field=money),
            spent=Coalesce(Sum("expenses__amount"), Decimal("0"), output_field=money),
        )
        .order_by("-planned")
    )
    return [
        {
            "province": r["project__province"],
            "planned": r["planned"],
            "spent": r["spent"],
            "usage_pct": round(float(r["spent"]) / float(r["planned"]) * 100, 1)
            if r["planned"] else 0,
        }
        for r in rows
    ]


def status_distribution() -> list[dict]:
    """Durum bazlı proje sayısı ve yüzdesi."""
    total = Project.objects.count() or 1
    rows = (
        Project.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    labels = {
        ProjectStatus.ACTIVE:    "Aktif",
        ProjectStatus.PENDING:   "Beklemede",
        ProjectStatus.COMPLETED: "Tamamlandı",
        ProjectStatus.CANCELLED: "İptal",
    }
    return [
        {
            "status": r["status"],
            "label": labels.get(r["status"], r["status"]),
            "count": r["count"],
            "pct": round(r["count"] / total * 100, 1),
        }
        for r in rows
    ]


def timeline() -> list[dict]:
    """Geciken projeler: planlanan vs gerçek bitiş, gecikme günü."""
    today = date.today()
    projects = (
        Project.objects.exclude(planned_end__isnull=True)
        .select_related("owner")
        .order_by("planned_end")
    )

    result = []
    for p in projects:
        is_delayed = p.is_delayed
        delay_days = p.delay_days
        if not is_delayed and delay_days == 0:
            continue
        result.append(
            {
                "project_id": p.id,
                "project_name": p.name,
                "province": p.province,
                "status": p.status,
                "status_display": p.get_status_display(),
                "planned_end": p.planned_end,
                "actual_end": p.actual_end,
                "is_delayed": is_delayed,
                "delay_days": delay_days,
                "progress": p.progress,
            }
        )
    return result

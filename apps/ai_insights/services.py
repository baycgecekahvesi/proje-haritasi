from __future__ import annotations
from datetime import date
from typing import Optional

# ProjectStatus.COMPLETED = "tamamlandi"
_COMPLETED_STATUS = "tamamlandi"


def _get_project(project_id: int):
    from apps.projects.models import Project
    from django.shortcuts import get_object_or_404
    return get_object_or_404(
        Project.objects.select_related("category").prefetch_related("tasks"),
        id=project_id,
    )


def delay_risk(project_id: int) -> dict:
    project = _get_project(project_id)
    today = date.today()
    factors: list[str] = []
    score = 0.0

    # Gecikmiş mi?
    if (
        project.planned_end
        and project.status != _COMPLETED_STATUS
        and today > project.planned_end
    ):
        score += 0.40
        days_late = (today - project.planned_end).days
        factors.append(f"Proje planlı bitiş tarihini {days_late} gün geçti")

    # Zaman bazlı ilerleme farkı
    tasks = list(project.tasks.all())
    total_tasks = len(tasks)
    done_tasks = sum(1 for t in tasks if t.is_done)
    if total_tasks > 0 and project.planned_start and project.planned_end:
        total_days = max(1, (project.planned_end - project.planned_start).days)
        elapsed_days = (today - project.planned_start).days
        expected_pct = min(1.0, elapsed_days / total_days)
        completion_rate = done_tasks / total_tasks
        lag = expected_pct - completion_rate
        if lag > 0.20:
            score += min(0.25, lag)
            factors.append(
                f"Beklenen ilerleme %{round(expected_pct*100)} ama "
                f"gerçekleşen %{round(completion_rate*100)} — %{round(lag*100)} geride"
            )

    # Gecikmiş görevler
    overdue = [t for t in tasks if t.due_date and not t.is_done and today > t.due_date]
    if overdue:
        score += min(0.20, len(overdue) / max(total_tasks, 1) * 0.30)
        factors.append(f"{len(overdue)} gecikmiş görev var")

    # Yüksek riskler (Risk modeli Türkçe alan adları: proje, durum, olasilik, etki)
    try:
        from apps.risks.models import Risk
        high_risks = Risk.objects.filter(
            proje=project,
            durum="acik",
            olasilik__gte=4,
            etki__gte=4,
        ).count()
        if high_risks:
            score += min(0.15, high_risks * 0.05)
            factors.append(f"{high_risks} yüksek seviyeli açık risk mevcut")
    except Exception:
        pass

    score = min(1.0, score)
    if score < 0.30:
        risk_level = "low"
        recommendation = "Proje yolunda görünüyor. Haftalık takip yeterli."
    elif score < 0.60:
        risk_level = "medium"
        recommendation = "Dikkat gerektiriyor. Gecikmiş görevleri önceliklendirin."
    else:
        risk_level = "high"
        recommendation = "Kritik seviye. Proje müdürü acil aksiyon planı oluşturmalı."

    if not factors:
        factors.append("Belirgin gecikme sinyali tespit edilmedi")

    return {
        "project_id": project.id,
        "project_name": project.name,
        "delay_probability": round(score, 3),
        "risk_level": risk_level,
        "explanation": factors,
        "recommendation": recommendation,
    }


def budget_forecast(project_id: int) -> dict:
    project = _get_project(project_id)
    today = date.today()

    # Budget.planned_amount, Expense budget FK üzerinden bağlı
    total = 0.0
    spent = 0.0
    try:
        from django.db.models import Sum
        from apps.budget.models import Budget, Expense
        b = Budget.objects.filter(project=project).first()
        if b:
            total = float(b.planned_amount)
            result = Expense.objects.filter(budget=b).aggregate(s=Sum("amount"))
            spent = float(result["s"] or 0)
    except Exception:
        pass

    burn_rate = 0.0
    if project.planned_start:
        days_elapsed = max(1, (today - project.planned_start).days)
        burn_rate = spent / days_elapsed if spent else 0.0

    remaining = total - spent
    days_until_exhausted: Optional[int] = None
    if burn_rate > 0 and remaining > 0:
        days_until_exhausted = int(remaining / burn_rate)
    elif remaining <= 0 and total > 0:
        days_until_exhausted = 0

    forecast_overrun = False
    forecast_overrun_pct = 0.0
    explanation = ""
    if project.planned_end and burn_rate > 0 and total > 0:
        days_remaining = max(0, (project.planned_end - today).days)
        projected = spent + burn_rate * days_remaining
        if projected > total:
            forecast_overrun = True
            forecast_overrun_pct = round((projected - total) / total * 100, 1)
            explanation = (
                f"Mevcut harcama hızıyla ({burn_rate:.0f} ₺/gün) "
                f"bütçe %{forecast_overrun_pct} aşılacak."
            )
        else:
            explanation = (
                f"Mevcut harcama hızıyla ({burn_rate:.0f} ₺/gün) "
                f"bütçe dahilinde kalınması bekleniyor."
            )
    elif burn_rate == 0:
        explanation = "Henüz harcama verisi yok, tahmin yapılamıyor."
    else:
        explanation = f"Günlük ortalama harcama: {burn_rate:.0f} ₺."

    return {
        "project_id": project.id,
        "project_name": project.name,
        "total_budget": total,
        "spent_so_far": spent,
        "burn_rate_per_day": round(burn_rate, 2),
        "days_until_exhausted": days_until_exhausted,
        "forecast_overrun": forecast_overrun,
        "forecast_overrun_pct": forecast_overrun_pct,
        "explanation": explanation,
    }


def similar_projects(project_id: int, top_n: int = 5) -> dict:
    from apps.projects.models import Project
    project = _get_project(project_id)
    candidates = Project.objects.exclude(id=project_id).prefetch_related("tasks")

    scored = []
    for p in candidates:
        sim = 0.0
        if p.province == project.province:
            sim += 0.35
        if project.category_id and p.category_id == project.category_id:
            sim += 0.25
        pt = p.tasks.count()
        mt = project.tasks.count()
        if mt > 0 and pt > 0:
            sim += 0.10 * (min(pt, mt) / max(pt, mt))
        if p.status == _COMPLETED_STATUS:
            sim += 0.10
        if sim <= 0:
            continue

        duration = None
        if p.planned_start and p.planned_end:
            duration = (p.planned_end - p.planned_start).days
        tasks_all = p.tasks.count()
        tasks_done = p.tasks.filter(is_done=True).count()
        scored.append({
            "id": p.id,
            "name": p.name,
            "province": p.province,
            "status": p.status,
            "progress": p.progress,
            "budget": None,
            "duration_days": duration,
            "similarity_score": round(sim, 3),
            "_ta": tasks_all,
            "_td": tasks_done,
        })

    scored.sort(key=lambda x: x["similarity_score"], reverse=True)
    top = scored[:top_n]

    durations = [s["duration_days"] for s in top if s["duration_days"]]
    avg_duration = round(sum(durations) / len(durations), 1) if durations else None
    rates = [s["_td"] / s["_ta"] for s in top if s["_ta"] > 0]
    avg_completion = round(sum(rates) / len(rates) * 100, 1) if rates else 0.0
    for s in top:
        s.pop("_ta", None)
        s.pop("_td", None)

    return {
        "project_id": project.id,
        "project_name": project.name,
        "similar_projects": top,
        "avg_duration_days": avg_duration,
        "avg_completion_rate": avg_completion,
    }

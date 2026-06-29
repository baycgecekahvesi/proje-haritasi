from datetime import date
from decimal import Decimal
from typing import Optional

from ninja import Schema


class SummaryOut(Schema):
    total_projects: int
    active_projects: int
    pending_projects: int
    completed_projects: int
    cancelled_projects: int
    delayed_projects: int
    avg_progress: float


class ProvinceStatOut(Schema):
    province: str
    project_count: int
    avg_progress: float


class OverBudgetOut(Schema):
    project_id: int
    project_name: str
    planned_amount: Decimal
    spent: Decimal
    overage: Decimal
    currency: str


class BudgetOverviewOut(Schema):
    total_planned: Decimal
    total_spent: Decimal
    total_remaining: Decimal
    usage_percent: float
    over_budget_count: int
    over_budget_projects: list[OverBudgetOut]


class TimelineItemOut(Schema):
    project_id: int
    project_name: str
    province: str
    status: str
    status_display: str
    planned_end: Optional[date]
    actual_end: Optional[date]
    is_delayed: bool
    delay_days: int
    progress: int


class GanttItemOut(Schema):
    project_id: int
    project_name: str
    province: str
    status: str
    progress: int
    planned_start: Optional[date]
    planned_end: Optional[date]
    actual_start: Optional[date]
    actual_end: Optional[date]
    is_delayed: bool


class ProgressBucketOut(Schema):
    label: str
    count: int


class MonthlyActivityOut(Schema):
    month: str
    started: int
    completed: int


class BudgetByProvinceOut(Schema):
    province: str
    planned: Decimal
    spent: Decimal
    usage_pct: float


class StatusDistOut(Schema):
    status: str
    label: str
    count: int
    pct: float


class IlPerformansOut(Schema):
    province: str
    proje_sayisi: int
    ort_ilerleme: float
    geciken_sayisi: int


class KpiDashboardOut(Schema):
    toplam_proje: int
    aktif_proje: int
    tamamlanan_proje: int
    bekleyen_proje: int
    geciken_proje: int
    ort_ilerleme: float
    toplam_butce: Decimal
    toplam_harcama: Decimal
    toplam_kalan: Decimal
    butce_kullanim_orani: float
    ortalama_gecikme_gun: int
    bu_ay_tamamlanan_gorev: int
    kritik_riskler: int
    il_bazli_performans: list[dict]


class SCurvePointOut(Schema):
    week: date
    planned_pct: float
    actual_pct: Optional[float] = None

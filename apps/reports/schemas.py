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

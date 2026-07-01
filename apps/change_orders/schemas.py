from datetime import datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


class ChangeOrderIn(Schema):
    project_id: int
    co_number: str
    title: str
    description: str
    reason: str = "other"
    cost_impact: Decimal = Decimal("0")
    schedule_impact_days: int = 0


class ChangeOrderPatch(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    cost_impact: Optional[Decimal] = None
    schedule_impact_days: Optional[int] = None
    status: Optional[str] = None


class ChangeOrderOut(Schema):
    id: int
    project_id: int
    project_name: str
    co_number: str
    title: str
    description: str
    reason: str
    reason_display: str
    cost_impact: Decimal
    schedule_impact_days: int
    requested_by_username: str
    status: str
    status_display: str
    approved_by_username: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_reason_display(obj) -> str:
        return obj.get_reason_display()

    @staticmethod
    def resolve_requested_by_username(obj) -> str:
        return obj.requested_by.username

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_approved_by_username(obj) -> Optional[str]:
        return obj.approved_by.username if obj.approved_by else None

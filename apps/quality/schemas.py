from datetime import date, datetime
from typing import Optional

from ninja import Schema


# ── InspectionPlan ────────────────────────────────────────────────────────────

class InspectionPlanIn(Schema):
    project_id: int
    title: str
    description: str = ""


class InspectionPlanOut(Schema):
    id: int
    project_id: int
    project_name: str
    title: str
    description: str
    created_by_username: Optional[str] = None
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_created_by_username(obj) -> Optional[str]:
        return obj.created_by.username if obj.created_by else None


# ── InspectionItem ────────────────────────────────────────────────────────────

class InspectionItemIn(Schema):
    activity_name: str
    hold_point_type: str = "W"
    responsible_party: str = ""
    standard_ref: str = ""
    status: str = "pending"
    inspected_by_id: Optional[int] = None
    inspection_date: Optional[date] = None
    result_notes: str = ""


class InspectionItemPatch(Schema):
    activity_name: Optional[str] = None
    hold_point_type: Optional[str] = None
    responsible_party: Optional[str] = None
    standard_ref: Optional[str] = None
    status: Optional[str] = None
    inspected_by_id: Optional[int] = None
    inspection_date: Optional[date] = None
    result_notes: Optional[str] = None


class InspectionItemOut(Schema):
    id: int
    plan_id: int
    activity_name: str
    hold_point_type: str
    hold_point_type_display: str
    responsible_party: str
    standard_ref: str
    status: str
    status_display: str
    inspected_by_username: Optional[str] = None
    inspection_date: Optional[date] = None
    result_notes: str

    @staticmethod
    def resolve_hold_point_type_display(obj) -> str:
        return obj.get_hold_point_type_display()

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_inspected_by_username(obj) -> Optional[str]:
        return obj.inspected_by.username if obj.inspected_by else None


# ── NCR ───────────────────────────────────────────────────────────────────────

class NCRIn(Schema):
    project_id: int
    inspection_item_id: Optional[int] = None
    ncr_no: str
    title: str
    description: str
    severity: str = "minor"
    assigned_to_id: Optional[int] = None
    action_plan: str = ""


class NCRPatch(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    assigned_to_id: Optional[int] = None
    status: Optional[str] = None
    action_plan: Optional[str] = None


class NCROut(Schema):
    id: int
    project_id: int
    project_name: str
    inspection_item_id: Optional[int] = None
    ncr_no: str
    title: str
    description: str
    severity: str
    severity_display: str
    raised_by_username: str
    assigned_to_username: Optional[str] = None
    status: str
    status_display: str
    action_plan: str
    closed_at: Optional[datetime] = None
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_severity_display(obj) -> str:
        return obj.get_severity_display()

    @staticmethod
    def resolve_raised_by_username(obj) -> str:
        return obj.raised_by.username

    @staticmethod
    def resolve_assigned_to_username(obj) -> Optional[str]:
        return obj.assigned_to.username if obj.assigned_to else None

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

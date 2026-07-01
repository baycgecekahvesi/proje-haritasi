from datetime import date, datetime
from typing import Optional

from ninja import Schema


# ── WorkerEntry ───────────────────────────────────────────────────────────────

class WorkerEntryIn(Schema):
    project_id: int
    date: date
    worker_count: int = 0
    subcontractor_name: str = ""


class WorkerEntryOut(Schema):
    id: int
    project_id: int
    project_name: str
    date: date
    worker_count: int
    subcontractor_name: str
    registered_by_username: str
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_registered_by_username(obj) -> str:
        return obj.registered_by.username


# ── WorkAccident ──────────────────────────────────────────────────────────────

class WorkAccidentIn(Schema):
    project_id: int
    accident_date: date
    description: str
    severity: str = "near_miss"
    injured_person: str = ""
    action_taken: str = ""
    reported_to_sgk: bool = False
    sgk_report_date: Optional[date] = None


class WorkAccidentPatch(Schema):
    description: Optional[str] = None
    severity: Optional[str] = None
    injured_person: Optional[str] = None
    action_taken: Optional[str] = None
    reported_to_sgk: Optional[bool] = None
    sgk_report_date: Optional[date] = None


class WorkAccidentOut(Schema):
    id: int
    project_id: int
    project_name: str
    accident_date: date
    description: str
    severity: str
    severity_display: str
    injured_person: str
    action_taken: str
    reported_to_sgk: bool
    sgk_report_date: Optional[date] = None
    created_by_username: str
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_severity_display(obj) -> str:
        return obj.get_severity_display()

    @staticmethod
    def resolve_created_by_username(obj) -> str:
        return obj.created_by.username


# ── HSEInspection ─────────────────────────────────────────────────────────────

class HSEInspectionIn(Schema):
    project_id: int
    inspection_date: date
    findings: str
    action_required: str = ""
    next_inspection_date: Optional[date] = None
    status: str = "open"


class HSEInspectionPatch(Schema):
    inspection_date: Optional[date] = None
    findings: Optional[str] = None
    action_required: Optional[str] = None
    next_inspection_date: Optional[date] = None
    status: Optional[str] = None


class HSEInspectionOut(Schema):
    id: int
    project_id: int
    project_name: str
    inspection_date: date
    inspector_username: str
    findings: str
    action_required: str
    next_inspection_date: Optional[date] = None
    status: str
    status_display: str
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_inspector_username(obj) -> str:
        return obj.inspector.username

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()


# ── Summary ───────────────────────────────────────────────────────────────────

class HSESummaryOut(Schema):
    total_workers: int
    total_accidents: int
    open_inspections: int

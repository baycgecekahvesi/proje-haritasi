from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


class TimesheetIn(Schema):
    project_id:       int
    resource_id:      Optional[int] = None
    work_date:        date
    hours_worked:     Decimal = Decimal("8")
    work_description: str = ""


class TimesheetPatch(Schema):
    hours_worked:     Optional[Decimal] = None
    work_description: Optional[str] = None
    status:           Optional[str] = None


class TimesheetOut(Schema):
    id:                   int
    project_id:           int
    project_name:         str
    user_id:              int
    user_username:        str
    resource_id:          Optional[int]
    resource_name:        Optional[str] = None
    work_date:            date
    hours_worked:         Decimal
    work_description:     str
    status:               str
    status_display:       str
    approved_by_username: Optional[str] = None
    created_at:           datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_user_username(obj) -> str:
        return obj.user.username

    @staticmethod
    def resolve_resource_name(obj) -> Optional[str]:
        return obj.resource.name if obj.resource else None

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_approved_by_username(obj) -> Optional[str]:
        return obj.approved_by.username if obj.approved_by else None


class ProgressPaymentIn(Schema):
    project_id:     int
    period_start:   date
    period_end:     date
    planned_amount: Decimal = Decimal("0")
    actual_amount:  Decimal = Decimal("0")
    description:    str = ""


class ProgressPaymentPatch(Schema):
    planned_amount:  Optional[Decimal] = None
    actual_amount:   Optional[Decimal] = None
    approved_amount: Optional[Decimal] = None
    description:     Optional[str] = None
    status:          Optional[str] = None


class ProgressPaymentOut(Schema):
    id:                   int
    project_id:           int
    project_name:         str
    period_start:         date
    period_end:           date
    planned_amount:       Decimal
    actual_amount:        Decimal
    approved_amount:      Decimal
    description:          str
    status:               str
    status_display:       str
    approved_by_username: Optional[str] = None
    created_at:           datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_approved_by_username(obj) -> Optional[str]:
        return obj.approved_by.username if obj.approved_by else None

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


# ── MetrajSatiri ──────────────────────────────────────────────────────────────

class MetrajSatiriIn(Schema):
    poz_no: str
    tanim: str
    birim: str
    sozlesme_miktari: Decimal = Decimal("0")
    gerceklesen_miktar: Decimal = Decimal("0")
    birim_fiyat: Decimal = Decimal("0")


class MetrajSatiriPatch(Schema):
    poz_no: Optional[str] = None
    tanim: Optional[str] = None
    birim: Optional[str] = None
    sozlesme_miktari: Optional[Decimal] = None
    gerceklesen_miktar: Optional[Decimal] = None
    birim_fiyat: Optional[Decimal] = None


class MetrajSatiriOut(Schema):
    id: int
    progress_payment_id: int
    poz_no: str
    tanim: str
    birim: str
    sozlesme_miktari: Decimal
    gerceklesen_miktar: Decimal
    birim_fiyat: Decimal
    tutar: Decimal

    @staticmethod
    def resolve_tutar(obj) -> Decimal:
        return obj.tutar


# ── FiyatFarki ────────────────────────────────────────────────────────────────

class FiyatFarkiIn(Schema):
    endeks_turu: str
    baslangic_endeksi: Decimal = Decimal("0")
    bitis_endeksi: Decimal = Decimal("0")
    fark_tutari: Decimal = Decimal("0")


class FiyatFarkiOut(Schema):
    id: int
    progress_payment_id: int
    endeks_turu: str
    baslangic_endeksi: Decimal
    bitis_endeksi: Decimal
    fark_tutari: Decimal
    katsayi: float

    @staticmethod
    def resolve_katsayi(obj) -> float:
        return obj.katsayi


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

from datetime import date, datetime
from typing import Optional

from ninja import Schema


class CorrespondenceIn(Schema):
    project_id: int
    ref_no: str
    type: str
    subject: str
    from_party: str
    to_party: str
    sent_at: date
    response_due: Optional[date] = None
    content: str = ""


class CorrespondencePatch(Schema):
    subject: Optional[str] = None
    from_party: Optional[str] = None
    to_party: Optional[str] = None
    sent_at: Optional[date] = None
    response_due: Optional[date] = None
    responded_at: Optional[date] = None
    status: Optional[str] = None
    content: Optional[str] = None


class CorrespondenceOut(Schema):
    id: int
    project_id: int
    project_name: str
    ref_no: str
    type: str
    type_display: str
    subject: str
    from_party: str
    to_party: str
    sent_at: date
    response_due: Optional[date] = None
    responded_at: Optional[date] = None
    status: str
    status_display: str
    content: str
    created_by_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_type_display(obj) -> str:
        return obj.get_type_display()

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_created_by_username(obj) -> Optional[str]:
        return obj.created_by.username if obj.created_by else None

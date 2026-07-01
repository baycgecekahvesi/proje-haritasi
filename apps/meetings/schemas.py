from datetime import date, datetime
from typing import Optional

from ninja import Schema


# ── Meeting ───────────────────────────────────────────────────────────────────

class MeetingIn(Schema):
    project_id: int
    title: str
    type: str = "weekly"
    meeting_date: date
    location: str = ""
    participant_ids: list[int] = []
    minutes: str = ""


class MeetingPatch(Schema):
    title: Optional[str] = None
    type: Optional[str] = None
    meeting_date: Optional[date] = None
    location: Optional[str] = None
    participant_ids: Optional[list[int]] = None
    minutes: Optional[str] = None


class MeetingOut(Schema):
    id: int
    project_id: int
    project_name: str
    title: str
    type: str
    type_display: str
    meeting_date: date
    location: str
    minutes: str
    participant_count: int
    created_by_username: Optional[str] = None
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_type_display(obj) -> str:
        return obj.get_type_display()

    @staticmethod
    def resolve_participant_count(obj) -> int:
        return obj.participants.count()

    @staticmethod
    def resolve_created_by_username(obj) -> Optional[str]:
        return obj.created_by.username if obj.created_by else None


# ── ActionItem ────────────────────────────────────────────────────────────────

class ActionItemIn(Schema):
    description: str
    owner_id: int
    due_date: date
    status: str = "open"


class ActionItemPatch(Schema):
    description: Optional[str] = None
    owner_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    completed_at: Optional[date] = None


class ActionItemOut(Schema):
    id: int
    meeting_id: int
    description: str
    owner_username: str
    due_date: date
    status: str
    status_display: str
    completed_at: Optional[date] = None

    @staticmethod
    def resolve_owner_username(obj) -> str:
        return obj.owner.username

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

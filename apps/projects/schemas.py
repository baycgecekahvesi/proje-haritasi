from datetime import date, datetime
from typing import Optional

from ninja import Schema


# --------------------------------------------------------------------------- #
# Kategori
# --------------------------------------------------------------------------- #
class CategoryOut(Schema):
    id: int
    name: str
    color: str


class CategoryIn(Schema):
    name: str
    color: str = "#4f6ef7"


# --------------------------------------------------------------------------- #
# Proje
# --------------------------------------------------------------------------- #
class MemberOut(Schema):
    id: int
    username: str


class ProjectIn(Schema):
    name: str
    description: str = ""
    province: str
    category_id: Optional[int] = None
    status: str = "aktif"
    progress: int = 0
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    member_ids: list[int] = []


class ProjectPatch(Schema):
    name: Optional[str] = None
    description: Optional[str] = None
    province: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    member_ids: Optional[list[int]] = None


class ProjectOut(Schema):
    id: int
    name: str
    description: str
    province: str
    category: Optional[CategoryOut] = None
    status: str
    status_display: str
    progress: int
    owner_id: int
    owner_username: str
    member_ids: list[int]
    member_list: list[MemberOut]
    planned_start: Optional[date]
    planned_end: Optional[date]
    actual_start: Optional[date]
    actual_end: Optional[date]
    is_delayed: bool
    delay_days: int
    image_count: int
    task_count: int
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_owner_username(obj) -> str:
        return obj.owner.username

    @staticmethod
    def resolve_member_ids(obj) -> list[int]:
        return [u.id for u in obj.members.all()]

    @staticmethod
    def resolve_member_list(obj) -> list:
        return [{"id": u.id, "username": u.username} for u in obj.members.all()]

    @staticmethod
    def resolve_image_count(obj) -> int:
        return obj.images.count()

    @staticmethod
    def resolve_task_count(obj) -> int:
        return obj.tasks.count()


class ProjectMapOut(Schema):
    """Harita için hafif özet — il bazlı renklendirme."""

    province: str
    project_count: int
    status: str  # baskın durum
    color: str  # durum/ilerlemeye göre renk
    avg_progress: int
    has_delay: bool


# --------------------------------------------------------------------------- #
# Görsel
# --------------------------------------------------------------------------- #
class ProjectImageOut(Schema):
    id: int
    image: str
    caption: str
    uploaded_at: datetime

    @staticmethod
    def resolve_image(obj) -> str:
        return obj.image.url if obj.image else ""


# --------------------------------------------------------------------------- #
# Görev
# --------------------------------------------------------------------------- #
class TaskIn(Schema):
    title: str
    description: str = ""
    assignee_id: Optional[int] = None
    priority: str = "medium"
    is_done: bool = False
    due_date: Optional[date] = None


class TaskPatch(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    is_done: Optional[bool] = None
    due_date: Optional[date] = None


class TaskOut(Schema):
    id: int
    project_id: int
    title: str
    description: str
    assignee_id: Optional[int]
    assignee_username: Optional[str] = None
    priority: str
    priority_display: str
    is_done: bool
    due_date: Optional[date]
    created_at: datetime

    @staticmethod
    def resolve_priority_display(obj) -> str:
        return obj.get_priority_display()

    @staticmethod
    def resolve_assignee_username(obj) -> Optional[str]:
        return obj.assignee.username if obj.assignee_id and obj.assignee else None

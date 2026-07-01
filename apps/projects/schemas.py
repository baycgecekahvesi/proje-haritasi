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
    parent_id: Optional[int] = None
    wbs_code: str = ""
    assignee_id: Optional[int] = None
    priority: str = "medium"
    is_done: bool = False
    due_date: Optional[date] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    progress: int = 0
    delay_reason: str = ""


class TaskPatch(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    wbs_code: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    is_done: Optional[bool] = None
    due_date: Optional[date] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    progress: Optional[int] = None
    delay_reason: Optional[str] = None


class TaskOut(Schema):
    id: int
    project_id: int
    parent_id: Optional[int]
    wbs_code: str
    title: str
    description: str
    assignee_id: Optional[int]
    assignee_username: Optional[str] = None
    priority: str
    priority_display: str
    is_done: bool
    due_date: Optional[date]
    planned_start: Optional[date]
    planned_end: Optional[date]
    actual_start: Optional[date]
    actual_end: Optional[date]
    progress: int
    delay_reason: str
    is_overdue: bool
    created_at: datetime

    @staticmethod
    def resolve_priority_display(obj) -> str:
        return obj.get_priority_display()

    @staticmethod
    def resolve_assignee_username(obj) -> Optional[str]:
        return obj.assignee.username if obj.assignee_id and obj.assignee else None

    @staticmethod
    def resolve_is_overdue(obj) -> bool:
        from datetime import date as d
        if obj.due_date and not obj.is_done:
            return d.today() > obj.due_date
        return False


# --------------------------------------------------------------------------- #
# Görev Bağımlılığı
# --------------------------------------------------------------------------- #
class TaskDependencyIn(Schema):
    depends_on_id: int
    dep_type: str = "FS"


class TaskDependencyOut(Schema):
    id: int
    task_id: int
    depends_on_id: int
    depends_on_title: str
    dep_type: str

    @staticmethod
    def resolve_depends_on_title(obj) -> str:
        return obj.depends_on.title


# --------------------------------------------------------------------------- #
# Gantt
# --------------------------------------------------------------------------- #
class TaskGanttOut(Schema):
    id: int
    parent_id: Optional[int]
    wbs_code: str
    title: str
    project_id: int
    project_name: str
    assignee_username: Optional[str] = None
    priority: str
    is_done: bool
    progress: int
    planned_start: Optional[date]
    planned_end: Optional[date]
    actual_start: Optional[date]
    actual_end: Optional[date]
    due_date: Optional[date]
    is_overdue: bool
    dependency_ids: list[int]

    @staticmethod
    def resolve_is_overdue(obj) -> bool:
        from datetime import date as d
        if obj.due_date and not obj.is_done:
            return d.today() > obj.due_date
        return False

    @staticmethod
    def resolve_dependency_ids(obj) -> list[int]:
        return list(obj.dependencies.values_list("depends_on_id", flat=True))

    @staticmethod
    def resolve_assignee_username(obj) -> Optional[str]:
        return obj.assignee.username if obj.assignee else None

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

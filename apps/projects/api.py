from collections import Counter

from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from ninja import File, Router
from ninja.files import UploadedFile
from ninja.pagination import PageNumberPagination, paginate

from apps.accounts.decorators import require_role
from apps.accounts.models import User

from .colors import province_color
from .models import Category, Project, ProjectImage, ProjectStatus, Task
from .schemas import (
    CategoryIn,
    CategoryOut,
    ProjectImageOut,
    ProjectIn,
    ProjectMapOut,
    ProjectOut,
    ProjectPatch,
    TaskIn,
    TaskOut,
    TaskPatch,
)

router = Router()


def _base_queryset():
    return (
        Project.objects.select_related("owner", "category")
        .prefetch_related("members", "images", "tasks")
    )


def _apply_project_fields(project: Project, data: dict):
    """ProjectIn/ProjectPatch alanlarını projeye uygula (member_ids hariç)."""
    member_ids = data.pop("member_ids", None)
    category_id = data.pop("category_id", "__missing__")

    for field, value in data.items():
        setattr(project, field, value)

    if category_id != "__missing__":
        project.category = (
            Category.objects.filter(id=category_id).first()
            if category_id
            else None
        )
    return member_ids


# --------------------------------------------------------------------------- #
# Kategoriler (yardımcı)
# --------------------------------------------------------------------------- #
@router.get("/categories", response=list[CategoryOut])
def list_categories(request):
    return list(Category.objects.all())


@router.post("/categories", response={200: CategoryOut})
@require_role("admin", "editor")
def create_category(request, payload: CategoryIn):
    return Category.objects.create(**payload.dict())


# --------------------------------------------------------------------------- #
# Harita
# --------------------------------------------------------------------------- #
@router.get("/map", response=list[ProjectMapOut])
def projects_map(request):
    """Her il için özet: proje sayısı, baskın durum, renk."""
    projects = list(
        Project.objects.values(
            "province", "status", "progress",
            "planned_end", "actual_end",
        )
    )

    from datetime import date

    today = date.today()
    grouped: dict[str, list] = {}
    for p in projects:
        grouped.setdefault(p["province"], []).append(p)

    result = []
    for province, items in grouped.items():
        statuses = [i["status"] for i in items]
        dominant = Counter(statuses).most_common(1)[0][0]
        avg_progress = round(sum(i["progress"] for i in items) / len(items))
        has_delay = any(
            i["planned_end"]
            and i["status"] != ProjectStatus.COMPLETED
            and today > i["planned_end"]
            for i in items
        )
        result.append(
            {
                "province": province,
                "project_count": len(items),
                "status": dominant,
                "color": province_color(dominant, has_delay),
                "avg_progress": avg_progress,
                "has_delay": has_delay,
            }
        )
    return result


# --------------------------------------------------------------------------- #
# Proje CRUD
# --------------------------------------------------------------------------- #
@router.get("/", response=list[ProjectOut])
@paginate(PageNumberPagination, page_size=20)
def list_projects(
    request,
    province: str = None,
    status: str = None,
    search: str = None,
):
    qs = _base_queryset()
    if province:
        qs = qs.filter(province=province)
    if status:
        qs = qs.filter(status=status)
    if search:
        qs = qs.filter(name__icontains=search)
    return qs


@router.post("/", response={200: ProjectOut})
@require_role("admin", "editor")
def create_project(request, payload: ProjectIn):
    data = payload.dict()
    project = Project(owner_id=request.auth["user_id"])
    member_ids = _apply_project_fields(project, data)
    project.save()
    if member_ids:
        project.members.set(User.objects.filter(id__in=member_ids))
    return _base_queryset().get(id=project.id)


@router.get("/{project_id}", response=ProjectOut)
def get_project(request, project_id: int):
    return get_object_or_404(_base_queryset(), id=project_id)


@router.patch("/{project_id}", response=ProjectOut)
@require_role("admin", "editor")
def update_project(request, project_id: int, payload: ProjectPatch):
    project = get_object_or_404(Project, id=project_id)
    data = payload.dict(exclude_unset=True)
    member_ids = _apply_project_fields(project, data)
    project.save()
    if member_ids is not None:
        project.members.set(User.objects.filter(id__in=member_ids))
    return _base_queryset().get(id=project.id)


@router.delete("/{project_id}", response={200: dict})
@require_role("admin")
def delete_project(request, project_id: int):
    project = get_object_or_404(Project, id=project_id)
    project.delete()
    return {"detail": "Proje silindi"}


# --------------------------------------------------------------------------- #
# Görseller
# --------------------------------------------------------------------------- #
@router.get("/{project_id}/images", response=list[ProjectImageOut])
def list_images(request, project_id: int):
    get_object_or_404(Project, id=project_id)
    return list(ProjectImage.objects.filter(project_id=project_id))


@router.post("/{project_id}/images", response={200: ProjectImageOut})
@require_role("admin", "editor")
def upload_image(
    request,
    project_id: int,
    file: UploadedFile = File(...),
    caption: str = "",
):
    project = get_object_or_404(Project, id=project_id)
    return ProjectImage.objects.create(
        project=project, image=file, caption=caption
    )


@router.delete("/{project_id}/images/{image_id}", response={200: dict})
@require_role("admin", "editor")
def delete_image(request, project_id: int, image_id: int):
    img = get_object_or_404(
        ProjectImage, id=image_id, project_id=project_id
    )
    img.image.delete(save=False)
    img.delete()
    return {"detail": "Görsel silindi"}


# --------------------------------------------------------------------------- #
# Görevler
# --------------------------------------------------------------------------- #
@router.get("/{project_id}/tasks", response=list[TaskOut])
def list_tasks(request, project_id: int):
    get_object_or_404(Project, id=project_id)
    return list(Task.objects.filter(project_id=project_id).select_related("assignee"))


@router.post("/{project_id}/tasks", response={200: TaskOut})
@require_role("admin", "editor")
def create_task(request, project_id: int, payload: TaskIn):
    project = get_object_or_404(Project, id=project_id)
    return Task.objects.create(project=project, **payload.dict())


@router.patch("/{project_id}/tasks/{task_id}", response=TaskOut)
@require_role("admin", "editor")
def update_task(request, project_id: int, task_id: int, payload: TaskPatch):
    task = get_object_or_404(Task, id=task_id, project_id=project_id)
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(task, field, value)
    task.save()
    return task


@router.delete("/{project_id}/tasks/{task_id}", response={200: dict})
@require_role("admin", "editor")
def delete_task(request, project_id: int, task_id: int):
    task = get_object_or_404(Task, id=task_id, project_id=project_id)
    task.delete()
    return {"detail": "Görev silindi"}

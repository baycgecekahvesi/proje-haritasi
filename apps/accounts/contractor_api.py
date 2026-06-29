from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from apps.accounts.decorators import require_role
from apps.documents.models import Document
from apps.documents.schemas import DocumentOut
from apps.projects.models import Project, Task
from apps.projects.schemas import ProjectOut, TaskOut

from .models import ContractorProfile, ProjectContractor
from .schemas import ProjectContractorIn, ProjectContractorOut

router = Router()


def _contractor_project_ids(user_id: int) -> list[int]:
    return list(
        ProjectContractor.objects.filter(contractor_id=user_id)
        .values_list("project_id", flat=True)
    )


# ------------------------------------------------------------------ #
# Müteahhit: kendi projeleri
# ------------------------------------------------------------------ #
@router.get("/my-projects", response=list[ProjectOut])
def my_projects(request):
    user_id = request.auth["user_id"]
    project_ids = _contractor_project_ids(user_id)
    return list(
        Project.objects.filter(id__in=project_ids)
        .select_related("owner", "category")
        .prefetch_related("members", "images", "tasks")
    )


# ------------------------------------------------------------------ #
# Müteahhit: kendi görevleri
# ------------------------------------------------------------------ #
@router.get("/my-tasks", response=list[TaskOut])
def my_tasks(request):
    user_id = request.auth["user_id"]
    project_ids = _contractor_project_ids(user_id)
    return list(
        Task.objects.filter(project_id__in=project_ids)
        .select_related("assignee")
        .order_by("due_date")
    )


# ------------------------------------------------------------------ #
# Müteahhit: döküman listesi
# ------------------------------------------------------------------ #
@router.get("/documents/{project_id}", response=list[DocumentOut])
def my_documents(request, project_id: int):
    user_id = request.auth["user_id"]
    project_ids = _contractor_project_ids(user_id)
    if project_id not in project_ids:
        raise HttpError(403, "Bu projeye erişim izniniz yok")
    return list(Document.objects.filter(project_id=project_id))


# ------------------------------------------------------------------ #
# Admin: projeye müteahhit ata / listele
# ------------------------------------------------------------------ #
@router.get("/projects/{project_id}/contractors", response=list[ProjectContractorOut])
@require_role("admin")
def list_project_contractors(request, project_id: int):
    get_object_or_404(Project, id=project_id)
    return list(
        ProjectContractor.objects.filter(project_id=project_id)
        .select_related("project", "contractor")
    )


@router.post("/projects/{project_id}/contractors", response={200: ProjectContractorOut})
@require_role("admin")
def assign_contractor(request, project_id: int, payload: ProjectContractorIn):
    project = get_object_or_404(Project, id=project_id)
    pc, _ = ProjectContractor.objects.update_or_create(
        project=project,
        contractor_id=payload.contractor_id,
        defaults={
            "role": payload.role,
            "contract_amount": payload.contract_amount,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
        },
    )
    return ProjectContractor.objects.select_related("project", "contractor").get(id=pc.id)


@router.delete("/projects/{project_id}/contractors/{contractor_id}", response={200: dict})
@require_role("admin")
def remove_contractor(request, project_id: int, contractor_id: int):
    pc = get_object_or_404(ProjectContractor, project_id=project_id, contractor_id=contractor_id)
    pc.delete()
    return {"detail": "Müteahhit projeden kaldırıldı"}

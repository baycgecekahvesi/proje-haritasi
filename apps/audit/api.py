from typing import Optional

from ninja import Router
from ninja.pagination import PageNumberPagination, paginate

from apps.accounts.decorators import require_role

from .models import AuditLog
from .schemas import AuditLogOut

router = Router()


@router.get("/", response=list[AuditLogOut])
@require_role("admin")
@paginate(PageNumberPagination, page_size=50)
def list_audit_logs(
    request,
    model_name: Optional[str] = None,
    object_id: Optional[str] = None,
):
    qs = AuditLog.objects.select_related("user")
    if model_name:
        qs = qs.filter(model_name=model_name)
    if object_id:
        qs = qs.filter(object_id=str(object_id))
    return qs


@router.get("/user/{user_id}", response=list[AuditLogOut])
@require_role("admin")
@paginate(PageNumberPagination, page_size=50)
def list_user_audit_logs(request, user_id: int):
    return AuditLog.objects.filter(user_id=user_id).select_related("user")

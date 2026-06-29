from .models import AuditLog


def log_action(
    user,
    action,
    model_name="",
    object_id="",
    object_repr="",
    old_value=None,
    new_value=None,
    ip_address=None,
):
    """Audit log kaydı oluştur. Her yerden çağrılabilir."""
    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id) if object_id else "",
            object_repr=str(object_repr)[:200] if object_repr else "",
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
        )
    except Exception:
        pass  # Audit log başarısız olursa asıl işlemi engelleme

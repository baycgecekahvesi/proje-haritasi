from datetime import datetime
from typing import Optional

from ninja import Schema


class AuditLogOut(Schema):
    id: int
    user_username: Optional[str] = None
    action: str
    action_display: str
    model_name: str
    object_id: str
    object_repr: str
    ip_address: Optional[str] = None
    created_at: datetime

    @staticmethod
    def resolve_user_username(obj):
        return obj.user.username if obj.user else None

    @staticmethod
    def resolve_action_display(obj):
        return obj.get_action_display()

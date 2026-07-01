from datetime import datetime
from typing import Optional

from ninja import Schema


class StakeholderIn(Schema):
    project_id: int
    name: str
    organization: str = ""
    role: str
    email: str = ""
    phone: str = ""
    influence_level: str = "medium"
    interest_level: str = "medium"
    communication_frequency: str = "weekly"
    notes: str = ""


class StakeholderPatch(Schema):
    name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    influence_level: Optional[str] = None
    interest_level: Optional[str] = None
    communication_frequency: Optional[str] = None
    notes: Optional[str] = None


class StakeholderOut(Schema):
    id: int
    project_id: int
    project_name: str
    name: str
    organization: str
    role: str
    email: str
    phone: str
    influence_level: str
    influence_level_display: str
    interest_level: str
    interest_level_display: str
    communication_frequency: str
    communication_frequency_display: str
    notes: str
    created_at: datetime

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name

    @staticmethod
    def resolve_influence_level_display(obj) -> str:
        return obj.get_influence_level_display()

    @staticmethod
    def resolve_interest_level_display(obj) -> str:
        return obj.get_interest_level_display()

    @staticmethod
    def resolve_communication_frequency_display(obj) -> str:
        return obj.get_communication_frequency_display()

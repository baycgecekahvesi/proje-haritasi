from datetime import datetime
from typing import Optional

from ninja import Schema


class TechSpecIn(Schema):
    title: str
    spec_type: str = "genel"
    customer: str = ""
    contract_no: str = ""
    revision: str = "Rev.0"
    status: str = "taslak"
    scope: str = ""
    standards: str = ""
    system_requirements: str = ""
    hardware_specs: str = ""
    software_specs: str = ""
    communication: str = ""
    acceptance_tests: str = ""
    documentation_req: str = ""
    training_warranty: str = ""
    project_id: Optional[int] = None


class TechSpecOut(Schema):
    id: int
    title: str
    spec_type: str
    spec_type_display: str
    customer: str
    contract_no: str
    revision: str
    status: str
    status_display: str
    scope: str
    standards: str
    system_requirements: str
    hardware_specs: str
    software_specs: str
    communication: str
    acceptance_tests: str
    documentation_req: str
    training_warranty: str
    project_id: Optional[int]
    created_by_username: Optional[str]
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def resolve_spec_type_display(obj) -> str:
        return obj.get_spec_type_display()

    @staticmethod
    def resolve_status_display(obj) -> str:
        return obj.get_status_display()

    @staticmethod
    def resolve_created_by_username(obj) -> Optional[str]:
        return obj.created_by.username if obj.created_by_id else None


class DocumentOut(Schema):
    id: int
    project_id: int
    title: str
    doc_type: str
    doc_type_display: str
    file: str
    file_extension: str
    file_size_kb: float
    uploaded_by_id: Optional[int]
    uploaded_by_username: Optional[str]
    uploaded_at: datetime

    @staticmethod
    def resolve_doc_type_display(obj) -> str:
        return obj.get_doc_type_display()

    @staticmethod
    def resolve_file(obj) -> str:
        return obj.file.url if obj.file else ""

    @staticmethod
    def resolve_uploaded_by_username(obj) -> Optional[str]:
        return obj.uploaded_by.username if obj.uploaded_by_id else None


class TechDocOut(Schema):
    id: int
    title: str
    description: str
    category: str
    category_display: str
    file: str
    file_extension: str
    file_size_kb: float
    uploaded_by_username: Optional[str]
    uploaded_at: datetime

    @staticmethod
    def resolve_category_display(obj) -> str:
        return obj.get_category_display()

    @staticmethod
    def resolve_file(obj) -> str:
        return obj.file.url if obj.file else ""

    @staticmethod
    def resolve_uploaded_by_username(obj) -> Optional[str]:
        return obj.uploaded_by.username if obj.uploaded_by_id else None


class SitePhotoOut(Schema):
    id:          int
    project_id:  int
    uploaded_by_username: str
    photo_url:   str
    description: str
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None
    taken_at:    Optional[datetime] = None
    uploaded_at: datetime

    @staticmethod
    def resolve_uploaded_by_username(obj) -> str:
        return obj.uploaded_by.username

    @staticmethod
    def resolve_photo_url(obj) -> str:
        return obj.photo.url if obj.photo else ""

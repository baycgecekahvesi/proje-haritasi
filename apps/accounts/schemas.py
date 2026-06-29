from datetime import date as date_type
from typing import Optional

from ninja import Schema


class LoginIn(Schema):
    username: str
    password: str


class TokenOut(Schema):
    access_token: str
    token_type: str = "bearer"
    expires_in_hours: int


class UserOut(Schema):
    id: int
    username: str
    email: str = ""
    first_name: str = ""
    last_name: str = ""
    role: str
    meslek_rolu: str = ""
    is_active: bool


class RegisterIn(Schema):
    username: str
    password: str
    email: str = ""
    first_name: str = ""
    last_name: str = ""
    role: str = "viewer"
    meslek_rolu: str = ""


class UserPatch(Schema):
    role: Optional[str] = None
    meslek_rolu: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class BildirimOut(Schema):
    id: int
    baslik: str
    mesaj: str = ""
    gorev_id: str = ""
    okundu: bool
    olusturuldu: str


class MessageOut(Schema):
    detail: str


class ContractorProfileOut(Schema):
    id:             int
    company_name:   str
    tax_number:     str
    contact_person: str
    phone:          str
    address:        str


class ProjectContractorOut(Schema):
    id:              int
    project_id:      int
    project_name:    str
    role:            str
    contract_amount: Optional[float] = None
    start_date:      Optional[date_type] = None
    end_date:        Optional[date_type] = None

    @staticmethod
    def resolve_project_name(obj) -> str:
        return obj.project.name


class ProjectContractorIn(Schema):
    contractor_id:   int
    role:            str = ""
    contract_amount: Optional[float] = None
    start_date:      Optional[date_type] = None
    end_date:        Optional[date_type] = None

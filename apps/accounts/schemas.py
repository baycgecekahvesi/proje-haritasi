from datetime import datetime
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


class DeviceTokenIn(Schema):
    fcm_token:   str
    device_type: str = "android"


class DeviceTokenOut(Schema):
    id:          int
    device_type: str
    is_active:   bool
    created_at:  datetime

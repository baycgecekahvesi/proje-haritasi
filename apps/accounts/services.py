import jwt
from datetime import datetime, timedelta, timezone

from django.conf import settings

from .models import User


def create_token(user: User) -> str:
    """Kullanıcı için imzalı JWT üret."""
    role = getattr(getattr(user, "profile", None), "role", "viewer")
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": role,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=settings.JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """Token'ı çöz; geçersiz/süresi dolmuşsa None döner."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

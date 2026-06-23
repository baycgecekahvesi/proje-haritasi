from django.conf import settings
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from .decorators import require_role
from .models import Bildirim, Role, User, UserProfile
from .schemas import BildirimOut, LoginIn, MessageOut, RegisterIn, TokenOut, UserOut, UserPatch
from .services import create_token

router = Router()


def _user_to_out(user: User) -> dict:
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email or "",
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "role": getattr(profile, "role", Role.VIEWER),
        "meslek_rolu": getattr(profile, "meslek_rolu", ""),
        "is_active": user.is_active,
    }


@router.post("/login", auth=None, response=TokenOut)
def login(request, payload: LoginIn):
    """JWT token al. Herkese açık."""
    user = authenticate(username=payload.username, password=payload.password)
    if user is None:
        raise HttpError(401, "Kullanıcı adı veya parola hatalı")
    if not user.is_active:
        raise HttpError(403, "Hesabınız devre dışı bırakılmış")
    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "expires_in_hours": settings.JWT_EXPIRE_HOURS,
    }


@router.get("/me", response=UserOut)
def me(request):
    """Mevcut kullanıcı bilgisi."""
    user = User.objects.select_related("profile").get(id=request.auth["user_id"])
    return _user_to_out(user)


@router.get("/users", response=list[UserOut])
@require_role("admin")
def list_users(request):
    """Tüm kullanıcıları listele (sadece Admin)."""
    users = User.objects.select_related("profile").order_by("username")
    return [_user_to_out(u) for u in users]


@router.post("/register", response={200: UserOut}, )
@require_role("admin")
def register(request, payload: RegisterIn):
    """Yeni kullanıcı oluştur (sadece Admin)."""
    if User.objects.filter(username=payload.username).exists():
        raise HttpError(400, "Bu kullanıcı adı zaten kullanımda")
    if payload.role not in Role.values:
        raise HttpError(400, "Geçersiz rol")

    user = User.objects.create_user(
        username=payload.username,
        password=payload.password,
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    # Sinyal profil oluşturur; rolü istenen değere ayarla
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = payload.role
    if payload.meslek_rolu:
        profile.meslek_rolu = payload.meslek_rolu
    profile.save(update_fields=["role", "meslek_rolu"])
    user.profile = profile
    return _user_to_out(user)


@router.patch("/users/{user_id}", response=UserOut)
@require_role("admin")
def update_user(request, user_id: int, payload: UserPatch):
    """Kullanıcı bilgisi/rol/durum güncelle (sadece Admin)."""
    user = get_object_or_404(User.objects.select_related("profile"), id=user_id)
    data = payload.dict(exclude_unset=True)
    role = data.pop("role", None)
    for field, value in data.items():
        setattr(user, field, value)
    if data:
        user.save(update_fields=list(data.keys()))
    meslek_rolu = data.pop("meslek_rolu", None)
    if role:
        if role not in Role.values:
            raise HttpError(400, "Geçersiz rol")
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save(update_fields=["role"])
        user.profile = profile
    if meslek_rolu is not None:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.meslek_rolu = meslek_rolu
        profile.save(update_fields=["meslek_rolu"])
        user.profile = profile
    return _user_to_out(user)


@router.get("/users/by-role/{meslek_rolu}", response=list[UserOut], summary="Meslek rolüne göre kullanıcılar")
def users_by_role(request, meslek_rolu: str):
    users = User.objects.select_related("profile").filter(
        profile__meslek_rolu=meslek_rolu, is_active=True
    ).order_by("first_name", "username")
    return [_user_to_out(u) for u in users]


@router.get("/notifications", response=list[BildirimOut], summary="Benim bildirimlerim")
def list_notifications(request):
    user = get_object_or_404(User, id=request.auth["user_id"])
    return [
        BildirimOut(
            id=b.id, baslik=b.baslik, mesaj=b.mesaj,
            gorev_id=b.gorev_id, okundu=b.okundu,
            olusturuldu=b.olusturuldu.isoformat(),
        )
        for b in Bildirim.objects.filter(alici=user)[:50]
    ]


@router.post("/notifications/{bildirim_id}/oku", response={200: dict}, summary="Bildirimi okundu işaretle")
def mark_notification_read(request, bildirim_id: int):
    user = get_object_or_404(User, id=request.auth["user_id"])
    b = get_object_or_404(Bildirim, id=bildirim_id, alici=user)
    b.okundu = True
    b.save(update_fields=["okundu"])
    return {"detail": "ok"}


@router.post("/notifications/oku-hepsi", response={200: dict}, summary="Tümünü okundu yap")
def mark_all_read(request):
    user = get_object_or_404(User, id=request.auth["user_id"])
    Bildirim.objects.filter(alici=user, okundu=False).update(okundu=True)
    return {"detail": "ok"}

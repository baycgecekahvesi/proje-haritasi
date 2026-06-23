import pytest

from apps.accounts.models import Role, User, UserProfile
from apps.accounts.services import create_token


def _make_user(username, role, password="test123", **extra):
    user = User.objects.create_user(username=username, password=password, **extra)
    # Sinyal profili oluşturur; rolü ayarla
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save(update_fields=["role"])
    user.profile = profile  # önbelleği tazele
    return user


@pytest.fixture
def admin_user(db):
    return _make_user("admin", Role.ADMIN)


@pytest.fixture
def editor_user(db):
    return _make_user("editor", Role.EDITOR)


@pytest.fixture
def viewer_user(db):
    return _make_user("viewer", Role.VIEWER)


def _headers(user):
    return {"HTTP_AUTHORIZATION": f"Bearer {create_token(user)}"}


@pytest.fixture
def admin_headers(admin_user):
    return _headers(admin_user)


@pytest.fixture
def editor_headers(editor_user):
    return _headers(editor_user)


@pytest.fixture
def viewer_headers(viewer_user):
    return _headers(viewer_user)

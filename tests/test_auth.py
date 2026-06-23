import pytest


@pytest.mark.django_db
def test_login_success(client, admin_user):
    res = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "test123"},
        content_type="application/json",
    )
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.django_db
def test_login_wrong_password(client, admin_user):
    res = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "yanlis"},
        content_type="application/json",
    )
    assert res.status_code == 401


@pytest.mark.django_db
def test_me_requires_auth(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


@pytest.mark.django_db
def test_me_returns_current_user(client, admin_user, admin_headers):
    res = client.get("/api/auth/me", **admin_headers)
    assert res.status_code == 200
    assert res.json()["username"] == "admin"
    assert res.json()["role"] == "admin"


@pytest.mark.django_db
def test_register_admin_only(client, editor_user, editor_headers):
    res = client.post(
        "/api/auth/register",
        data={"username": "yeni", "password": "test123", "role": "viewer"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_register_by_admin(client, admin_user, admin_headers):
    res = client.post(
        "/api/auth/register",
        data={"username": "yenikullanici", "password": "test123", "role": "editor"},
        content_type="application/json",
        **admin_headers,
    )
    assert res.status_code == 200
    assert res.json()["role"] == "editor"


@pytest.mark.django_db
def test_users_list_admin_only(client, viewer_user, viewer_headers):
    res = client.get("/api/auth/users", **viewer_headers)
    assert res.status_code == 403

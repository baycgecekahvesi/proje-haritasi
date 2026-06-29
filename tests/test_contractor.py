import pytest

from apps.accounts.models import ContractorProfile, ProjectContractor, User, UserProfile
from apps.projects.models import Project


def _make_user(username, role, password="pass"):
    user = User.objects.create_user(username=username, password=password)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save(update_fields=["role"])
    user.profile = profile
    return user


@pytest.fixture
def contractor_user(db):
    user = _make_user("contractor1", "viewer")
    ContractorProfile.objects.create(user=user, company_name="ABC İnşaat")
    return user


@pytest.fixture
def assigned_project(db, contractor_user):
    admin = _make_user("admin1", "admin")
    project = Project.objects.create(name="Test Proje", province="İstanbul", owner=admin)
    ProjectContractor.objects.create(project=project, contractor=contractor_user, role="Taşeron")
    return project


def _login(client, username, password="pass"):
    r = client.post(
        "/api/auth/login",
        {"username": username, "password": password},
        content_type="application/json",
    )
    return r.json()["access_token"]


def test_contractor_sees_only_assigned_projects(client, contractor_user, assigned_project, db):
    token = _login(client, "contractor1")
    r = client.get("/api/contractor/my-projects", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert r.status_code == 200
    ids = [p["id"] for p in r.json()]
    assert assigned_project.id in ids


def test_contractor_cannot_see_unassigned_project(client, contractor_user, db):
    admin = _make_user("admin2", "admin")
    other = Project.objects.create(name="Diğer Proje", province="Ankara", owner=admin)
    token = _login(client, "contractor1")
    r = client.get("/api/contractor/my-projects", HTTP_AUTHORIZATION=f"Bearer {token}")
    ids = [p["id"] for p in r.json()]
    assert other.id not in ids


def test_contractor_sees_project_tasks(client, contractor_user, assigned_project, db):
    token = _login(client, "contractor1")
    r = client.get("/api/contractor/my-tasks", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert r.status_code == 200


def test_contractor_blocked_from_unassigned_documents(client, contractor_user, db):
    admin = _make_user("admin3", "admin")
    other = Project.objects.create(name="Başka Proje", province="Bursa", owner=admin)
    token = _login(client, "contractor1")
    r = client.get(f"/api/contractor/documents/{other.id}", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert r.status_code == 403


def test_admin_can_assign_contractor(client, db):
    admin = _make_user("admin4", "admin")
    contractor = _make_user("contractor2", "viewer")
    project = Project.objects.create(name="Proje", province="İzmir", owner=admin)
    token = _login(client, "admin4")
    r = client.post(
        f"/api/contractor/projects/{project.id}/contractors",
        {"contractor_id": contractor.id, "role": "Elektrik"},
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200


def test_admin_can_remove_contractor(client, db):
    admin = _make_user("admin5", "admin")
    contractor = _make_user("contractor3", "viewer")
    project = Project.objects.create(name="Proje2", province="Bursa", owner=admin)
    ProjectContractor.objects.create(project=project, contractor=contractor, role="Sıhhi")
    token = _login(client, "admin5")
    r = client.delete(
        f"/api/contractor/projects/{project.id}/contractors/{contractor.id}",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200

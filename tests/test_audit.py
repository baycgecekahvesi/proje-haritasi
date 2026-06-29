import pytest

from apps.audit.models import AuditLog
from apps.audit.middleware import log_action
from apps.projects.models import Project


@pytest.fixture
def sample_project(db, admin_user):
    return Project.objects.create(
        name="Audit Test Projesi",
        province="Ankara",
        status="aktif",
        progress=0,
        owner=admin_user,
    )


# --------------------------------------------------------------------------- #
# 1. Admin audit loglarını listeleyebilir
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_admin_can_list_audit_logs(client, admin_user, admin_headers):
    log_action(
        user=admin_user,
        action=AuditLog.Action.CREATE,
        model_name="Project",
        object_id="1",
        object_repr="Test Proje",
    )
    res = client.get("/api/audit/", **admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["count"] >= 1
    assert body["items"][0]["action"] == "CREATE"


# --------------------------------------------------------------------------- #
# 2. Viewer (izleyici) audit log listesine erişemez — 403
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_viewer_cannot_list_audit_logs(client, viewer_user, viewer_headers):
    res = client.get("/api/audit/", **viewer_headers)
    assert res.status_code == 403


# --------------------------------------------------------------------------- #
# 3. Proje oluşturulunca audit log kaydı oluşur
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_create_project_generates_audit_log(client, editor_user, editor_headers, admin_headers):
    res = client.post(
        "/api/projects/",
        data={"name": "Log Test Projesi", "province": "İzmir", "status": "aktif"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200

    logs_res = client.get("/api/audit/?model_name=Project", **admin_headers)
    assert logs_res.status_code == 200
    body = logs_res.json()
    create_logs = [item for item in body["items"] if item["action"] == "CREATE"]
    assert len(create_logs) >= 1
    assert create_logs[0]["model_name"] == "Project"


# --------------------------------------------------------------------------- #
# 4. Proje silinince audit log kaydı oluşur
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_delete_project_generates_audit_log(client, sample_project, admin_headers):
    res = client.delete(
        f"/api/projects/{sample_project.id}",
        **admin_headers,
    )
    assert res.status_code == 200

    logs_res = client.get(
        f"/api/audit/?model_name=Project&object_id={sample_project.id}",
        **admin_headers,
    )
    assert logs_res.status_code == 200
    body = logs_res.json()
    delete_logs = [item for item in body["items"] if item["action"] == "DELETE"]
    assert len(delete_logs) >= 1


# --------------------------------------------------------------------------- #
# 5. Kullanıcı bazlı log filtreleme çalışır
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_user_audit_logs_filtered(client, admin_user, editor_user, admin_headers):
    log_action(
        user=admin_user,
        action=AuditLog.Action.LOGIN,
        model_name="",
        object_id="",
        object_repr="admin login",
    )
    log_action(
        user=editor_user,
        action=AuditLog.Action.LOGIN,
        model_name="",
        object_id="",
        object_repr="editor login",
    )

    res = client.get(f"/api/audit/user/{admin_user.id}", **admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["count"] >= 1
    for item in body["items"]:
        assert item["user_username"] == "admin"

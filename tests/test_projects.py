import pytest

from apps.projects.models import Project


@pytest.fixture
def sample_project(db, admin_user):
    return Project.objects.create(
        name="Mevcut Proje", province="Ankara", status="aktif",
        progress=30, owner=admin_user,
    )


@pytest.mark.django_db
def test_create_project(client, editor_user, editor_headers):
    res = client.post(
        "/api/projects/",
        data={"name": "Test Proje", "province": "Ankara", "status": "aktif"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Test Proje"
    assert res.json()["owner_username"] == "editor"


@pytest.mark.django_db
def test_viewer_cannot_create(client, viewer_user, viewer_headers):
    res = client.post(
        "/api/projects/",
        data={"name": "Yetkisiz", "province": "İzmir", "status": "aktif"},
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_list_projects_paginated(client, sample_project, viewer_headers):
    res = client.get("/api/projects/", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["count"] == 1
    assert body["items"][0]["name"] == "Mevcut Proje"


@pytest.mark.django_db
def test_filter_by_province(client, sample_project, admin_user, viewer_headers):
    Project.objects.create(name="Diger", province="İzmir", owner=admin_user)
    res = client.get("/api/projects/?province=Ankara", **viewer_headers)
    assert res.status_code == 200
    assert res.json()["count"] == 1


@pytest.mark.django_db
def test_patch_project(client, sample_project, editor_headers):
    res = client.patch(
        f"/api/projects/{sample_project.id}",
        data={"progress": 75, "status": "tamamlandi"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    assert res.json()["progress"] == 75


@pytest.mark.django_db
def test_delete_project_admin_only(client, sample_project, editor_headers, admin_headers):
    res = client.delete(f"/api/projects/{sample_project.id}", **editor_headers)
    assert res.status_code == 403
    res2 = client.delete(f"/api/projects/{sample_project.id}", **admin_headers)
    assert res2.status_code == 200
    assert not Project.objects.filter(id=sample_project.id).exists()


@pytest.mark.django_db
def test_map_endpoint(client, sample_project, viewer_headers):
    res = client.get("/api/projects/map", **viewer_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["province"] == "Ankara"
    assert data[0]["project_count"] == 1


@pytest.mark.django_db
def test_task_crud(client, sample_project, editor_headers):
    # oluştur
    res = client.post(
        f"/api/projects/{sample_project.id}/tasks",
        data={"title": "Görev 1", "priority": "high"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    task_id = res.json()["id"]
    # güncelle
    res2 = client.patch(
        f"/api/projects/{sample_project.id}/tasks/{task_id}",
        data={"is_done": True},
        content_type="application/json",
        **editor_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["is_done"] is True
    # listele
    res3 = client.get(f"/api/projects/{sample_project.id}/tasks", **editor_headers)
    assert len(res3.json()) == 1

import pytest

from apps.projects.models import Project, Task
from apps.resources.models import Resource, TaskResource


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_project(db, admin_user):
    return Project.objects.create(
        name="Kaynak Test Proje",
        province="Ankara",
        status="aktif",
        progress=0,
        owner=admin_user,
    )


@pytest.fixture
def sample_task(db, sample_project, admin_user):
    return Task.objects.create(
        project=sample_project,
        title="Test Görevi",
        assignee=admin_user,
    )


@pytest.fixture
def sample_resource(db):
    return Resource.objects.create(
        name="Test Personeli",
        resource_type="PERSONNEL",
        unit="saat",
        capacity_per_day=8,
        cost_per_unit=100,
        is_active=True,
    )


@pytest.fixture
def sample_task_resource(db, sample_task, sample_resource):
    return TaskResource.objects.create(
        task=sample_task,
        resource=sample_resource,
        planned_quantity=10,
        unit_cost=100,
    )


# ── Testler ───────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_create_resource(client, editor_headers):
    """Editor yeni kaynak oluşturabilmeli."""
    res = client.post(
        "/api/resources",
        data={
            "name": "Ekskavatör",
            "resource_type": "EQUIPMENT",
            "unit": "adet",
            "capacity_per_day": "1",
            "cost_per_unit": "5000",
            "is_active": True,
            "notes": "Büyük ekskavatör",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Ekskavatör"
    assert body["resource_type"] == "EQUIPMENT"
    assert body["resource_type_display"] == "Ekipman"
    assert float(body["cost_per_unit"]) == 5000.0


@pytest.mark.django_db
def test_list_resources(client, sample_resource, viewer_headers):
    """Izleyici kaynak listesini görebilmeli."""
    res = client.get("/api/resources", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    names = [r["name"] for r in body]
    assert "Test Personeli" in names


@pytest.mark.django_db
def test_list_resources_filter_by_type(client, editor_headers):
    """resource_type filtresi çalışmalı."""
    Resource.objects.create(name="Beton", resource_type="MATERIAL", unit="m3")
    Resource.objects.create(name="Mühendis", resource_type="PERSONNEL", unit="saat")

    res = client.get("/api/resources?resource_type=MATERIAL", **editor_headers)
    assert res.status_code == 200
    body = res.json()
    types = {r["resource_type"] for r in body}
    assert types == {"MATERIAL"}


@pytest.mark.django_db
def test_assign_resource_to_task(client, sample_task, sample_resource, editor_headers):
    """Editor göreve kaynak atayabilmeli."""
    res = client.post(
        f"/api/resources/tasks/{sample_task.id}/resources",
        data={
            "resource_id": sample_resource.id,
            "planned_quantity": "8",
            "unit_cost": "100",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["task_id"] == sample_task.id
    assert body["resource_id"] == sample_resource.id
    assert float(body["planned_quantity"]) == 8.0
    assert float(body["planned_cost"]) == 800.0


@pytest.mark.django_db
def test_list_task_resources(client, sample_task_resource, viewer_headers):
    """Göreve atanmış kaynaklar listelenebilmeli."""
    task_id = sample_task_resource.task_id
    res = client.get(f"/api/resources/tasks/{task_id}/resources", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) == 1
    assert body[0]["resource_name"] == "Test Personeli"
    assert float(body[0]["planned_cost"]) == 1000.0


@pytest.mark.django_db
def test_resource_workload(client, sample_task_resource, viewer_headers):
    """Yük raporu endpoint'i doğru toplam döndürmeli."""
    res = client.get("/api/resources/workload/summary", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    row = next(r for r in body if r["resource_name"] == "Test Personeli")
    assert float(row["total_planned"]) == 10.0


@pytest.mark.django_db
def test_viewer_cannot_create_resource(client, viewer_headers):
    """Izleyici kaynak oluşturamamalı — 403 dönmeli."""
    res = client.post(
        "/api/resources",
        data={
            "name": "Yetkisiz Kaynak",
            "resource_type": "MATERIAL",
            "unit": "kg",
        },
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_patch_resource(client, sample_resource, editor_headers):
    """Editor kaynağı güncelleyebilmeli."""
    res = client.patch(
        f"/api/resources/{sample_resource.id}",
        data={"name": "Güncellenmiş Personel", "cost_per_unit": "150"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Güncellenmiş Personel"
    assert float(body["cost_per_unit"]) == 150.0


@pytest.mark.django_db
def test_delete_resource(client, sample_resource, admin_headers):
    """Admin kaynağı silebilmeli."""
    resource_id = sample_resource.id
    res = client.delete(f"/api/resources/{resource_id}", **admin_headers)
    assert res.status_code == 200
    assert not Resource.objects.filter(id=resource_id).exists()

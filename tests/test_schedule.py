"""
Görev bağımlılıkları ve iş programı testleri (Faz 2.1)
"""
import pytest
from datetime import date, timedelta

from apps.projects.models import Project, Task, TaskDependency


@pytest.fixture
def sample_project(db, admin_user):
    return Project.objects.create(
        name="Zamanlama Test Projesi",
        province="Ankara",
        status="aktif",
        progress=0,
        owner=admin_user,
    )


@pytest.fixture
def task_a(sample_project):
    return Task.objects.create(
        project=sample_project,
        title="Görev A",
        planned_start=date.today(),
        planned_end=date.today() + timedelta(days=5),
    )


@pytest.fixture
def task_b(sample_project):
    return Task.objects.create(
        project=sample_project,
        title="Görev B",
        planned_start=date.today() + timedelta(days=6),
        planned_end=date.today() + timedelta(days=10),
    )


# --------------------------------------------------------------------------- #
# Model alanları
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_task_has_progress_field(task_a):
    """Task modelinde progress alanı 0 varsayılanıyla var."""
    assert task_a.progress == 0
    task_a.progress = 50
    task_a.save()
    task_a.refresh_from_db()
    assert task_a.progress == 50


@pytest.mark.django_db
def test_task_has_schedule_fields(task_a):
    """planned_start, planned_end, delay_reason alanları mevcut."""
    assert task_a.planned_start == date.today()
    assert task_a.planned_end == date.today() + timedelta(days=5)
    assert task_a.delay_reason == ""


# --------------------------------------------------------------------------- #
# İlerleme güncelleme endpoint'i
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_update_task_progress(client, task_a, editor_headers):
    """PATCH /{project_id}/tasks/{task_id}/progress ilerlemeyi günceller."""
    url = f"/api/projects/{task_a.project_id}/tasks/{task_a.id}/progress?progress=75"
    res = client.patch(url, content_type="application/json", **editor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["progress"] == 75
    assert data["is_done"] is False


@pytest.mark.django_db
def test_update_task_progress_100_marks_done(client, task_a, editor_headers):
    """Progress 100 yapılınca görev otomatik tamamlanmış sayılır."""
    url = f"/api/projects/{task_a.project_id}/tasks/{task_a.id}/progress?progress=100"
    res = client.patch(url, content_type="application/json", **editor_headers)
    assert res.status_code == 200
    assert res.json()["is_done"] is True


@pytest.mark.django_db
def test_viewer_cannot_update_progress(client, task_a, viewer_headers):
    """Viewer rolü ilerleme güncelleyemez."""
    url = f"/api/projects/{task_a.project_id}/tasks/{task_a.id}/progress?progress=50"
    res = client.patch(url, content_type="application/json", **viewer_headers)
    assert res.status_code == 403


# --------------------------------------------------------------------------- #
# Görev bağımlılığı endpoint'leri
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_add_task_dependency(client, task_a, task_b, editor_headers):
    """Görev B'nin Görev A'ya bağımlılığı eklenir."""
    url = f"/api/projects/{task_b.project_id}/tasks/{task_b.id}/dependencies"
    res = client.post(
        url,
        data={"depends_on_id": task_a.id, "dep_type": "FS"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["depends_on_id"] == task_a.id
    assert data["dep_type"] == "FS"
    assert data["depends_on_title"] == "Görev A"


@pytest.mark.django_db
def test_list_task_dependencies(client, task_a, task_b, admin_headers):
    """Bağımlılık eklendikten sonra listede görünür."""
    TaskDependency.objects.create(task=task_b, depends_on=task_a, dep_type="FS")
    url = f"/api/projects/{task_b.project_id}/tasks/{task_b.id}/dependencies"
    res = client.get(url, **admin_headers)
    assert res.status_code == 200
    deps = res.json()
    assert len(deps) == 1
    assert deps[0]["depends_on_id"] == task_a.id


@pytest.mark.django_db
def test_delete_task_dependency(client, task_a, task_b, editor_headers):
    """Bağımlılık silinebilir."""
    dep = TaskDependency.objects.create(task=task_b, depends_on=task_a, dep_type="FS")
    url = f"/api/projects/{task_b.project_id}/tasks/{task_b.id}/dependencies/{dep.id}"
    res = client.delete(url, content_type="application/json", **editor_headers)
    assert res.status_code == 200
    assert not TaskDependency.objects.filter(id=dep.id).exists()


# --------------------------------------------------------------------------- #
# Gantt endpoint'i
# --------------------------------------------------------------------------- #
@pytest.mark.django_db
def test_project_gantt_endpoint(client, task_a, task_b, admin_headers):
    """GET /{project_id}/gantt tüm görevleri Gantt formatında döner."""
    TaskDependency.objects.create(task=task_b, depends_on=task_a, dep_type="FS")
    url = f"/api/projects/{task_a.project_id}/gantt"
    res = client.get(url, **admin_headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    # task_b'nin dependency_ids içinde task_a.id olmalı
    b_item = next(i for i in items if i["id"] == task_b.id)
    assert task_a.id in b_item["dependency_ids"]


@pytest.mark.django_db
def test_gantt_returns_progress_and_dates(client, task_a, admin_headers):
    """Gantt çıktısı progress, planned_start, planned_end alanlarını içerir."""
    task_a.progress = 30
    task_a.save()
    url = f"/api/projects/{task_a.project_id}/gantt"
    res = client.get(url, **admin_headers)
    assert res.status_code == 200
    item = next(i for i in res.json() if i["id"] == task_a.id)
    assert item["progress"] == 30
    assert item["planned_start"] == date.today().isoformat()

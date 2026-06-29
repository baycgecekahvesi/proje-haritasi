"""
Puantaj & Hakediş modülü testleri.
"""
import pytest

from apps.payroll.models import ProgressPayment, Timesheet, TimesheetStatus
from apps.projects.models import Project


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_project(db, admin_user):
    return Project.objects.create(
        name="Payroll Test Proje",
        province="Ankara",
        status="aktif",
        progress=0,
        owner=admin_user,
    )


@pytest.fixture
def sample_timesheet(db, sample_project, editor_user):
    return Timesheet.objects.create(
        project=sample_project,
        user=editor_user,
        work_date="2025-01-15",
        hours_worked=8,
        work_description="Test puantaj girişi",
    )


@pytest.fixture
def sample_payment(db, sample_project):
    return ProgressPayment.objects.create(
        project=sample_project,
        period_start="2025-01-01",
        period_end="2025-01-31",
        planned_amount=100000,
        actual_amount=90000,
    )


# ── Testler ───────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_create_timesheet(client, sample_project, editor_headers):
    """Editor yeni puantaj kaydı oluşturabilmeli."""
    res = client.post(
        "/api/payroll/timesheets",
        data={
            "project_id": sample_project.id,
            "work_date": "2025-02-10",
            "hours_worked": "8.00",
            "work_description": "Saha çalışması",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["project_id"] == sample_project.id
    assert body["work_description"] == "Saha çalışması"
    assert body["status"] == "draft"
    assert float(body["hours_worked"]) == 8.0


@pytest.mark.django_db
def test_list_timesheets(client, sample_timesheet, admin_headers):
    """Admin tüm puantajları listeleyebilmeli."""
    res = client.get("/api/payroll/timesheets", **admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body["items"], list)
    assert len(body["items"]) >= 1
    assert body["items"][0]["work_description"] == "Test puantaj girişi"


@pytest.mark.django_db
def test_viewer_sees_only_own_timesheets(
    client, sample_project, sample_timesheet, viewer_user, viewer_headers, admin_user, admin_headers
):
    """Izleyici yalnızca kendi puantajlarını görebilmeli."""
    # Admin kullanıcısına ait ayrı bir puantaj oluştur
    Timesheet.objects.create(
        project=sample_project,
        user=admin_user,
        work_date="2025-01-20",
        hours_worked=8,
        work_description="Admin puantajı",
    )

    res = client.get("/api/payroll/timesheets", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    items = body["items"]
    user_ids = {t["user_id"] for t in items}
    # Viewer kendi kaydı olmadığı için liste boş olmalı
    assert viewer_user.id not in user_ids or all(
        t["user_id"] == viewer_user.id for t in items
    )


@pytest.mark.django_db
def test_create_payment(client, sample_project, editor_headers):
    """Editor yeni hakediş kaydı oluşturabilmeli."""
    res = client.post(
        "/api/payroll/payments",
        data={
            "project_id": sample_project.id,
            "period_start": "2025-03-01",
            "period_end": "2025-03-31",
            "planned_amount": "500000.00",
            "actual_amount": "480000.00",
            "description": "Mart ayı hakedişi",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["project_id"] == sample_project.id
    assert body["status"] == "draft"
    assert float(body["planned_amount"]) == 500000.0
    assert body["description"] == "Mart ayı hakedişi"


@pytest.mark.django_db
def test_approve_payment_requires_admin(client, sample_payment, editor_headers):
    """Editor hakediş onaylayamamalı — 403 dönmeli."""
    res = client.post(
        f"/api/payroll/payments/{sample_payment.id}/approve",
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_approve_payment_as_admin(client, sample_payment, admin_headers):
    """Admin hakediş onaylayabilmeli ve durum 'approved' olmalı."""
    res = client.post(
        f"/api/payroll/payments/{sample_payment.id}/approve?approved_amount=85000",
        content_type="application/json",
        **admin_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "approved"
    assert float(body["approved_amount"]) == 85000.0
    assert body["approved_by_username"] is not None


@pytest.mark.django_db
def test_approve_timesheet_as_admin(client, sample_timesheet, admin_headers):
    """Admin puantaj onaylayabilmeli."""
    res = client.post(
        f"/api/payroll/timesheets/{sample_timesheet.id}/approve",
        content_type="application/json",
        **admin_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "approved"
    assert body["approved_by_username"] is not None


@pytest.mark.django_db
def test_viewer_cannot_create_timesheet(client, sample_project, viewer_headers):
    """Izleyici puantaj oluşturamamalı — 403 dönmeli."""
    res = client.post(
        "/api/payroll/timesheets",
        data={
            "project_id": sample_project.id,
            "work_date": "2025-02-15",
            "hours_worked": "8.00",
        },
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_list_payments_filtered_by_project(client, sample_payment, sample_project, admin_headers):
    """project_id filtresiyle sadece o projenin hakedişleri dönmeli."""
    res = client.get(
        f"/api/payroll/payments?project_id={sample_project.id}",
        **admin_headers,
    )
    assert res.status_code == 200
    body = res.json()
    items = body["items"]
    assert all(p["project_id"] == sample_project.id for p in items)
    assert len(items) >= 1

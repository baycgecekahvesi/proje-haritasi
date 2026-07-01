from decimal import Decimal

import pytest

from apps.budget.models import Budget, BudgetLine
from apps.projects.models import Project


@pytest.fixture
def project(db, admin_user):
    return Project.objects.create(name="Bütçeli", province="Bursa", owner=admin_user)


@pytest.mark.django_db
def test_get_budget_creates_empty(client, project, viewer_headers):
    res = client.get(f"/api/budget/{project.id}", **viewer_headers)
    assert res.status_code == 200
    assert res.json()["planned_amount"] == "0.00"
    assert Budget.objects.filter(project=project).exists()


@pytest.mark.django_db
def test_update_budget(client, project, editor_headers):
    res = client.patch(
        f"/api/budget/{project.id}",
        data={"planned_amount": "100000", "currency": "TRY"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    assert res.json()["planned_amount"] == "100000.00"


@pytest.mark.django_db
def test_add_and_compute_usage(client, project, editor_headers):
    client.patch(
        f"/api/budget/{project.id}",
        data={"planned_amount": "1000"},
        content_type="application/json",
        **editor_headers,
    )
    res = client.post(
        f"/api/budget/{project.id}/expenses",
        data={"description": "Malzeme", "amount": "250", "expense_type": "material", "date": "2026-01-01"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    budget = client.get(f"/api/budget/{project.id}", **editor_headers).json()
    assert Decimal(str(budget["total_spent"])) == Decimal("250")
    assert Decimal(str(budget["remaining"])) == Decimal("750")
    assert budget["usage_percent"] == 25.0
    assert budget["is_over_budget"] is False


@pytest.mark.django_db
def test_over_budget_flag(client, project, editor_headers):
    client.patch(
        f"/api/budget/{project.id}",
        data={"planned_amount": "100"},
        content_type="application/json",
        **editor_headers,
    )
    client.post(
        f"/api/budget/{project.id}/expenses",
        data={"description": "Asim", "amount": "150", "date": "2026-01-01"},
        content_type="application/json",
        **editor_headers,
    )
    budget = client.get(f"/api/budget/{project.id}", **editor_headers).json()
    assert budget["is_over_budget"] is True


@pytest.mark.django_db
def test_viewer_cannot_add_expense(client, project, viewer_headers):
    res = client.post(
        f"/api/budget/{project.id}/expenses",
        data={"description": "x", "amount": "1", "date": "2026-01-01"},
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


# --- WBS Bütçe Kalemleri ---

@pytest.mark.django_db
def test_add_budget_line(client, project, editor_headers):
    res = client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "malzeme", "description": "Kablo", "planned_amount": "50000", "actual_amount": "0"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "malzeme"
    assert data["category_display"] == "Malzeme"
    assert Decimal(str(data["planned_amount"])) == Decimal("50000")


@pytest.mark.django_db
def test_list_budget_lines(client, project, editor_headers, viewer_headers):
    client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "iscilik", "description": "Montaj ekibi", "planned_amount": "30000"},
        content_type="application/json",
        **editor_headers,
    )
    res = client.get(f"/api/budget/{project.id}/lines", **viewer_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1


@pytest.mark.django_db
def test_update_budget_line(client, project, editor_headers):
    r = client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "ekipman", "description": "Vinç", "planned_amount": "20000", "actual_amount": "0"},
        content_type="application/json",
        **editor_headers,
    )
    line_id = r.json()["id"]
    res = client.patch(
        f"/api/budget/{project.id}/lines/{line_id}",
        data={"actual_amount": "18000"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    assert Decimal(str(res.json()["actual_amount"])) == Decimal("18000")


@pytest.mark.django_db
def test_delete_budget_line(client, project, editor_headers):
    r = client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "diger", "description": "Test Kalem", "planned_amount": "1000"},
        content_type="application/json",
        **editor_headers,
    )
    line_id = r.json()["id"]
    res = client.delete(f"/api/budget/{project.id}/lines/{line_id}", **editor_headers)
    assert res.status_code == 200
    assert not BudgetLine.objects.filter(id=line_id).exists()


@pytest.mark.django_db
def test_viewer_cannot_add_line(client, project, viewer_headers):
    res = client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "malzeme", "description": "Kablo", "planned_amount": "1000"},
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_budget_response_includes_lines(client, project, editor_headers):
    client.post(
        f"/api/budget/{project.id}/lines",
        data={"category": "taseron", "description": "Alt yüklenici", "planned_amount": "75000"},
        content_type="application/json",
        **editor_headers,
    )
    res = client.get(f"/api/budget/{project.id}", **editor_headers)
    assert res.status_code == 200
    assert "lines" in res.json()
    assert len(res.json()["lines"]) == 1

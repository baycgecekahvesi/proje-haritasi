from decimal import Decimal

import pytest

from apps.budget.models import Budget
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

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.budget.models import Budget, Expense
from apps.projects.models import Project


@pytest.fixture
def data(db, admin_user):
    today = date.today()
    p1 = Project.objects.create(
        name="Aktif", province="Ankara", status="aktif", progress=50, owner=admin_user,
        planned_end=today + timedelta(days=30),
    )
    p2 = Project.objects.create(
        name="Tamamlanan", province="Ankara", status="tamamlandi", progress=100, owner=admin_user,
    )
    # Geciken proje
    p3 = Project.objects.create(
        name="Geciken", province="İzmir", status="aktif", progress=20, owner=admin_user,
        planned_end=today - timedelta(days=5),
    )
    b = Budget.objects.create(project=p1, planned_amount=1000)
    Expense.objects.create(budget=b, description="x", amount=400, date=today)
    # Bütçe aşan
    b2 = Budget.objects.create(project=p3, planned_amount=100)
    Expense.objects.create(budget=b2, description="y", amount=200, date=today)
    return p1, p2, p3


@pytest.mark.django_db
def test_summary(client, data, viewer_headers):
    res = client.get("/api/reports/summary", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total_projects"] == 3
    assert body["active_projects"] == 2
    assert body["completed_projects"] == 1
    assert body["delayed_projects"] == 1


@pytest.mark.django_db
def test_by_province(client, data, viewer_headers):
    res = client.get("/api/reports/by-province", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    ankara = next(r for r in body if r["province"] == "Ankara")
    assert ankara["project_count"] == 2


@pytest.mark.django_db
def test_budget_overview(client, data, viewer_headers):
    res = client.get("/api/reports/budget-overview", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert Decimal(str(body["total_planned"])) == Decimal("1100")
    assert Decimal(str(body["total_spent"])) == Decimal("600")
    assert body["over_budget_count"] == 1


@pytest.mark.django_db
def test_timeline(client, data, viewer_headers):
    res = client.get("/api/reports/timeline", **viewer_headers)
    assert res.status_code == 200
    names = [t["project_name"] for t in res.json()]
    assert "Geciken" in names

"""
KPI Dashboard ve S-Eğrisi endpoint testleri.
"""
from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.budget.models import Budget, Expense
from apps.projects.models import Project, Task


@pytest.fixture
def kpi_data(db, admin_user):
    today = date.today()
    p1 = Project.objects.create(
        name="Aktif Proje",
        province="Ankara",
        status="aktif",
        progress=60,
        owner=admin_user,
        planned_start=today - timedelta(days=60),
        planned_end=today + timedelta(days=30),
    )
    p2 = Project.objects.create(
        name="Tamamlanan",
        province="İzmir",
        status="tamamlandi",
        progress=100,
        owner=admin_user,
        planned_start=today - timedelta(days=90),
        planned_end=today - timedelta(days=10),
    )
    p3 = Project.objects.create(
        name="Geciken Proje",
        province="Ankara",
        status="aktif",
        progress=20,
        owner=admin_user,
        planned_start=today - timedelta(days=90),
        planned_end=today - timedelta(days=5),
    )
    b1 = Budget.objects.create(project=p1, planned_amount=Decimal("10000"))
    Expense.objects.create(budget=b1, description="Harcama 1", amount=Decimal("4000"), date=today)
    b3 = Budget.objects.create(project=p3, planned_amount=Decimal("5000"))
    Expense.objects.create(budget=b3, description="Harcama 3", amount=Decimal("2000"), date=today)
    return p1, p2, p3


@pytest.mark.django_db
def test_kpi_dashboard_returns_data(client, kpi_data, viewer_headers):
    """KPI dashboard endpoint doğru veri döndürür."""
    res = client.get("/api/reports/dashboard/kpi", **viewer_headers)
    assert res.status_code == 200
    body = res.json()

    assert body["toplam_proje"] == 3
    assert body["aktif_proje"] == 2
    assert body["tamamlanan_proje"] == 1
    assert body["geciken_proje"] == 1

    assert Decimal(str(body["toplam_butce"])) == Decimal("15000")
    assert Decimal(str(body["toplam_harcama"])) == Decimal("6000")
    assert Decimal(str(body["toplam_kalan"])) == Decimal("9000")
    assert body["butce_kullanim_orani"] == 40.0

    assert "il_bazli_performans" in body
    assert isinstance(body["il_bazli_performans"], list)


@pytest.mark.django_db
def test_kpi_dashboard_requires_auth(client, kpi_data):
    """Token olmadan KPI endpoint 401 döndürür."""
    res = client.get("/api/reports/dashboard/kpi")
    assert res.status_code == 401


@pytest.mark.django_db
def test_s_curve_returns_data(client, kpi_data, viewer_headers):
    """S-eğrisi endpoint planlanan proje için haftalık veri döndürür."""
    p1 = kpi_data[0]
    res = client.get(f"/api/reports/projects/{p1.id}/s-curve", **viewer_headers)
    assert res.status_code == 200
    body = res.json()

    assert isinstance(body, list)
    assert len(body) > 0

    first = body[0]
    assert "week" in first
    assert "planned_pct" in first
    assert "actual_pct" in first
    assert first["planned_pct"] >= 0


@pytest.mark.django_db
def test_s_curve_empty_for_project_without_dates(client, db, admin_user, viewer_headers):
    """Tarihleri olmayan proje için S-eğrisi boş liste döner."""
    p = Project.objects.create(
        name="Tarihsiz", province="Bursa", status="aktif",
        progress=0, owner=admin_user,
    )
    res = client.get(f"/api/reports/projects/{p.id}/s-curve", **viewer_headers)
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.django_db
def test_s_curve_not_found_returns_404(client, viewer_headers):
    """Var olmayan proje ID'si için 404 döner."""
    res = client.get("/api/reports/projects/99999/s-curve", **viewer_headers)
    assert res.status_code == 404

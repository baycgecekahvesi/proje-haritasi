import pytest
from datetime import date, timedelta

from apps.accounts.models import Role, User, UserProfile
from apps.accounts.services import create_token
from apps.projects.models import Project


@pytest.fixture
def ai_admin(db):
    user = User.objects.create_user(username="ai_admin", password="pass")
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = Role.ADMIN
    profile.save(update_fields=["role"])
    return user


@pytest.fixture
def ai_project(db, ai_admin):
    return Project.objects.create(
        name="AI Test Proje",
        province="İstanbul",
        owner=ai_admin,
        planned_start=date.today() - timedelta(days=60),
        planned_end=date.today() - timedelta(days=10),
        progress=40,
    )


def _headers(user):
    return {"HTTP_AUTHORIZATION": f"Bearer {create_token(user)}"}


def test_delay_risk_valid(client, ai_project, ai_admin, db):
    r = client.get(
        f"/api/ai/project/{ai_project.id}/delay-risk",
        **_headers(ai_admin),
    )
    assert r.status_code == 200
    d = r.json()
    assert 0.0 <= d["delay_probability"] <= 1.0
    assert d["risk_level"] in ("low", "medium", "high")


def test_delayed_project_high_risk(client, ai_project, ai_admin, db):
    r = client.get(
        f"/api/ai/project/{ai_project.id}/delay-risk",
        **_headers(ai_admin),
    )
    assert r.json()["delay_probability"] > 0.3


def test_budget_forecast_valid(client, ai_project, ai_admin, db):
    r = client.get(
        f"/api/ai/project/{ai_project.id}/budget-forecast",
        **_headers(ai_admin),
    )
    assert r.status_code == 200
    d = r.json()
    assert "burn_rate_per_day" in d
    assert "forecast_overrun" in d


def test_similar_projects_valid(client, ai_project, ai_admin, db):
    r = client.get(
        f"/api/ai/project/{ai_project.id}/similar-projects",
        **_headers(ai_admin),
    )
    assert r.status_code == 200
    assert "similar_projects" in r.json()

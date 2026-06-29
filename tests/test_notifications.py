"""
check_deadlines yönetim komutu için testler.

Senaryolar:
  - Gecikmiş proje sahibine bildirim oluşturulur
  - Gecikmiş göreve atanan kullanıcıya bildirim oluşturulur
  - Aynı gün aynı bildirim iki kez oluşturulmaz
  - dry-run modunda veritabanına yazılmaz
  - Bütçe %80 aşımında bildirim oluşturulur
"""
from datetime import date, timedelta

import pytest
from django.core.management import call_command

from apps.accounts.models import Bildirim, Role, User, UserProfile
from apps.budget.models import Budget, Expense
from apps.projects.models import Project, ProjectStatus, Task


# ---------------------------------------------------------------------------
# Yardımcılar
# ---------------------------------------------------------------------------

def _make_user(username, role=Role.EDITOR):
    user = User.objects.create_user(username=username, password="test123")
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save(update_fields=["role"])
    return user


def _make_project(owner, province="Ankara", days_overdue=5, status=ProjectStatus.ACTIVE):
    planned_end = date.today() - timedelta(days=days_overdue)
    return Project.objects.create(
        name=f"Proje-{owner.username}",
        province=province,
        owner=owner,
        status=status,
        planned_end=planned_end,
    )


def _make_task(project, assignee, days_overdue=3):
    due_date = date.today() - timedelta(days=days_overdue)
    return Task.objects.create(
        project=project,
        title=f"Gorev-{assignee.username}",
        assignee=assignee,
        due_date=due_date,
        is_done=False,
    )


# ---------------------------------------------------------------------------
# Test 1: Gecikmiş proje sahibine bildirim oluşturulur
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_deadlines_creates_bildirim_for_delayed_project():
    owner = _make_user("owner1")
    _make_project(owner, days_overdue=5)

    assert Bildirim.objects.filter(alici=owner).count() == 0

    call_command("check_deadlines")

    bildirimleri = Bildirim.objects.filter(alici=owner)
    assert bildirimleri.count() == 1
    b = bildirimleri.first()
    assert "Geciken Proje" in b.baslik
    assert "gün gecikme" in b.mesaj


# ---------------------------------------------------------------------------
# Test 2: Gecikmiş göreve atanan kullanıcıya bildirim oluşturulur
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_deadlines_creates_bildirim_for_overdue_task():
    owner = _make_user("owner2")
    assignee = _make_user("assignee2")
    # Bitişi geçmemiş bir proje (görev gecikmesi projeyle aynı olmak zorunda değil)
    project = Project.objects.create(
        name="AktifProje",
        province="Bursa",
        owner=owner,
        status=ProjectStatus.ACTIVE,
    )
    _make_task(project, assignee, days_overdue=3)

    assert Bildirim.objects.filter(alici=assignee).count() == 0

    call_command("check_deadlines")

    bildirimleri = Bildirim.objects.filter(alici=assignee)
    assert bildirimleri.count() == 1
    b = bildirimleri.first()
    assert "Geciken Gorev" in b.baslik
    assert "gün gecikme" in b.mesaj


# ---------------------------------------------------------------------------
# Test 3: Aynı gün aynı bildirim iki kez oluşturulmaz
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_deadlines_no_duplicate():
    owner = _make_user("owner3")
    _make_project(owner, days_overdue=2)

    call_command("check_deadlines")
    call_command("check_deadlines")  # ikinci çalıştırma

    # Yalnızca 1 bildirim olmalı
    assert Bildirim.objects.filter(alici=owner).count() == 1


# ---------------------------------------------------------------------------
# Test 4: --dry-run modunda veritabanına yazılmaz
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_deadlines_dry_run_does_not_create():
    owner = _make_user("owner4")
    _make_project(owner, days_overdue=7)

    call_command("check_deadlines", dry_run=True)

    assert Bildirim.objects.filter(alici=owner).count() == 0


# ---------------------------------------------------------------------------
# Test 5: Bütçe %80+ aşımında bildirim oluşturulur
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_deadlines_creates_bildirim_for_budget_overrun():
    owner = _make_user("owner5")
    # Gecikmiş olmasın diye bitiş tarihi vermeyelim
    project = Project.objects.create(
        name="BütçeliProje",
        province="Izmir",
        owner=owner,
        status=ProjectStatus.ACTIVE,
    )
    budget = Budget.objects.create(project=project, planned_amount="100000.00", currency="TRY")
    # %85 harcama
    Expense.objects.create(
        budget=budget,
        description="Test harcama",
        amount="85000.00",
        date=date.today(),
    )

    assert Bildirim.objects.filter(alici=owner).count() == 0

    call_command("check_deadlines")

    bildirimleri = Bildirim.objects.filter(alici=owner)
    assert bildirimleri.count() == 1
    b = bildirimleri.first()
    assert "Butce Uyarisi" in b.baslik
    assert "85" in b.mesaj  # %85.0 içeriyor mu

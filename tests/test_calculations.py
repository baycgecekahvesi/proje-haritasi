"""
Mühendislik hesaplama modülü testleri.
apps/calculations/ — 5 senaryo
"""
import pytest
from apps.accounts.models import Role, User, UserProfile
from apps.accounts.services import create_token


def _make_calc_user(username="calc_user", password="pass"):
    user = User.objects.create_user(username=username, password=password)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = Role.EDITOR
    profile.save(update_fields=["role"])
    return user


@pytest.fixture
def auth_client(client, db):
    user = _make_calc_user()
    token = create_token(user)
    return client, token


def test_get_calc_types(auth_client, db):
    """GET /calculations/types — tüm kategoriler döner."""
    client, token = auth_client
    r = client.get(
        "/api/calculations/types",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200
    data = r.json()
    assert "electric" in data
    assert "automation" in data
    assert "electronic" in data


def test_cable_section_calculation(auth_client, db):
    """POST /calculations/run — kablo kesiti hesabı (IEC 60364-5-52)."""
    client, token = auth_client
    r = client.post(
        "/api/calculations/run",
        {
            "calc_type": "cable_section",
            "inputs": {"current_a": 50, "length_m": 100, "voltage_v": 400},
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200
    result = r.json()["result"]
    assert "selected_section_mm2" in result
    assert result["selected_section_mm2"] > 0
    assert result["standard"] == "IEC 60364-5-52"


def test_motor_current_calculation(auth_client, db):
    """POST /calculations/run — 22 kW motor akım hesabı."""
    client, token = auth_client
    r = client.post(
        "/api/calculations/run",
        {
            "calc_type": "motor_current",
            "inputs": {"power_kw": 22, "voltage_v": 380},
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200
    result = r.json()["result"]
    assert result["full_load_current_a"] > 0
    assert result["starting_current_a"] > result["full_load_current_a"]


def test_pneumatic_cylinder_force(auth_client, db):
    """POST /calculations/run — pnömatik silindir kuvveti (ISO 6432)."""
    client, token = auth_client
    r = client.post(
        "/api/calculations/run",
        {
            "calc_type": "pneumatic_cylinder_force",
            "inputs": {"bore_mm": 63, "pressure_bar": 6.0},
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200
    result = r.json()["result"]
    assert result["actual_force_kgf"] > 0
    assert result["actual_force_n"] > result["actual_force_kgf"]  # N > kgf her zaman


def test_save_and_list_calculation(auth_client, db):
    """POST /calculations/save + GET /calculations/history — kaydetme ve listeleme."""
    client, token = auth_client
    r = client.post(
        "/api/calculations/save",
        {
            "category": "electric",
            "calc_type": "ohms_law",
            "title": "Test Ohm Hesabı",
            "inputs": {"voltage_v": 24, "resistance_ohm": 100},
            "result": {"current_a": 0.24, "power_w": 5.76},
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r.status_code == 200
    saved_id = r.json()["id"]
    assert saved_id > 0

    r2 = client.get(
        "/api/calculations/history",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )
    assert r2.status_code == 200
    history = r2.json()
    assert len(history) >= 1
    assert any(h["id"] == saved_id for h in history)

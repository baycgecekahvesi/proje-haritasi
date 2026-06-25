import pytest

from apps.projects.models import Project
from apps.risks.models import Risk


@pytest.fixture
def sample_project_risk(db, admin_user):
    return Project.objects.create(
        name="Risk Test Proje", province="İstanbul", status="aktif",
        progress=50, owner=admin_user,
    )


@pytest.fixture
def sample_risk(db, sample_project_risk):
    return Risk.objects.create(
        proje=sample_project_risk,
        baslik="Teknik Risk 1",
        aciklama="Test risk açıklaması",
        kategori="teknik",
        olasilik=3,
        etki=3,
        durum="acik",
    )


@pytest.mark.django_db
def test_list_risks(client, sample_risk, viewer_headers):
    res = client.get("/api/risks", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert body[0]["baslik"] == "Teknik Risk 1"


@pytest.mark.django_db
def test_create_risk(client, sample_project_risk, editor_headers):
    res = client.post(
        "/api/risks",
        data={
            "proje_id": sample_project_risk.id,
            "baslik": "Yeni Risk",
            "aciklama": "Yeni risk açıklaması",
            "kategori": "mali",
            "olasilik": 4,
            "etki": 2,
            "durum": "acik",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["baslik"] == "Yeni Risk"
    assert body["kategori"] == "mali"
    assert body["olasilik"] == 4


@pytest.mark.django_db
def test_viewer_cannot_create(client, sample_project_risk, viewer_headers):
    res = client.post(
        "/api/risks",
        data={
            "proje_id": sample_project_risk.id,
            "baslik": "Yetkisiz Risk",
            "kategori": "teknik",
        },
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_patch_risk(client, sample_risk, editor_headers):
    res = client.patch(
        f"/api/risks/{sample_risk.id}",
        data={"baslik": "Güncellenmiş Risk", "durum": "izleniyor"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["baslik"] == "Güncellenmiş Risk"
    assert body["durum"] == "izleniyor"


@pytest.mark.django_db
def test_delete_risk(client, sample_risk, editor_headers):
    risk_id = sample_risk.id
    res = client.delete(f"/api/risks/{risk_id}", **editor_headers)
    assert res.status_code == 200
    assert not Risk.objects.filter(id=risk_id).exists()


@pytest.mark.django_db
def test_heatmap_data(client, sample_risk, viewer_headers):
    res = client.get("/api/risks/heatmap/data", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert body[0]["x"] == 3
    assert body[0]["y"] == 3
    assert body[0]["skor"] == 9


@pytest.mark.django_db
def test_risk_skor_seviye(client, sample_project_risk, editor_headers):
    res = client.post(
        "/api/risks",
        data={
            "proje_id": sample_project_risk.id,
            "baslik": "Kritik Risk",
            "olasilik": 5,
            "etki": 5,
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["skor"] == 25
    assert body["seviye"] == "kritik"

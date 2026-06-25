import pytest

from apps.projects.models import Project
from apps.punchlist.models import PunchItem


@pytest.fixture
def sample_project_punch(db, admin_user):
    return Project.objects.create(
        name="Punch Test Proje", province="Bursa", status="aktif",
        progress=75, owner=admin_user,
    )


@pytest.fixture
def sample_punch(db, sample_project_punch):
    return PunchItem.objects.create(
        proje=sample_project_punch,
        tur="fat",
        baslik="FAT Kontrol Noktası 1",
        aciklama="Test FAT punch item",
        kategori="elektrik",
        oncelik="A",
        durum="acik",
    )


@pytest.mark.django_db
def test_list_punch(client, sample_punch, viewer_headers):
    res = client.get("/api/punch", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert body[0]["baslik"] == "FAT Kontrol Noktası 1"


@pytest.mark.django_db
def test_create_punch(client, sample_project_punch, editor_headers):
    res = client.post(
        "/api/punch",
        data={
            "proje_id": sample_project_punch.id,
            "tur": "sat",
            "baslik": "SAT Kontrol Noktası",
            "aciklama": "SAT açıklaması",
            "kategori": "otomasyon",
            "oncelik": "B",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["baslik"] == "SAT Kontrol Noktası"
    assert body["tur"] == "sat"
    assert body["no"].startswith("SAT-")


@pytest.mark.django_db
def test_viewer_cannot_create(client, sample_project_punch, viewer_headers):
    res = client.post(
        "/api/punch",
        data={
            "proje_id": sample_project_punch.id,
            "baslik": "Yetkisiz Punch",
            "tur": "fat",
        },
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_patch_punch(client, sample_punch, editor_headers):
    res = client.patch(
        f"/api/punch/{sample_punch.id}",
        data={"baslik": "Güncellenmiş Punch", "durum": "kapandi"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["baslik"] == "Güncellenmiş Punch"
    assert body["durum"] == "kapandi"


@pytest.mark.django_db
def test_delete_punch(client, sample_punch, editor_headers):
    item_id = sample_punch.id
    res = client.delete(f"/api/punch/{item_id}", **editor_headers)
    assert res.status_code == 200
    assert not PunchItem.objects.filter(id=item_id).exists()


@pytest.mark.django_db
def test_punch_ozet(client, sample_project_punch, sample_punch, viewer_headers):
    PunchItem.objects.create(
        proje=sample_project_punch, tur="fat", baslik="FAT-2", kategori="diger", oncelik="A", durum="acik"
    )
    PunchItem.objects.create(
        proje=sample_project_punch, tur="fat", baslik="FAT-3", kategori="diger", oncelik="B", durum="kapandi"
    )
    res = client.get(f"/api/punch/ozet?proje_id={sample_project_punch.id}", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["toplam"] == 3
    assert body["acik"] == 2
    assert body["kapandi"] == 1
    assert body["kritik_acik"] == 2


@pytest.mark.django_db
def test_punch_filter_by_durum(client, sample_project_punch, editor_headers, viewer_headers):
    PunchItem.objects.create(
        proje=sample_project_punch, tur="fat", baslik="Devam", durum="devam"
    )
    res = client.get(f"/api/punch?proje_id={sample_project_punch.id}&durum=devam", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["durum"] == "devam"

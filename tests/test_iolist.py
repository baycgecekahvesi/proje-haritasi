import pytest

from apps.projects.models import Project
from apps.iolist.models import IOPoint


@pytest.fixture
def sample_project_io(db, admin_user):
    return Project.objects.create(
        name="IO Test Proje", province="Ankara", status="aktif",
        progress=60, owner=admin_user,
    )


@pytest.fixture
def sample_io(db, sample_project_io):
    return IOPoint.objects.create(
        proje=sample_project_io,
        tag_no="FIC-101",
        tanim="Akış Kontrol Enstrümanı",
        sinyal_tipi="AI",
        proses_deger="4-20mA",
        durum="taslak",
        kablo_durum="bekliyor",
    )


@pytest.mark.django_db
def test_list_io(client, sample_io, viewer_headers):
    res = client.get("/api/io", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert body[0]["tag_no"] == "FIC-101"


@pytest.mark.django_db
def test_create_io(client, sample_project_io, editor_headers):
    res = client.post(
        "/api/io",
        data={
            "proje_id": sample_project_io.id,
            "tag_no": "LSH-202",
            "tanim": "Seviye Anahtarı",
            "sinyal_tipi": "DI",
            "proses_deger": "NC/NO",
        },
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["tag_no"] == "LSH-202"
    assert body["tanim"] == "Seviye Anahtarı"


@pytest.mark.django_db
def test_viewer_cannot_create(client, sample_project_io, viewer_headers):
    res = client.post(
        "/api/io",
        data={
            "proje_id": sample_project_io.id,
            "tag_no": "TIC-303",
            "tanim": "Sıcaklık Kontrolü",
            "sinyal_tipi": "RTD",
        },
        content_type="application/json",
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_patch_io(client, sample_io, editor_headers):
    res = client.patch(
        f"/api/io/{sample_io.id}",
        data={"tanim": "Güncellenmiş FIC", "durum": "onaylandi"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["tanim"] == "Güncellenmiş FIC"
    assert body["durum"] == "onaylandi"


@pytest.mark.django_db
def test_delete_io(client, sample_io, editor_headers):
    io_id = sample_io.id
    res = client.delete(f"/api/io/{io_id}", **editor_headers)
    assert res.status_code == 200
    assert not IOPoint.objects.filter(id=io_id).exists()


@pytest.mark.django_db
def test_io_ozet(client, sample_project_io, sample_io, viewer_headers):
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="DI-101", tanim="DI Test", sinyal_tipi="DI"
    )
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="DO-101", tanim="DO Test", sinyal_tipi="DO"
    )
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="AI-201", tanim="AI Test", sinyal_tipi="AI"
    )
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="TC-301", tanim="TC Test", sinyal_tipi="TC", kablo_durum="test_ok"
    )
    res = client.get(f"/api/io/ozet?proje_id={sample_project_io.id}", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["toplam"] == 5
    assert body["di"] == 1
    assert body["do_"] == 1
    assert body["ai"] == 2
    assert body["ao"] == 0
    assert body["kablo_test_ok"] == 1


@pytest.mark.django_db
def test_io_search(client, sample_project_io, viewer_headers):
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="PSV-101", tanim="Basınç Emniyet Ventili",
        sinyal_tipi="DI", alan_cihaz="PLC-Main"
    )
    res = client.get(f"/api/io?proje_id={sample_project_io.id}&q=PSV", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["tag_no"] == "PSV-101"


@pytest.mark.django_db
def test_io_search_by_tanim(client, sample_project_io, viewer_headers):
    IOPoint.objects.create(
        proje=sample_project_io, tag_no="XX-999", tanim="Benzersiz Açıklama Test",
        sinyal_tipi="DO"
    )
    res = client.get(f"/api/io?proje_id={sample_project_io.id}&q=Benzersiz", **viewer_headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["tanim"] == "Benzersiz Açıklama Test"


@pytest.mark.django_db
def test_io_unique_constraint(db, sample_project_io, sample_io):
    from apps.iolist.models import IOPoint
    with pytest.raises(Exception):
        IOPoint.objects.create(
            proje=sample_project_io,
            tag_no="FIC-101",
            tanim="Duplicate",
            sinyal_tipi="DI",
        )

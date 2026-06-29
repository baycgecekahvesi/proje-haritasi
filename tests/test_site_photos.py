import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.documents.models import SitePhoto
from apps.projects.models import Project


@pytest.fixture
def project(db, admin_user):
    return Project.objects.create(name="Saha Proje", province="Ankara", owner=admin_user)


@pytest.mark.django_db
def test_upload_site_photo(client, project, editor_user, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    photo = SimpleUploadedFile("saha.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 10, content_type="image/jpeg")
    res = client.post(
        f"/api/documents/site-photos/{project.id}",
        data={
            "file": photo,
            "description": "Temel kazı",
            "latitude": "39.9255",
            "longitude": "32.8663",
            "taken_at": "2026-06-01T10:00:00",
        },
        **editor_headers,
    )
    assert res.status_code == 200, res.content
    data = res.json()
    assert data["description"] == "Temel kazı"
    assert data["project_id"] == project.id
    assert data["uploaded_by_username"] == "editor"
    assert abs(data["latitude"] - 39.9255) < 0.001
    assert SitePhoto.objects.filter(project=project).count() == 1


@pytest.mark.django_db
def test_list_site_photos(client, project, editor_user, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    # Önce bir fotoğraf yükle
    photo = SimpleUploadedFile("liste.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 10, content_type="image/jpeg")
    client.post(
        f"/api/documents/site-photos/{project.id}",
        data={"file": photo, "description": "Liste testi"},
        **editor_headers,
    )
    # Listele
    res = client.get(f"/api/documents/site-photos/{project.id}", **editor_headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert items[0]["project_id"] == project.id


@pytest.mark.django_db
def test_list_site_photos_date_filter(client, project, editor_user, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    photo = SimpleUploadedFile("tarih.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 10, content_type="image/jpeg")
    client.post(
        f"/api/documents/site-photos/{project.id}",
        data={"file": photo, "taken_at": "2026-05-15T08:00:00"},
        **editor_headers,
    )
    # Doğru tarihe göre filtrele
    res = client.get(f"/api/documents/site-photos/{project.id}?date=2026-05-15", **editor_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1

    # Yanlış tarihte sonuç olmamalı
    res2 = client.get(f"/api/documents/site-photos/{project.id}?date=2026-01-01", **editor_headers)
    assert res2.status_code == 200
    assert len(res2.json()) == 0


@pytest.mark.django_db
def test_viewer_cannot_upload(client, project, viewer_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    photo = SimpleUploadedFile("izleyici.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 10, content_type="image/jpeg")
    res = client.post(
        f"/api/documents/site-photos/{project.id}",
        data={"file": photo},
        **viewer_headers,
    )
    assert res.status_code == 403

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.documents.models import Document
from apps.projects.models import Project


@pytest.fixture
def project(db, admin_user):
    return Project.objects.create(name="Dosyalı", province="İzmir", owner=admin_user)


@pytest.mark.django_db
def test_upload_document(client, project, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    upload = SimpleUploadedFile("rapor.pdf", b"%PDF-1.4 sahte", content_type="application/pdf")
    res = client.post(
        f"/api/documents/{project.id}",
        data={"file": upload, "title": "Rapor", "doc_type": "report"},
        **editor_headers,
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Rapor"
    assert res.json()["file_extension"] == ".pdf"
    assert Document.objects.filter(project=project).count() == 1


@pytest.mark.django_db
def test_reject_disallowed_extension(client, project, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    upload = SimpleUploadedFile("kotu.exe", b"MZ", content_type="application/octet-stream")
    res = client.post(
        f"/api/documents/{project.id}",
        data={"file": upload, "title": "Kotu"},
        **editor_headers,
    )
    assert res.status_code == 400


@pytest.mark.django_db
def test_viewer_cannot_upload(client, project, viewer_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    upload = SimpleUploadedFile("a.txt", b"hi", content_type="text/plain")
    res = client.post(
        f"/api/documents/{project.id}",
        data={"file": upload},
        **viewer_headers,
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_delete_document(client, project, editor_headers, settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    upload = SimpleUploadedFile("sil.txt", b"hi", content_type="text/plain")
    created = client.post(
        f"/api/documents/{project.id}",
        data={"file": upload},
        **editor_headers,
    ).json()
    res = client.delete(f"/api/documents/file/{created['id']}", **editor_headers)
    assert res.status_code == 200
    assert not Document.objects.filter(id=created["id"]).exists()

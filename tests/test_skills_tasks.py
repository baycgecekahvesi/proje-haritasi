import pytest
from apps.skills.models import ProjeGorev

@pytest.mark.django_db
def test_create_and_delete_skills_task(client, editor_headers):
    # Test task creation
    payload = {
        "rol": "PLC",
        "gorev_adi": "Test PLC Gorevi",
        "faz": "Test",
        "gun": 5,
        "onk": [],
        "teslim": "Test Çıktısı",
        "baslangic_gun": 2,
        "durum": "Planlandı",
        "tamamlanma": 0,
        "not_metni": "Test Notu"
    }
    
    res_create = client.post(
        "/api/skills/tasks",
        data=payload,
        content_type="application/json",
        **editor_headers
    )
    
    assert res_create.status_code == 200
    task_data = res_create.json()
    assert task_data["gorev_adi"] == "Test PLC Gorevi"
    assert task_data["rol"] == "PLC"
    assert task_data["gorev_id"].startswith("PLC-")
    
    generated_id = task_data["gorev_id"]
    
    # Verify it exists in database
    assert ProjeGorev.objects.filter(gorev_id=generated_id).exists()
    
    # Test task deletion
    res_delete = client.delete(
        f"/api/skills/tasks/{generated_id}",
        **editor_headers
    )
    
    assert res_delete.status_code == 200
    assert res_delete.json()["detail"] == "Görev başarıyla silindi."
    
    # Verify it is deleted from database
    assert not ProjeGorev.objects.filter(gorev_id=generated_id).exists()

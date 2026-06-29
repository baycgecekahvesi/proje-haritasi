import pytest

from apps.accounts.models import DeviceToken


@pytest.mark.django_db
def test_register_device(client, editor_headers, editor_user):
    """Yeni FCM token kaydı başarılı olmalı."""
    res = client.post(
        "/api/auth/register-device",
        data={"fcm_token": "test-token-abc123", "device_type": "android"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200, res.content
    data = res.json()
    assert data["device_type"] == "android"
    assert data["is_active"] is True
    assert DeviceToken.objects.filter(user=editor_user, device_type="android").count() == 1


@pytest.mark.django_db
def test_register_device_updates_existing(client, editor_headers, editor_user):
    """Aynı kullanıcı ve cihaz tipi için token güncellenmelidir (yeni kayıt oluşturulmamalı)."""
    client.post(
        "/api/auth/register-device",
        data={"fcm_token": "eski-token", "device_type": "android"},
        content_type="application/json",
        **editor_headers,
    )
    res = client.post(
        "/api/auth/register-device",
        data={"fcm_token": "yeni-token", "device_type": "android"},
        content_type="application/json",
        **editor_headers,
    )
    assert res.status_code == 200
    # Sadece tek kayıt olmalı
    assert DeviceToken.objects.filter(user=editor_user, device_type="android").count() == 1
    # Token güncellendi mi?
    token = DeviceToken.objects.get(user=editor_user, device_type="android")
    assert token.fcm_token == "yeni-token"


@pytest.mark.django_db
def test_register_ios_and_android_separately(client, editor_headers, editor_user):
    """Android ve iOS için ayrı token kaydı yapılabilmeli."""
    client.post(
        "/api/auth/register-device",
        data={"fcm_token": "android-token", "device_type": "android"},
        content_type="application/json",
        **editor_headers,
    )
    client.post(
        "/api/auth/register-device",
        data={"fcm_token": "ios-token", "device_type": "ios"},
        content_type="application/json",
        **editor_headers,
    )
    assert DeviceToken.objects.filter(user=editor_user).count() == 2

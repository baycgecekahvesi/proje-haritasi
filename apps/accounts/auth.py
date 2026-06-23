from ninja.security import HttpBearer

from .services import decode_token


class AuthBearer(HttpBearer):
    """
    `Authorization: Bearer <token>` başlığını doğrular.
    Başarılıysa request.auth = çözülmüş JWT payload (dict) olur.
    """

    def authenticate(self, request, token):
        payload = decode_token(token)
        if payload is None:
            return None
        return payload

"""Üretim ayarları — ileride kullanım için iskelet."""
from .base import *  # noqa: F401,F403

DEBUG = False

# Üretimde PostgreSQL zorunlu
USE_SQLITE = False

# Güvenlik
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

CORS_ALLOW_ALL_ORIGINS = False

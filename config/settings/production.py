"""Üretim ayarları — Railway + PostgreSQL."""
import dj_database_url
from decouple import config

from .base import *  # noqa: F401,F403

DEBUG = False

# Railway DATABASE_URL'yi otomatik inject eder
DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL", default=""),
        conn_max_age=600,
        ssl_require=True,
    )
}

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

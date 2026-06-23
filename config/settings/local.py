"""Yerel geliştirme ayarları."""
from .base import *  # noqa: F401,F403

DEBUG = True

# Geliştirmede tüm host'lara izin ver
ALLOWED_HOSTS = ["*"]

# E-posta'yı konsola yaz (geliştirme)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

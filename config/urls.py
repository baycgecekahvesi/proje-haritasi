from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView

from config.api import api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
    # Tek sayfa frontend shell
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
]

# Geliştirmede medya dosyalarını servis et
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

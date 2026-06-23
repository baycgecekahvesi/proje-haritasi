"""
Merkezi NinjaAPI tanımı — tüm uygulama router'ları burada birleştirilir.
"""
from ninja import NinjaAPI
from ninja.errors import AuthenticationError, HttpError, ValidationError

from apps.accounts.api import router as accounts_router
from apps.agents.api import router as agents_router
from apps.accounts.auth import AuthBearer
from apps.budget.api import router as budget_router
from apps.documents.api import router as documents_router
from apps.documents.techdocs_api import router as techdocs_router
from apps.documents.specs_api import router as specs_router
from apps.projects.api import router as projects_router
from apps.reports.api import router as reports_router
from apps.skills.api import router as skills_router

api = NinjaAPI(
    title="ProjeHaritası API",
    version="1.0.0",
    description="İl bazlı proje, görev, bütçe ve döküman takip sistemi.",
    auth=AuthBearer(),
)

api.add_router("/auth", accounts_router, tags=["Kimlik Doğrulama"])
api.add_router("/projects", projects_router, tags=["Projeler"])
api.add_router("/budget", budget_router, tags=["Bütçe"])
api.add_router("/documents", documents_router, tags=["Dökümanlar"])
api.add_router("/techdocs", techdocs_router, tags=["Teknik Dökümanlar"])
api.add_router("/specs", specs_router, tags=["Teknik Şartnameler"])
api.add_router("/reports", reports_router, tags=["Raporlar"])
api.add_router("/skills", skills_router, tags=["Skill Ekosistemi"])
api.add_router("/agents", agents_router, tags=["Ajanlar"])


@api.exception_handler(AuthenticationError)
def on_auth_error(request, exc):
    return api.create_response(
        request, {"detail": "Kimlik doğrulama başarısız. Geçersiz veya süresi dolmuş token."}, status=401
    )


@api.exception_handler(ValidationError)
def on_validation_error(request, exc):
    return api.create_response(
        request, {"detail": "Gönderilen veri geçersiz.", "errors": exc.errors}, status=422
    )

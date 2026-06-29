"""
Merkezi NinjaAPI tanimi - tum uygulama router'lari burada birlestirilir.
"""
from ninja import NinjaAPI
from ninja.errors import AuthenticationError, HttpError, ValidationError

from apps.accounts.api import router as accounts_router
from apps.audit.api import router as audit_router
from apps.agents.api import router as agents_router
from apps.accounts.auth import AuthBearer
from apps.budget.api import router as budget_router
from apps.documents.api import router as documents_router
from apps.documents.techdocs_api import router as techdocs_router
from apps.documents.specs_api import router as specs_router
from apps.documents.eplan_api import router as eplan_router
from apps.projects.api import router as projects_router
from apps.reports.api import router as reports_router
from apps.skills.api import router as skills_router
from apps.risks.api import router as risks_router
from apps.punchlist.api import router as punch_router
from apps.iolist.api import router as io_router
from apps.resources.api import router as resources_router
from apps.payroll.api import router as payroll_router
from apps.accounts.contractor_api import router as contractor_router
from apps.ai_insights.api import router as ai_router

api = NinjaAPI(
    title="ProjeHaritasi API",
    version="1.0.0",
    description="Il bazli proje, gorev, butce ve dokuman takip sistemi.",
    auth=AuthBearer(),
)

api.add_router("/auth", accounts_router, tags=["Kimlik Dogrulama"])
api.add_router("/projects", projects_router, tags=["Projeler"])
api.add_router("/budget", budget_router, tags=["Butce"])
api.add_router("/documents", documents_router, tags=["Dokumanlar"])
api.add_router("/techdocs", techdocs_router, tags=["Teknik Dokumanlar"])
api.add_router("/specs", specs_router, tags=["Teknik Sartnameler"])
api.add_router("/eplan", eplan_router, tags=["E-Plan Dokumanlar"])
api.add_router("/reports", reports_router, tags=["Raporlar"])
api.add_router("/skills", skills_router, tags=["Skill Ekosistemi"])
api.add_router("/agents", agents_router, tags=["Ajanlar"])
api.add_router("/risks", risks_router, tags=["Risk Yonetimi"])
api.add_router("/punch", punch_router, tags=["Punch List"])
api.add_router("/io", io_router, tags=["IO Listesi"])
api.add_router("/audit", audit_router, tags=["Audit Log"])
api.add_router("/resources", resources_router, tags=["Kaynak Yönetimi"])
api.add_router("/payroll", payroll_router, tags=["Hakediş & Puantaj"])
api.add_router("/contractor", contractor_router, tags=["Müteahhit Portalı"])
api.add_router("/ai", ai_router, tags=["AI Insights"])


@api.exception_handler(AuthenticationError)
def on_auth_error(request, exc):
    return api.create_response(
        request, {"detail": "Kimlik dogrulama basarisiz. Gecersiz veya suresi dolmus token."}, status=401
    )


@api.exception_handler(ValidationError)
def on_validation_error(request, exc):
    return api.create_response(
        request, {"detail": "Gonderilen veri gecersiz.", "errors": exc.errors}, status=422
    )

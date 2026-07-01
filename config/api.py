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
from apps.calculations.api import router as calc_router
from apps.quality.api import router as quality_router
from apps.change_orders.api import router as change_orders_router
from apps.procurement.api import router as procurement_router
from apps.correspondence.api import router as correspondence_router
from apps.meetings.api import router as meetings_router
from apps.hse.api import router as hse_router
from apps.stakeholders.api import router as stakeholders_router
from apps.documents.permits_api import permits_router

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
api.add_router("/calculations", calc_router, tags=["Mühendislik Hesaplamaları"])
api.add_router("/quality", quality_router, tags=["Kalite & ITP"])
api.add_router("/change-orders", change_orders_router, tags=["Değişiklik Emirleri"])
api.add_router("/procurement", procurement_router, tags=["Tedarik"])
api.add_router("/correspondence", correspondence_router, tags=["Yazışma Yönetimi"])
api.add_router("/meetings", meetings_router, tags=["Toplantı & Aksiyonlar"])
api.add_router("/hse", hse_router, tags=["SGK & İSG"])
api.add_router("/stakeholders", stakeholders_router, tags=["Paydaş Yönetimi"])
api.add_router("/permits", permits_router, tags=["Ruhsat & Izin"])


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

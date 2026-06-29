from ninja import Router

from .schemas import DelayRiskOut, BudgetForecastOut, SimilarProjectsOut
from . import services

router = Router()


@router.get("/project/{project_id}/delay-risk", response=DelayRiskOut)
def get_delay_risk(request, project_id: int):
    return services.delay_risk(project_id)


@router.get("/project/{project_id}/budget-forecast", response=BudgetForecastOut)
def get_budget_forecast(request, project_id: int):
    return services.budget_forecast(project_id)


@router.get("/project/{project_id}/similar-projects", response=SimilarProjectsOut)
def get_similar_projects(request, project_id: int, top_n: int = 5):
    return services.similar_projects(project_id, top_n=top_n)

from ninja import Router

from .engine import run_all, run_pm_agent, run_risk_agent

router = Router()


@router.get("/pm")
def agent_pm(request):
    return run_pm_agent()


@router.get("/risk")
def agent_risk(request):
    return run_risk_agent()


@router.get("/all")
def agent_all(request):
    return run_all()

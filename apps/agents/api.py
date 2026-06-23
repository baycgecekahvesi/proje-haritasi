from ninja import Router

from .engine import run_all, run_pm_agent, run_risk_agent

router = Router()


@router.get("/pm", response=dict, summary="PM Koordinatör ajan raporu")
def agent_pm(request):
    return run_pm_agent()


@router.get("/risk", response=dict, summary="Risk/QA ajan raporu")
def agent_risk(request):
    return run_risk_agent()


@router.get("/all", response=dict, summary="PM + Risk ajan raporu (birleşik)")
def agent_all(request):
    return run_all()

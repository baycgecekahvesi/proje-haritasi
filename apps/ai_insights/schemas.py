from ninja import Schema
from typing import Optional


class DelayRiskOut(Schema):
    project_id:        int
    project_name:      str
    delay_probability: float
    risk_level:        str
    explanation:       list[str]
    recommendation:    str


class BudgetForecastOut(Schema):
    project_id:            int
    project_name:          str
    total_budget:          float
    spent_so_far:          float
    burn_rate_per_day:     float
    days_until_exhausted:  Optional[int] = None
    forecast_overrun:      bool
    forecast_overrun_pct:  float
    explanation:           str


class SimilarProjectOut(Schema):
    id:               int
    name:             str
    province:         str
    status:           str
    progress:         int
    budget:           Optional[float] = None
    duration_days:    Optional[int] = None
    similarity_score: float


class SimilarProjectsOut(Schema):
    project_id:          int
    project_name:        str
    similar_projects:    list[SimilarProjectOut]
    avg_duration_days:   Optional[float] = None
    avg_completion_rate: float

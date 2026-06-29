from ninja import Schema
from typing import Any, Optional
from datetime import datetime


class CalcRequest(Schema):
    calc_type: str
    inputs: dict[str, Any]


class CalcResult(Schema):
    calc_type: str
    inputs:    dict[str, Any]
    result:    dict[str, Any]
    warnings:  list[str] = []


class SaveCalcIn(Schema):
    project_id: Optional[int] = None
    category:   str
    calc_type:  str
    title:      str
    inputs:     dict[str, Any]
    result:     dict[str, Any]
    notes:      str = ""


class SavedCalcOut(Schema):
    id:         int
    category:   str
    calc_type:  str
    title:      str
    inputs:     dict[str, Any]
    result:     dict[str, Any]
    notes:      str
    created_at: datetime

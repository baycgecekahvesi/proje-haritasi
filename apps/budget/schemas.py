from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from ninja import Schema


class ExpenseIn(Schema):
    description: str
    amount: Decimal
    expense_type: str = "other"
    date: date
    invoice_no: str = ""


class ExpenseOut(Schema):
    id: int
    description: str
    amount: Decimal
    expense_type: str
    expense_type_display: str
    date: date
    invoice_no: str
    created_at: datetime

    @staticmethod
    def resolve_expense_type_display(obj) -> str:
        return obj.get_expense_type_display()


class BudgetPatch(Schema):
    planned_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    notes: Optional[str] = None


class BudgetOut(Schema):
    id: int
    project_id: int
    planned_amount: Decimal
    currency: str
    notes: str
    total_spent: Decimal
    remaining: Decimal
    usage_percent: float
    is_over_budget: bool
    expenses: list[ExpenseOut]

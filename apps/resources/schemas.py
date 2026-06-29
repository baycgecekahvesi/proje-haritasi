from decimal import Decimal
from typing import Optional
from ninja import Schema


class ResourceIn(Schema):
    name: str
    resource_type: str
    unit: str = "adet"
    capacity_per_day: Decimal = Decimal("8")
    cost_per_unit: Decimal = Decimal("0")
    is_active: bool = True
    notes: str = ""


class ResourcePatch(Schema):
    name: Optional[str] = None
    resource_type: Optional[str] = None
    unit: Optional[str] = None
    capacity_per_day: Optional[Decimal] = None
    cost_per_unit: Optional[Decimal] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class ResourceOut(Schema):
    id: int
    name: str
    resource_type: str
    resource_type_display: str
    unit: str
    capacity_per_day: Decimal
    cost_per_unit: Decimal
    is_active: bool
    notes: str

    @staticmethod
    def resolve_resource_type_display(obj) -> str:
        return obj.get_resource_type_display()


class TaskResourceIn(Schema):
    resource_id: int
    planned_quantity: Decimal = Decimal("1")
    actual_quantity: Optional[Decimal] = None
    unit_cost: Decimal = Decimal("0")


class TaskResourceOut(Schema):
    id: int
    task_id: int
    resource_id: int
    resource_name: str
    resource_type: str
    unit: str
    planned_quantity: Decimal
    actual_quantity: Optional[Decimal]
    unit_cost: Decimal
    planned_cost: Decimal
    actual_cost: Optional[Decimal]

    @staticmethod
    def resolve_resource_name(obj) -> str:
        return obj.resource.name

    @staticmethod
    def resolve_resource_type(obj) -> str:
        return obj.resource.resource_type

    @staticmethod
    def resolve_unit(obj) -> str:
        return obj.resource.unit

    @staticmethod
    def resolve_planned_cost(obj) -> Decimal:
        return obj.planned_quantity * obj.unit_cost

    @staticmethod
    def resolve_actual_cost(obj) -> Optional[Decimal]:
        if obj.actual_quantity is None:
            return None
        return obj.actual_quantity * obj.unit_cost

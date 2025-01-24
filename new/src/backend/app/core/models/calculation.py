from dataclasses import dataclass, field

from pydantic import UUID4, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from core.integrations.chargefw2.base import Charges
from core.models.paging import PagingFilters


@dataclass
class CalculationsFilters:
    hash: str
    method: str
    parameters: str | None = None
    read_hetatm: bool = True
    ignore_water: bool = False
    paging: PagingFilters = field(default_factory=lambda: PagingFilters(1, 10))


@dataclass
class ChargeCalculationConfig:
    method: str
    parameters: str | None
    read_hetatm: bool = True
    ignore_water: bool = False


@dataclass
class ChargeCalculationResult:
    file: str
    file_hash: str
    charges: Charges | None = None
    error: str | None = None


class CalculationDto(BaseModel):
    id: UUID4
    method: str
    parameters: str | None
    read_hetatm: bool
    ignore_water: bool
    charges: dict

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

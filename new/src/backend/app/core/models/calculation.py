"""Calculation models"""

from dataclasses import dataclass, field
import uuid

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from core.models.paging import PagingFilters


@dataclass
class CalculationsFilters:
    """Filters for calculations retrieval"""

    hash: str
    method: str
    parameters: str | None = None
    read_hetatm: bool = True
    ignore_water: bool = False
    permissive_types: bool = False
    paging: PagingFilters = field(default_factory=lambda: PagingFilters(1, 10))


@dataclass
class ChargeCalculationConfig:
    """Configuration for charge calculation"""

    method: str | None
    parameters: str | None
    read_hetatm: bool = True
    ignore_water: bool = False
    permissive_types: bool = False


class CalculationDto(BaseModel):
    """Calculation data transfer object"""

    file: str
    file_hash: str
    charges: dict

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class CalculationConfigDto(BaseModel):
    """Calculation configuration data transfer object"""

    method: str
    parameters: str | None
    read_hetatm: bool
    ignore_water: bool
    permissive_types: bool

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class CalculationPreviewDto(BaseModel):
    """Calculation preview data transfer object"""

    file: str

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class CalculationSetDto[T](BaseModel):
    """Calculation set data transfer object"""

    id: uuid.UUID
    calculations: list[T]
    configs: list[CalculationConfigDto]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


CalculationSetFullDto = CalculationSetDto[CalculationDto]
# CalculationSetPreviewDto = CalculationSetDto[CalculationPreviewDto]


class CalculationSetPreviewDto(BaseModel):
    """Calculation set preview data transfer object"""

    id: uuid.UUID
    files: list[str]
    configs: list[CalculationConfigDto]

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


@dataclass
class ChargeCalculationResult:
    """Result of charge calculation"""

    config: ChargeCalculationConfig
    calculations: list[CalculationDto]

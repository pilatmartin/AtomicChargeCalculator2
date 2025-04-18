from pydantic import BaseModel


class Setup(BaseModel):
    """Setup model."""

    computation_id: str


class AdvancedSettingsDto(BaseModel):
    """SetupSettings model."""

    read_hetatm: bool = True
    ignore_water: bool = False
    permissive_types: bool = True


class SetupConfigDto(BaseModel):
    """SetupConfigDto model."""

    file_hashes: list[str]
    settings: AdvancedSettingsDto | None

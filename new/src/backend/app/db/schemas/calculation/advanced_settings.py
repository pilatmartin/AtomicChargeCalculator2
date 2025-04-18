import uuid
import sqlalchemy as sa

from sqlalchemy.orm import Mapped, mapped_column

from db.schemas import Base


class AdvancedSettings(Base):
    """Advanced settings database model."""

    __tablename__ = "advanced_settings"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    read_hetatm: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    ignore_water: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    permissive_types: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)

    def __repr__(self):
        return f"""<AdvancedSettings
        id={self.id}
        read_hetatm={self.read_hetatm}
        ignore_water={self.ignore_water}
        permissive_types={self.permissive_types}>"""

    def __eq__(self, other):
        return (
            self.read_hetatm == other.read_hetatm
            and self.ignore_water == other.ignore_water
            and self.permissive_types == other.permissive_types
            and self.set_id == other.set_id
        )

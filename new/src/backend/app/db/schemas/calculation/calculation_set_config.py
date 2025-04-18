import sqlalchemy as sa


from sqlalchemy.orm import Mapped, mapped_column

from db.schemas import Base


class CalculationSetConfig(Base):
    """Calculation set database model. It is a collection of calculations."""

    __tablename__ = "calculation_set_configs"

    calculation_set_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_sets.id"), nullable=False
    )
    calculation_config_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_configs.id"), nullable=False
    )

    def __repr__(self):
        return f"<CalculationSet id={self.id}>"

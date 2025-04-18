import sqlalchemy as sa

from sqlalchemy.orm import Mapped, mapped_column

from db.schemas import Base


class CalculationSetStats(Base):
    """Calculation set stats database model. It is a collection of calculations."""

    __tablename__ = "calculation_set_stats"

    calculation_set_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_sets.id"), nullable=False
    )
    molecule_set_stats_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("molecule_set_stats.id"), nullable=False
    )

    def __repr__(self):
        return f"""<CalculationSetStats 
                calculation_set_id={self.calculation_set_id}
                molecule_set_stats_id={self.molecule_set_stats_id}>"""

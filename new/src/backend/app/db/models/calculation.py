# """Calculation database models."""

# import uuid
# import sqlalchemy as sa
# from sqlalchemy.orm import Mapped, relationship, mapped_column
# from db.database import Base
# from core.integrations.chargefw2.base import Charges


# class CalculationSet(Base):
#     """Calculation set database model. It is a collection of calculations."""

#     __tablename__ = "calculation_sets"

#     id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
#     calculations = relationship(
#         "Calculation", back_populates="calculation_set", cascade="all, delete-orphan"
#     )
#     configs = relationship(
#         "CalculationConfig", back_populates="calculation_set", cascade="all, delete-orphan"
#     )

#     def __repr__(self):
#         return f"<CalculationSet id={self.id}>"


# class CalculationConfig(Base):
#     """Calculation config database model. It represents a single calculation configuration."""

#     __tablename__ = "calculation_configs"

#     id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
#     method: Mapped[str] = mapped_column(sa.VARCHAR(20), nullable=False)
#     parameters: Mapped[str | None] = mapped_column(sa.VARCHAR(50), nullable=True)
#     read_hetatm: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
#     ignore_water: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
#     permissive_types: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)

#     set_id: Mapped[str] = mapped_column(
#         sa.Uuid, sa.ForeignKey("calculation_sets.id"), nullable=False
#     )

#     calculation_set = relationship("CalculationSet", back_populates="configs")
#     calculations = relationship(
#         "Calculation", back_populates="config", cascade="all, delete-orphan"
#     )

#     def __repr__(self):
#         return f"""<CalculationConfig
#         id={self.id}
#         method={self.method}
#         parameters={self.parameters}
#         read_hetatm={self.read_hetatm}
#         ignore_water={self.ignore_water}
#         permissive_types={self.permissive_types}>"""


# class Calculation(Base):
#     """Calculation database model. It represents a single calculation (single config and file)."""

#     __tablename__ = "calculations"

#     id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
#     file: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False)
#     file_hash: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False)
#     charges: Mapped[Charges] = mapped_column(sa.JSON, nullable=False)

#     set_id: Mapped[str] = mapped_column(
#         sa.Uuid, sa.ForeignKey("calculation_sets.id"), nullable=False
#     )
#     config_id: Mapped[str] = mapped_column(
#         sa.Uuid, sa.ForeignKey("calculation_configs.id"), nullable=False
#     )

#     calculation_set = relationship("CalculationSet", back_populates="calculations")
#     config = relationship("CalculationConfig", back_populates="calculations")

#     def __repr__(self):
#         return f"""<Calculation
#         id={self.id}
#         hash={self.set_id}
#         file={self.file}
#         file_hash={self.file_hash}
#         set_id={self.set_id}
#         config_id={self.config_id}>"""

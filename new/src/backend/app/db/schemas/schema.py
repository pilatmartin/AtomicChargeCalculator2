import uuid

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, relationship, mapped_column

from db.schemas import Base


class User(Base):
    """User model. It only stores openid of the user."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    openid: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False)

    calculation_sets = relationship(
        "CalculationSet", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id}, openid={self.openid}>"


class CalculationSet(Base):
    """Calculation set database model. It is a collection of calculations."""

    __tablename__ = "calculation_sets"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=sa.func.timezone("UTC", sa.func.current_timestamp()),
    )

    user_id: Mapped[str] = mapped_column(sa.Uuid, sa.ForeignKey("users.id"), nullable=True)
    advanced_settings_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("advanced_settings.id"), nullable=False
    )

    user = relationship("User", back_populates="calculation_sets")
    configs = relationship(
        "CalculationConfig", secondary="calculation_set_configs", back_populates="calculation_sets"
    )
    advanced_settings = relationship("AdvancedSettings", back_populates="calculation_sets")
    molecule_set_stats = relationship(
        "MoleculeSetStats", secondary="calculation_set_stats", back_populates="calculation_sets"
    )

    def __repr__(self) -> str:
        return f"<CalculationSet id={self.id}, created_at={self.created_at}>"


class CalculationSetConfig(Base):
    """M:N relationship table between CalculationSet and CalculationConfig"""

    __tablename__ = "calculation_set_configs"

    calculation_set_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_sets.id"), nullable=False, primary_key=True
    )
    config_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_configs.id"), nullable=False, primary_key=True
    )

    def __repr__(self) -> str:
        return f"<CalculationSetConfig calculation_set_id={self.calculation_set_id}, config_id={self.config_id}>"

    __table_args__ = (sa.UniqueConstraint("calculation_set_id", "config_id"),)


class CalculationConfig(Base):
    """Calculation config database model. It represents a single calculation configuration."""

    __tablename__ = "calculation_configs"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    method: Mapped[str] = mapped_column(sa.VARCHAR(20), nullable=False)
    parameters: Mapped[str | None] = mapped_column(sa.VARCHAR(50), nullable=True)

    calculation_sets = relationship(
        "CalculationSet", secondary="calculation_set_configs", back_populates="configs"
    )
    calculations = relationship("Calculation", back_populates="config")

    def __repr__(self) -> str:
        return (
            f"<CalculationConfig id={self.id}, method={self.method}, parameters={self.parameters}>"
        )

    __table_args__ = (sa.UniqueConstraint("method", "parameters"),)

    def __eq__(self, other):
        return self.method == other.method and self.parameters == other.parameters


class CalculationSetStats(Base):
    """M:N relationship table between CalculationSet and MoleculeSetStats"""

    __tablename__ = "calculation_set_stats"

    calculation_set_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_sets.id"), primary_key=True
    )
    molecule_set_id: Mapped[str] = mapped_column(
        sa.VARCHAR(100), sa.ForeignKey("molecule_set_stats.file_hash"), primary_key=True
    )

    def __repr__(self) -> str:
        return f"<CalculationSetStats calculation_set_id={self.calculation_set_id}, molecule_set_id={self.molecule_set_id}>"

    __table_args__ = (sa.UniqueConstraint("calculation_set_id", "molecule_set_id"),)


class Calculation(Base):
    __tablename__ = "calculations"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    file_name: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False)
    file_hash: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False)
    charges: Mapped[dict] = mapped_column(sa.JSON, nullable=False)

    config_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("calculation_configs.id"), nullable=False
    )
    advanced_settings_id: Mapped[str] = mapped_column(
        sa.Uuid, sa.ForeignKey("advanced_settings.id"), nullable=False
    )

    config = relationship("CalculationConfig", back_populates="calculations")
    advanced_settings = relationship("AdvancedSettings", back_populates="calculations")

    def __repr__(self) -> str:
        return f"<Calculation id={self.id}, file_name={self.file_name}, file_hash={self.file_hash}>"


class AtomTypeCount(Base):
    """Atom type count database model."""

    __tablename__ = "atom_type_counts"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(sa.VARCHAR(10), primary_key=False)
    count: Mapped[int] = mapped_column(sa.Integer, nullable=False)

    molecule_set_id = mapped_column(
        sa.VARCHAR(100), sa.ForeignKey("molecule_set_stats.file_hash"), nullable=False
    )
    molecule_set_stats = relationship("MoleculeSetStats", back_populates="atom_type_counts")

    def __repr__(self):
        return f"""<AtomTypeCount id={self.id}, symbol={self.symbol}, count={self.count}, molecule_set_id={self.molecule_set_id}"""


class MoleculeSetStats(Base):
    """
    Molecule set stats database model.
    Holds information about the molecules in the provided file.
    Files are identified by their file_hash.
    """

    __tablename__ = "molecule_set_stats"

    file_hash: Mapped[str] = mapped_column(sa.VARCHAR(100), primary_key=True)
    total_molecules: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    total_atoms: Mapped[int] = mapped_column(sa.Integer, nullable=False)

    atom_type_counts = relationship("AtomTypeCount", back_populates="molecule_set_stats")
    calculation_sets = relationship(
        "CalculationSet", secondary="calculation_set_stats", back_populates="molecule_set_stats"
    )

    def __repr__(self):
        return f"""<MoleculeSetStats file_hash={self.file_hash}, total_molecules={self.total_molecules}, total_atoms={self.total_atoms}, atom_type_counts={self.atom_type_counts}"""


class AdvancedSettings(Base):
    __tablename__ = "advanced_settings"

    id: Mapped[str] = mapped_column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    read_hetatm: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    ignore_water: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    permissive_types: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)

    calculation_sets = relationship("CalculationSet", back_populates="advanced_settings")
    calculations = relationship("Calculation", back_populates="advanced_settings")

    def __repr__(self):
        return f"""<AdvancedSettings id={self.id}, read_hetatm={self.read_hetatm}, ignore_water={self.ignore_water}, permissive_types={self.permissive_types}"""

    __table_args__ = (sa.UniqueConstraint("read_hetatm", "ignore_water", "permissive_types"),)

import traceback
from dataclasses import asdict

from core.logging.base import LoggerBase
from core.models.calculation import (
    CalculationConfigDto,
    CalculationDto,
    CalculationResultDto,
    CalculationSetDto,
    CalculationSetPreviewDto,
    CalculationsFilters,
    ChargeCalculationConfigDto,
)
from core.models.paging import PagedList
from core.models.molecule_info import MoleculeSetStats as MoleculeInfo
from db.models.calculation.calculation import Calculation
from db.models.calculation.calculation_config import CalculationConfig
from db.models.calculation.calculation_set import CalculationSet
from db.models.moleculeset_stats import MoleculeSetStats
from db.repositories.calculation_config_repository import CalculationConfigRepository
from db.repositories.calculation_repository import CalculationRepository
from db.repositories.calculation_set_repository import (
    CalculationSetFilters,
    CalculationSetRepository,
)
from db.repositories.moleculeset_stats_repository import MoleculeSetStatsRepository


class CalculationStorageService:
    """Service for manipulating calculations in the database."""

    def __init__(
        self,
        logger: LoggerBase,
        set_repository: CalculationSetRepository,
        calculation_repository: CalculationRepository,
        config_repository: CalculationConfigRepository,
        stats_repository: MoleculeSetStatsRepository,
    ):
        self.set_repository = set_repository
        self.set_repository = set_repository
        self.calculation_repository = calculation_repository
        self.config_repository = config_repository
        self.stats_repository = stats_repository
        self.logger = logger

    def store_calculation_set(
        self, computation_id: str, user_id: str | None, data: list[CalculationResultDto]
    ) -> CalculationSetDto:
        """Store calculation set to database."""

        self.logger.info(f"Storing calculation set {computation_id}.")

        try:
            calculations: list[Calculation] = [
                Calculation(
                    file=calculation.file,
                    file_hash=calculation.file_hash,
                    charges=calculation.charges,
                )
                for result in data
                for calculation in result.calculations
            ]

            configs: list[CalculationConfig] = [
                CalculationConfig(**asdict(result.config)) for result in data
            ]

            calculation_set_to_store = CalculationSet(
                id=computation_id, calculations=calculations, configs=configs, user_id=user_id
            )

            calculation_set = self.set_repository.store(calculation_set_to_store)
            return CalculationSetDto(
                id=calculation_set.id,
                calculations=[CalculationDto.model_validate(calc) for calc in calculations],
                configs=[CalculationConfigDto.model_validate(config) for config in configs],
            )
        except Exception as e:
            self.logger.error(
                f"Error storing calculation set {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def delete_calculation_set(self, computation_id: str) -> None:
        """Delete calculation set from database."""

        try:
            self.logger.info(f"Deleting calculation set {computation_id}.")
            self.set_repository.delete(computation_id)
        except Exception as e:
            self.logger.error(
                f"Error deleting calculation set {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def get_calculation(
        self, computation_id: str, filters: CalculationsFilters
    ) -> CalculationDto | None:
        """Get calculation from database based on filters."""

        try:
            self.logger.info("Getting calculation from database.")
            calculation = self.calculation_repository.get(computation_id, filters)

            return CalculationDto.model_validate(calculation) if calculation is not None else None
        except Exception as e:
            self.logger.error(f"Error getting calculation from database: {traceback.format_exc()}")
            raise e

    def get_calculations(
        self, filters: CalculationSetFilters
    ) -> PagedList[CalculationSetPreviewDto]:
        """Get calculations from database based on filters."""

        def get_info(file_hash: str) -> MoleculeInfo | None:
            info = self.stats_repository.get(file_hash)

            if info is None:
                return None

            info_dict = {
                "total_molecules": info.total_molecules,
                "total_atoms": info.total_atoms,
                "atom_type_counts": [vars(count) for count in info.atom_type_counts],
            }

            return MoleculeInfo(info_dict)

        try:
            self.logger.info("Getting calculations from database.")
            calculations_list = self.set_repository.get_all(filters)
            calculations_list.items = [
                CalculationSetPreviewDto.model_validate(
                    {
                        "id": calculation_set.id,
                        "files": {
                            calculation.file: get_info(calculation.file_hash)
                            for calculation in set(calculation_set.calculations)
                        },
                        "configs": calculation_set.configs,
                        "created_at": calculation_set.created_at,
                    }
                )
                for calculation_set in calculations_list.items
            ]

            return PagedList[CalculationSetPreviewDto].model_validate(calculations_list)
        except Exception as e:
            self.logger.error(f"Error getting calculations from database: {traceback.format_exc()}")
            raise e

    def get_calculation_set(self, computation_id: str) -> CalculationSetDto:
        """Get calculation set from database."""

        try:
            self.logger.info(f"Getting calculation set {computation_id}.")
            return self.set_repository.get(computation_id)
        except Exception as e:
            self.logger.error(
                f"Error getting calculation set {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def store_calculation(self, calculation: Calculation) -> Calculation:
        """Store calculation to database."""

        try:
            self.logger.info(f"Storing calculation to set {calculation.set_id}.")
            return self.calculation_repository.store(calculation)
        except Exception as e:
            self.logger.error(
                f"Error storing calculation to set {calculation.set_id}: {traceback.format_exc()}"
            )
            raise e

    def store_file_info(self, info: MoleculeSetStats) -> MoleculeSetStats:
        """Store file info to database."""

        try:
            self.logger.info(f"Storing stats of file with hash '{info.file_hash}'.")
            return self.stats_repository.store(info)
        except Exception as e:
            self.logger.error(
                f"Error storing stats of file with hash '{info.file_hash}': {traceback.format_exc()}"
            )
            raise e

    def store_calculation_results(
        self, computation_id: str, results: list[CalculationResultDto], user_id: str | None
    ) -> None:
        """Store calculation results to database."""

        unique_configs = {}

        existing_calculation_set = self.set_repository.get(computation_id)

        if existing_calculation_set:
            calculation_set = existing_calculation_set
        else:
            calculation_set = CalculationSet(id=computation_id, user_id=user_id)

        for result in results:
            config_key = (
                result.config.method,
                result.config.parameters,
                result.config.read_hetatm,
                result.config.ignore_water,
                result.config.permissive_types,
            )

            config = CalculationConfig(
                method=result.config.method,
                parameters=result.config.parameters,
                read_hetatm=result.config.read_hetatm,
                ignore_water=result.config.ignore_water,
                permissive_types=result.config.permissive_types,
                set_id=computation_id,
            )

            config_exists = self.config_repository.get(computation_id, config)

            if config_exists is None:
                unique_configs[config_key] = config
                result.config = config
            else:
                result.config = config_exists

            for calculation in result.calculations:
                calculation_set.calculations.append(
                    Calculation(
                        file=calculation.file,
                        file_hash=calculation.file_hash,
                        charges=calculation.charges,
                        config=result.config,
                        set_id=computation_id,
                    )
                )

        try:
            self.logger.info(f"Storing calculation results for computation {computation_id}.")
            self.set_repository.store(calculation_set)
        except Exception as e:
            self.logger.error(
                f"Error storing calculation results for computation {computation_id}: {traceback.format_exc()}"
            )
            raise e

    def filter_existing_calculations(
        self, computation_id: str, file_hashes: list[str], configs: list[ChargeCalculationConfigDto]
    ) -> dict[str, list[ChargeCalculationConfigDto]]:
        """Returns a list of hashes and configs that are not in the database."""

        result = {}

        try:
            self.logger.info("Filtering existing calculations.")

            for config in configs:
                for file_hash in file_hashes:
                    filters = CalculationsFilters(
                        hash=file_hash,
                        method=config.method,
                        parameters=config.parameters,
                        read_hetatm=config.read_hetatm,
                        ignore_water=config.ignore_water,
                        permissive_types=config.permissive_types,
                    )

                    if not self.calculation_repository.get(computation_id, filters):
                        if config not in result:
                            result[config] = []

                        result[config].append(file_hash)
                    else:
                        self.logger.info("Existing calculation found for file, skipping.")

            return result
        except Exception as e:
            self.logger.error(f"Error filtering existing calculations: {traceback.format_exc()}")
            raise e

    def get_calculation_results(self, computation_id: str) -> list[CalculationResultDto]:
        """Get calculation results from database."""

        try:
            self.logger.info(f"Getting calculation results for computation {computation_id}.")
            calculation_set = self.set_repository.get(computation_id)

            if not calculation_set:
                return []

            result = [
                CalculationResultDto(
                    config=CalculationConfigDto.model_validate(config),
                    calculations=[
                        CalculationDto.model_validate(calculation)
                        for calculation in calculation_set.calculations
                        if calculation.config == config
                    ],
                )
                for config in calculation_set.configs
            ]

            return result

        except Exception as e:
            self.logger.error(
                f"Error getting calculation results for computation {computation_id}: {traceback.format_exc()}"
            )
            raise e

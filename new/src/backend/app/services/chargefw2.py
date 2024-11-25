import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import UploadFile

# Temporary solution to get Molecules class
from chargefw2 import Molecules

from core.integrations.chargefw2.base import ChargeFW2Base, Charges
from core.logging.base import LoggerBase
from services.io import IOService


class ChargeFW2Service:
    def __init__(self, chargefw2: ChargeFW2Base, logger: LoggerBase, io: IOService):
        self.chargefw2 = chargefw2
        self.logger = logger
        self.io = io
        self.executor = ThreadPoolExecutor(max_workers=4)

    def get_available_methods(self) -> list[str]:
        return self.chargefw2.get_available_methods()

    def get_available_parameters(self, method: str) -> list[str]:
        return self.chargefw2.get_available_parameters(method)

    def read_molecules(self, file_path: str) -> Molecules:
        return self.chargefw2.molecules(file_path)

    async def calculate_charges(
        self, files: list[UploadFile], method_name: str, parameters_name: str | None = None
    ) -> list[dict[str, Charges]]:
        workdir = self.io.create_tmp_dir("calculations")
        results: list[dict[str, Charges]] = []

        # TODO: parallelize
        for file in files:
            new_file_path = await self.io.store_upload_file(file, workdir)

            try:
                loop = asyncio.get_event_loop()

                molecules = await loop.run_in_executor(self.executor, self.read_molecules, new_file_path)
                charges = await loop.run_in_executor(
                    self.executor, self.chargefw2.calculate_charges, molecules, method_name, parameters_name
                )
                results.append({"file": file.filename, "charges": charges})
                self.logger.info(f"Successfully calculated charges for file {file.filename}.")
            except Exception as e:
                self.logger.error(f"Error calculating charges for file {file.filename}: {e}")
                results.append({"file": file.filename, "error": e})  # TODO: add proper type and err handling

        return results

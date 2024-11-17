from typing import Dict, Optional
from abc import ABC, abstractmethod

from chargefw2 import Molecules


class ChargeFW2Base(ABC):
    """Service for interaction with the ChargeFW2 framework."""

    @abstractmethod
    def molecules(self, file_path: str) -> Molecules:
        """Load molecules from a file

        Args:
            file_path (str): _description_

        Returns:
            _type_: _description_
        """
        raise NotImplementedError()

    @abstractmethod
    def get_available_methods(
        self,
    ) -> list[str]:
        """Get all available methods.

        Returns:
            list[str]: List of method names.
        """
        raise NotImplementedError()

    @abstractmethod
    def get_available_parameters(self, method: str) -> list[str]:
        """Get all parameters available for provided method.

        Args:
            method (str): Method name.

        Returns:
            list[str]: List of parameter names.
        """
        raise NotImplementedError()

    @abstractmethod
    def get_suitable_methods(self, molecules: Molecules) -> list[tuple[str, list[str]]]:
        """Get methods and parameters that are suitable for a given set of molecules.

        Args:
            molecules (chargefw2.Molecules): Set of molecules.

        Returns:
            list[tuple[str, list[str]]]: List of tuples containing method name and parameters for that method.
        """
        raise NotImplementedError()

    @abstractmethod
    def calculate_charges(
        self,
        molecules: Molecules,
        method_name: str,
        parameters_name: Optional[str] = None,
    ) -> Dict[str, list[float]]:
        """Calculate partial atomic charges for a given molecules and method.

        Args:
            molecules (chargefw2.Molecules): Set of molecules.
            method_name (str): Method name to be used.
            parameters_name (Optional[str], optional): Parameters to be used with provided method. Defaults to None.

        Returns:
            Dict[str, list[float]]: Dictionary with molecule names as keys and list of charges (floats) as values.
        """
        raise NotImplementedError()

import os

from integrations.chargefw2.chargefw2 import ChargeFW2Local


class TestChargeFW2Local:
    def test_molecules_integration(self) -> None:
        # Arrange
        test_file = os.path.abspath("tests/data/integrations/phenols.sdf")
        os.environ["CHARGEFW2_INSTALL_DIR"] = "/opt/chargefw2"

        # Act
        service = ChargeFW2Local()
        molecules = service.molecules(test_file)

        # Assert
        assert molecules is not None
        assert len(molecules) == 7

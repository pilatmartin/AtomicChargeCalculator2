import { Busy } from "@acc2/components/shared/busy";
import { Card } from "@acc2/components/ui/card";
import { ControlsContextProvider } from "@acc2/lib/contexts/controls-context";
import MolstarPartialCharges from "molstar-partial-charges";
import { HTMLAttributes, useState } from "react";

import { MolstarColoringType } from "./coloring-controls";
import { Controls } from "./controls";
import { MolstarViewType } from "./view-controls";

export type ControlsWrapperProps = {
  computationId: string;
  molstar: MolstarPartialCharges;
  molecules: string[];
} & HTMLAttributes<HTMLElement>;

export const ControlsWrapper = ({
  computationId,
  molstar,
  molecules,
}: ControlsWrapperProps) => {
  const [currentTypeId, setCurrentTypeId] = useState<number>(1);
  const [structure, setStructure] = useState<string>(molecules[0]);
  const [coloringType, setColoringType] =
    useState<MolstarColoringType>("charges-relative");
  const [maxValue, setMaxValue] = useState<number>(0);
  const [viewType, setViewType] = useState<MolstarViewType>(
    // use surface view for receptor example
    computationId === "examples/receptor"
      ? "surface"
      : molstar.type.isDefaultApplicable()
        ? "cartoon"
        : "balls-and-sticks"
  );
  const [methodNames, setMethodNames] = useState<(string | undefined)[]>([]);

  return (
    <Card className="w-4/5 rounded-none mx-auto p-4 max-w-content mt-4 flex flex-col relative">
      <ControlsContextProvider
        value={{
          currentTypeId,
          setCurrentTypeId,
          coloringType,
          setColoringType,
          maxValue,
          setMaxValue,
          structure,
          setStructure,
          viewType,
          setViewType,
          methodNames,
          setMethodNames,
        }}
      >
        <Busy isBusy={!molstar} />
        {molstar && (
          <Controls
            computationId={computationId}
            molstar={molstar}
            molecules={molecules}
          />
        )}
      </ControlsContextProvider>
    </Card>
  );
};

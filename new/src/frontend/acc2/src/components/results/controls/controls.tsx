import { HTMLAttributes, useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { ComputeResponse } from "@acc2/api/compute";
import MolstarPartialCharges from "molstar-partial-charges";
import { useLoadMmcifMutation } from "@acc2/hooks/mutations/use-load-mmcif-mutation";
import { MolstarViewControls } from "./view-controls";
import { MolstarColoringControls } from "./coloring-controls";
import { MolstarChargesetControls } from "./chargeset-controls";
import { MolstarStructureControls } from "./structure-controls";

export type ControlsProps = {
  computationId: string;
  molstar: MolstarPartialCharges;
  computation: ComputeResponse;
} & HTMLAttributes<HTMLElement>;

export const Controls = ({
  computationId,
  molstar,
  computation,
}: ControlsProps) => {
  const mmcifMutation = useLoadMmcifMutation(molstar, computationId);
  const [currentTypeId, setCurrentTypeId] = useState<number>(0);

  const loadMolecule = async (molecule: string) => {
    await mmcifMutation.mutateAsync({ molecule });
  };

  useEffect(() => {
    loadMolecule(computation.molecules[0]);
  }, [molstar]);

  // TODO get correct name for method and params
  return (
    <Card className="w-4/5 rounded-none mx-auto p-4 max-w-content mt-4 flex flex-col">
      <div className="flex gap-2">
        <h3 className="font-bold">Method:</h3>
        <span>{computation.configs[currentTypeId].method}</span>
      </div>
      <div className="flex gap-2">
        <h3 className="font-bold">Parameters:</h3>
        <span>{computation.configs[currentTypeId].parameters}</span>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <MolstarStructureControls
            molecules={computation.molecules}
            onStructureSelect={loadMolecule}
          />
          <MolstarChargesetControls
            molstar={molstar}
            configs={computation.configs}
            setCurrentTypeId={setCurrentTypeId}
          />
        </div>
        {/* TODO: fix blinking when changing structure */}
        {mmcifMutation.isSuccess && (
          <>
            <MolstarViewControls molstar={molstar} />
            <MolstarColoringControls molstar={molstar} />
          </>
        )}
      </div>
    </Card>
  );
};

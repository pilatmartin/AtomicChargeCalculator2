import { HTMLAttributes, useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { ComputeResponse } from "@acc2/api/compute";
import MolstarPartialCharges from "molstar-partial-charges";
import { useLoadMmcifMutation } from "@acc2/hooks/mutations/use-load-mmcif-mutation";
import { MolstarViewControls } from "./view-controls";
import {
  MolstarColoringControls,
  MolstarColoringType,
} from "./coloring-controls";
import { MolstarChargesetControls } from "./chargeset-controls";
import { MolstarStructureControls } from "./structure-controls";

export type ControlsProps = {
  computationId: string;
  molstar: MolstarPartialCharges;
  molecules: string[];
} & HTMLAttributes<HTMLElement>;

export const Controls = ({
  computationId,
  molstar,
  molecules,
}: ControlsProps) => {
  const mmcifMutation = useLoadMmcifMutation(molstar, computationId);
  const [currentTypeId, setCurrentTypeId] = useState<number>(0);
  const [mmcifLoaded, setMmcifLoaded] = useState<boolean>(false);

  const loadMolecule = async (molecule: string) => {
    await mmcifMutation.mutateAsync(
      { molecule },
      {
        onSuccess: () => setMmcifLoaded(true),
      }
    );
    await molstar.color.relative();
  };

  useEffect(() => {
    loadMolecule(molecules?.[0]);
  }, [molstar]);

  // TODO get correct name for method and params
  return (
    <Card className="w-4/5 rounded-none mx-auto p-4 max-w-content mt-4 flex flex-col">
      <div className="flex gap-2">
        <h3 className="font-bold">Method:</h3>
        <span>
          {mmcifLoaded && molstar.charges.getMethodNames()[currentTypeId]}
        </span>
      </div>
      <div className="flex gap-2">
        <h3 className="font-bold">Parameters:</h3>
        <span>{}</span>
      </div>
      <Separator className="my-4" />
      {mmcifLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <MolstarStructureControls
              molecules={molecules}
              onStructureSelect={loadMolecule}
            />
            <MolstarChargesetControls
              molstar={molstar}
              setCurrentTypeId={setCurrentTypeId}
            />
          </div>
          <MolstarViewControls molstar={molstar} />
          <MolstarColoringControls molstar={molstar} />
        </div>
      )}
    </Card>
  );
};

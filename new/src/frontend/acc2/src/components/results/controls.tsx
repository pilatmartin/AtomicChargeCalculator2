import { HTMLAttributes } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { ComputeResponse } from "@acc2/api/compute";
import MolstarPartialCharges from "molstar-partial-charges";
import { baseApiUrl } from "@acc2/api/base";

export type ControlsProps = {
  computationId: string;
  molstar: MolstarPartialCharges;
  computation: ComputeResponse;
} & HTMLAttributes<HTMLElement>;

const molstarViewTypes = ["balls-and-sticks", "cartoon", "surface"] as const;

type MolstarViewType = (typeof molstarViewTypes)[number];

const molstarColoringTypes = [
  "structure",
  "charges-relative",
  "charges-absolute",
] as const;

type MolstarColoringType = (typeof molstarColoringTypes)[number];

export const Controls = ({
  computationId,
  molstar,
  computation,
}: ControlsProps) => {
  const { configs, molecules } = computation;

  const onChargeSetSelect = (typeId: number) =>
    molstar.charges.setTypeId(typeId);

  const onStructureSelect = async (molecule: string) => {
    // TODO: move somewhere
    await molstar.load(
      `${baseApiUrl}/charges/mmcif?computation_id=${computationId}&molecule=${molecule}`
    );
    await molstar.color.relative();
  };

  const onViewSelect = async (view: MolstarViewType) => {
    switch (view) {
      case "balls-and-sticks":
        await molstar.type.ballAndStick();
        break;
      case "cartoon":
        // TODO: figure out how cartoon works
        if (molstar.type.isDefaultApplicable()) {
          await molstar.type.default();
        }
        break;
      case "surface":
        await molstar.type.surface();
        break;
      default:
        console.error(`Invalid Molstar view type. ('${view}')`);
    }
  };

  const onColoringSelect = async (coloring: MolstarColoringType) => {
    switch (coloring) {
      case "structure":
        // TODO figure out how strucrture works
        await molstar.color.alphaFold();
        break;
      case "charges-relative":
        await molstar.color.relative();
        break;
      case "charges-absolute":
        await molstar.color.relative();
        break;
      default:
        console.error(`Invalid Molstar coloring type. ('${coloring}')`);
    }
  };

  const onMaxValueChange = async (maxValue: number) => {
    // TODO: figure out how this should work
  };

  return (
    <Card className="w-4/5 rounded-none mx-auto p-4 max-w-content mt-4 flex flex-col">
      <div className="flex gap-2">
        <h3 className="font-bold">Method:</h3>
        <span>SQE+qp</span>
      </div>
      <div className="flex gap-2">
        <h3 className="font-bold">Parameters:</h3>
        <span>Schindler 2021 (CCD_gen)</span>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xxl:grid-cols-3 gap-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="font-bold mb-2">Structure</h3>
            <Select
              onValueChange={onStructureSelect}
              defaultValue={molecules[0].toUpperCase()}
            >
              <SelectTrigger className="min-w-[180px] border-2 uppercase">
                <SelectValue placeholder="Structure" />
              </SelectTrigger>
              <SelectContent>
                {molecules.map((molecule, index) => (
                  <SelectItem
                    key={index}
                    value={molecule.toUpperCase()}
                    className="uppercase"
                  >
                    {molecule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <h3 className="font-bold mb-2">Charge Set</h3>
            <Select onValueChange={(value) => onChargeSetSelect(Number(value))}>
              <SelectTrigger className="min-w-[180px] border-2">
                <SelectValue placeholder="Charge Set" />
              </SelectTrigger>
              <SelectContent>
                {configs.map(({ method, parameters }, index) => (
                  <SelectItem key={index} value={`${index + 1}`}>
                    {`${method}${parameters ? "/" + parameters : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <div>
            <h3 className="font-bold mb-2">View</h3>
            <Select onValueChange={onViewSelect}>
              <SelectTrigger className="md:min-w-[180px] border-2">
                <SelectValue placeholder="Select View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="balls-and-sticks">
                  Balls and Sticks
                </SelectItem>
                <SelectItem value="surface">Surface</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="grow">
            <h3 className="font-bold mb-2">Coloring</h3>
            <Select onValueChange={onColoringSelect}>
              <SelectTrigger className="min-w-[180px] border-2">
                <SelectValue placeholder="Select Coloring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="structure"
                  disabled={molstar.type.isDefaultApplicable()}
                >
                  Cartoon
                </SelectItem>
                <SelectItem value="charges-relative">
                  Charges (relative)
                </SelectItem>
                <SelectItem value="charges-absolute">
                  Charges (absolute)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full col-span-1 sm:w-1/2">
            <h3 className="mb-2 w-fit">Max Value</h3>
            <div className="flex gap-4">
              <Input
                type="number"
                className="border-2 lg:min-w-[120px]"
                onChange={({ target }) =>
                  onMaxValueChange(target.valueAsNumber)
                }
              />
              <Button type="reset" variant={"secondary"}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

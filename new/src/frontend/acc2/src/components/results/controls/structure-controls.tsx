import { ComputeResponse } from "@acc2/api/compute";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acc2/components/ui/select";
import { HTMLAttributes } from "react";

export type MolstarStructureControls = {
  molecules: ComputeResponse["molecules"];
  onStructureSelect: (molecule: string) => void | Promise<void>;
} & HTMLAttributes<HTMLElement>;

export const MolstarStructureControls = ({
  molecules,
  onStructureSelect,
}: MolstarStructureControls) => {
  return (
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
  );
};

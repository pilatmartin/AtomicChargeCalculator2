import { ComputeResponse } from "@acc2/api/compute";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acc2/components/ui/select";
import MolstarPartialCharges from "molstar-partial-charges";
import { HTMLAttributes } from "react";

export type MolstarChargesetControlsProps = {
  molstar: MolstarPartialCharges;
  setCurrentTypeId: React.Dispatch<React.SetStateAction<number>>;
  configs: ComputeResponse["configs"];
} & HTMLAttributes<HTMLElement>;

export const MolstarChargesetControls = ({
  molstar,
  configs,
  setCurrentTypeId,
}: MolstarChargesetControlsProps) => {
  const onChargeSetSelect = (typeId: number) => {
    molstar.charges.setTypeId(typeId);
    setCurrentTypeId(typeId);
  };

  return (
    <div className="">
      <h3 className="font-bold mb-2">Charge Set</h3>
      <Select
        onValueChange={(value) => onChargeSetSelect(Number(value))}
        defaultValue="1"
      >
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
  );
};

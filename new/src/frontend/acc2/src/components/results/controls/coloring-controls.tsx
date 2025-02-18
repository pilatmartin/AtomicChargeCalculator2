import { Button } from "@acc2/components/ui/button";
import { Input } from "@acc2/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acc2/components/ui/select";
import MolstarPartialCharges from "molstar-partial-charges";
import { HTMLAttributes, useEffect, useRef } from "react";

export type MolstarColoringControlsProps = {
  molstar: MolstarPartialCharges;
} & HTMLAttributes<HTMLElement>;

const molstarColoringTypes = [
  "structure",
  "charges-relative",
  "charges-absolute",
] as const;

type MolstarColoringType = (typeof molstarColoringTypes)[number];

export const MolstarColoringControls = ({
  molstar,
}: MolstarColoringControlsProps) => {
  const maxValueRef = useRef<HTMLInputElement>(null);

  const onColoringSelect = async (coloring: MolstarColoringType) => {
    switch (coloring) {
      case "structure":
        await molstar.color.default();
        break;
      case "charges-relative":
        await molstar.color.relative();
        break;
      case "charges-absolute":
        await molstar.color.relative();
        break;
      default:
        console.warn(
          `Invalid Molstar coloring type. ('${coloring}'), nothing changed.`
        );
    }
  };

  const onMaxValueChange = async (maxValue: number) => {
    await molstar.color.absolute(maxValue);
  };

  const resetMaxValue = async () => {
    const maxValueInput = maxValueRef?.current;
    if (maxValueInput) {
      const maxCharge = molstar.charges.getMaxCharge();
      maxValueInput.valueAsNumber = maxCharge;
      await onMaxValueChange(maxCharge);
    }
  };

  useEffect(() => {
    if (maxValueRef.current) {
      maxValueRef.current.valueAsNumber = molstar.charges.getMaxCharge();
      maxValueRef.current.max = `${molstar.charges.getMaxCharge()}`;
    }
    onColoringSelect("charges-relative");
  }, [molstar]);

  return (
    <div className="flex gap-4 flex-col sm:flex-row">
      <div className="grow">
        <h3 className="font-bold mb-2">Coloring</h3>
        <Select
          onValueChange={onColoringSelect}
          defaultValue="charges-relative"
        >
          <SelectTrigger className="min-w-[180px] border-2">
            <SelectValue placeholder="Select Coloring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="structure"
              disabled={molstar.type.isDefaultApplicable()}
            >
              Structure
            </SelectItem>
            <SelectItem value="charges-relative">Charges (relative)</SelectItem>
            <SelectItem value="charges-absolute">Charges (absolute)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full col-span-1 sm:w-1/2">
        <h3 className="mb-2 w-fit">Max Value</h3>
        <div className="flex gap-4">
          <Input
            ref={maxValueRef}
            type="number"
            className="border-2 lg:min-w-[120px]"
            onChange={({ target }) => onMaxValueChange(target.valueAsNumber)}
            step={0.01}
          />

          <Button type="button" variant={"secondary"} onClick={resetMaxValue}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

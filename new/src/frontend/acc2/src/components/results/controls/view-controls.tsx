import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acc2/components/ui/select";
import MolstarPartialCharges from "molstar-partial-charges";
import { useEffect } from "react";

export type MolstarViewControlsProps = {
  molstar: MolstarPartialCharges;
};

const molstarViewTypes = ["balls-and-sticks", "cartoon", "surface"] as const;

type MolstarViewType = (typeof molstarViewTypes)[number];

export const MolstarViewControls = ({ molstar }: MolstarViewControlsProps) => {
  const onViewSelect = async (view: MolstarViewType) => {
    switch (view) {
      case "balls-and-sticks":
        await molstar.type.ballAndStick();
        break;
      case "cartoon":
        await molstar.type.default();
        break;
      case "surface":
        await molstar.type.surface();
        break;
      default:
        console.error(`Invalid Molstar view type. ('${view}')`);
    }
  };

  useEffect(() => {
    onViewSelect("balls-and-sticks");
  }, [molstar]);

  return (
    <div>
      <h3 className="font-bold mb-2">View</h3>
      <Select
        onValueChange={onViewSelect}
        defaultValue={
          molstar.type.isDefaultApplicable() ? "cartoon" : "balls-and-sticks"
        }
      >
        <SelectTrigger className="md:min-w-[180px] border-2">
          <SelectValue placeholder="Select View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="cartoon"
            disabled={!molstar.type.isDefaultApplicable()}
          >
            Cartoon
          </SelectItem>
          <SelectItem value="balls-and-sticks">Balls and Sticks</SelectItem>
          <SelectItem value="surface">Surface</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

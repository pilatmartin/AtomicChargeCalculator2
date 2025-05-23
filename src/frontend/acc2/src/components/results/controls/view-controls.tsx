import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acc2/components/ui/select";
import { useControlsContext } from "@acc2/lib/hooks/contexts/use-controls-context";
import MolstarPartialCharges from "@acc2/lib/viewer/viewer";

export type MolstarViewControlsProps = {
  molstar: MolstarPartialCharges;
};

export type MolstarViewType = "balls-and-sticks" | "cartoon" | "surface";

export const MolstarViewControls = ({ molstar }: MolstarViewControlsProps) => {
  const context = useControlsContext(molstar);

  return (
    <div>
      <h3 className="font-bold mb-2">View</h3>
      <Select onValueChange={context.set.viewType} value={context.get.viewType}>
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

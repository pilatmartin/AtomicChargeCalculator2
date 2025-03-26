import { cn } from "@acc2/lib/utils";
import { Progress } from "../ui/progress";
import { formatBytes } from "molstar/lib/mol-util";

export type QuotaProgressProps = {
  usedSpace: number;
  quota: number;
};

export const QuotaProgress = ({ usedSpace, quota }: QuotaProgressProps) => {
  return (
    <>
      <Progress
        value={(usedSpace / quota) * 100}
        className={"my-4"}
        indicatorClassName={cn(
          usedSpace / quota > 0.5 && "bg-yellow-500",
          usedSpace / quota > 0.8 && "bg-red-500"
        )}
      />
      <span className="font-bold text-sm whitespace-nowrap">
        {formatBytes(usedSpace)} / {formatBytes(quota)}
      </span>
    </>
  );
};

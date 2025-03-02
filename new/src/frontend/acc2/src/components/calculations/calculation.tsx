import { HTMLAttributes } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@acc2/lib/utils";
import { useNavigate } from "react-router";
import { CalculationPreview } from "@acc2/api/calculations/types";
import { useCalculationJsonMutation } from "@acc2/hooks/mutations/use-calculation-json-mutation";
import { toast } from "sonner";
import { handleApiError } from "@acc2/api/base";

export type CalculationProps = {
  calculation: CalculationPreview;
} & HTMLAttributes<HTMLElement>;

export const Calculation = ({
  calculation,
  className,
  ...props
}: CalculationProps) => {
  const { id, configs, files } = calculation;
  const navigate = useNavigate();
  const jsonMutation = useCalculationJsonMutation();

  const onDownload = async () => {
    await jsonMutation.mutateAsync(id, {
      onError: (error) => toast.error(handleApiError(error)),
      onSuccess: async (data) => {
        const blob = new Blob([JSON.stringify(data, null, 4)], {
          type: "application/json",
        });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = href;
        link.download = `${id}-charges.json`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      },
    });
  };

  return (
    <div {...props} className={cn("w-full border border-solid p-4", className)}>
      <div className="mb-4">
        <span className="block font-bold">Files</span>
        <div className="flex gap-2 flex-wrap">
          {files.map((file, index) => (
            <Badge
              key={`file-${index}`}
              className="cursor-default"
              variant={"secondary"}
            >
              {file}
            </Badge>
          ))}
        </div>
      </div>
      {/* <div className="mb-4">
        <span className="block font-bold">Molecules</span>
        <div className="flex gap-2 flex-wrap">
          {molecules.map((molecule, index) => (
            <Badge
              key={`molecule-${index}`}
              className="cursor-default"
              variant={"secondary"}
            >
              {molecule}
            </Badge>
          ))}
        </div>
      </div> */}
      <div>
        <span className="block font-bold">Calculations</span>
        <div className="flex gap-2 flex-wrap">
          {configs.map(({ method, parameters }, index) => (
            <Badge
              key={`molecule-${index}`}
              className="cursor-default"
              variant={"secondary"}
            >
              <span>{method}</span>
              {parameters && <span>&nbsp;({parameters})</span>}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-col justify-end gap-2 xs:flex-row">
        <Button
          type="button"
          variant={"default"}
          className="self-end w-full xs:w-36"
          onClick={() => {
            navigate({
              pathname: "/results",
              search: `?comp_id=${id}`,
            });
          }}
        >
          Go to Results
        </Button>
        <Button
          type="button"
          variant={"secondary"}
          className="self-end w-full xs:w-36"
          onClick={onDownload}
        >
          Get JSON
        </Button>
      </div>
    </div>
  );
};

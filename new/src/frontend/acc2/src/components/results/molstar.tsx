import MolstarPartialCharges from "molstar-partial-charges";
import { HTMLAttributes, useCallback, useEffect } from "react";
import { Card } from "../ui/card";
import { cn } from "@acc2/lib/utils";
import { baseApiUrl } from "@acc2/api/base";

export type MolstarProps = {
  molstar?: MolstarPartialCharges;
  setMolstar: React.Dispatch<MolstarPartialCharges>;
  computationId: string;
  molecule: string;
} & HTMLAttributes<HTMLElement>;

export const MolStarWrapper = ({
  molstar,
  setMolstar,
  computationId,
  molecule,
  className,
  ...props
}: MolstarProps) => {
  const setup = useCallback(async () => {
    if (!molstar) {
      molstar = await MolstarPartialCharges.create("molstar", {
        SbNcbrPartialCharges: true,
      });
      setMolstar(molstar);
    }

    try {
      await molstar.load(
        `${baseApiUrl}/charges/mmcif?computation_id=${computationId}&molecule=${molecule}`
      );
      // await molstar.load(`${location.origin}/1f16.fw2.cif`, "mmcif", "ACC2");
    } catch (e) {
      console.log("Caught error", e);
    }
    await molstar.color.relative();
    await molstar.type.ballAndStick();
  }, []);

  useEffect(() => {
    setup();
  }, []);

  return (
    <Card
      {...props}
      className={cn(
        "w-4/5 rounded-none shadow-xl mx-auto p-4 max-w-content mt-4 flex flex-col h-[700px]",
        className
      )}
    >
      <div className="w-full h-full relative">
        <div id="molstar"></div>
      </div>
    </Card>
  );
};

import MolstarPartialCharges from "molstar-partial-charges";
import { HTMLAttributes, useEffect } from "react";
import { Card } from "../ui/card";
import { cn } from "@acc2/lib/utils";

export type MolstarProps = {
  setMolstar: React.Dispatch<
    React.SetStateAction<MolstarPartialCharges | undefined>
  >;
} & HTMLAttributes<HTMLElement>;

export const MolStarWrapper = ({
  setMolstar,
  className,
  ...props
}: MolstarProps) => {
  const setup = async () => {
    const molstar = await MolstarPartialCharges.create("molstar-root", {
      SbNcbrPartialCharges: true,
    });
    // TODO: show controls
    molstar.plugin.layout.setProps({
      showControls: true,
      isExpanded: true,
    });
    setMolstar(() => molstar);
  };

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
      <div id="molstar-root" className="w-full h-full relative"></div>
    </Card>
  );
};

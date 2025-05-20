import { cn } from "@acc2/lib/utils";
import { HTMLAttributes, useEffect, useState } from "react";

import { Card } from "../ui/card";
import { Plugin } from "molstar/lib/commonjs/mol-plugin-ui/plugin";
import { PluginUIContext } from "molstar/lib/commonjs/mol-plugin-ui/context";
import { Busy, BusySize } from "../shared/busy";
import { combineLatest } from "rxjs";

export type MolstarViewerProps = {
  plugin: PluginUIContext;
} & HTMLAttributes<HTMLElement>;

export const MolstarViewer = ({
  plugin,
  className,
  ...props
}: MolstarViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = combineLatest([
      plugin.behaviors.state.isUpdating,
      plugin.behaviors.state.isAnimating,
    ]).subscribe((states) => setIsLoading(states.some(Boolean)));

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Card
      {...props}
      className={cn(
        "w-full rounded-none shadow-xl mx-auto p-4 max-w-content mt-4 flex flex-col h-[700px]",
        className
      )}
    >
      <div className="w-full h-full relative">
        <Busy isBusy={isLoading} size={BusySize.Big} delay={100} />
        <Plugin plugin={plugin} />
      </div>
    </Card>
  );
};

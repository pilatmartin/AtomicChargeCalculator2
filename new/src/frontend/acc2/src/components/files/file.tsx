import { FileResponse } from "@acc2/api/files/types";
import { HTMLAttributes } from "react";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { cn, formatBytes } from "@acc2/lib/utils";
dayjs.extend(localizedFormat);

export type FileProps = { file: FileResponse } & HTMLAttributes<HTMLElement>;

export const File = ({ file, className }: FileProps) => {
  return (
    <div
      className={cn(
        "w-full border border-solid p-4 relative mb-2 flex flex-col gap-2",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <span
          className="text-lg font-bold text-primary overflow-ellipsis overflow-hidden w-3/5"
          title={file.fileName}
        >
          {file.fileName}
        </span>
        <div className="min-w-36">
          <span className="block text-end text-xs">
            {dayjs(file.uploadedAt).format("LLL")}
          </span>
          <span className="block text-end text-xs">
            {formatBytes(file.size)}
          </span>
        </div>
      </div>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div className="flex gap-2 items-center cursor-pointer">
            <span className="font-semibold">Statistics</span>
            <ChevronsUpDown height={15} width={15} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="text-sm pl-4 mt-2 border-l border-gray-200">
            <div className="flex flex-col">
              <span className="mr-2 font-bold">Total Molecules</span>
              <span>{file.stats.totalMolecules}</span>
            </div>
            <div className="flex flex-col text=sm">
              <span className="mr-2 font-bold">Total Atoms</span>
              <span>{file.stats.totalAtoms}</span>
            </div>
            <div className="text-sm">
              <span className="block font-bold">Atom Type Counts</span>
              {file.stats?.atomTypeCounts
                .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
                .map(({ symbol, count }, index) => (
                  <div key={`${file.fileHash}-atomTypeCounts-${index}`}>
                    <span className="font-bold mr-1 text-muted-foreground">
                      {symbol}:
                    </span>
                    <span className="mr-2">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="mt-4 flex flex-col justify-end gap-2 xs:flex-row">
        <Button
          type="button"
          variant={"default"}
          className="self-end w-full xs:w-28"
          onClick={() => console.log("clicked view")}
        >
          View
        </Button>
        <Button
          type="button"
          variant={"secondary"}
          className="self-end w-full xs:w-28"
          onClick={() => console.log("clicked download")}
        >
          Download
        </Button>
        <Button
          type="button"
          variant={"destructive"}
          className="self-end w-full xs:w-28"
          onClick={() => console.log("clicked download")}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

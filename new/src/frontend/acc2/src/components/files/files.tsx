import { Paginator } from "../ui/paginator";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ArrowDownZA, ArrowUpZA, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { QuotaProgress } from "../shared/quota-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect } from "react";
import { isValidFilesOrderField } from "@acc2/api/types";
import { useSearchParams } from "react-router";
import { SearchInput } from "../shared/search-input";
import { useQuotaQuery } from "@acc2/hooks/queries/files";
import { File } from "./file";
import { useFileFilters } from "@acc2/hooks/filters/use-file-filters";
import { useFilesQuery } from "@acc2/hooks/queries/files";
import { Busy } from "../ui/busy";
import { Input } from "../ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Separator } from "../ui/separator";
import { UploadDialog } from "./upload-dialog";

dayjs.extend(localizedFormat);

export const Files = () => {
  const [searchParams, _] = useSearchParams();
  const {
    data: quota,
    isPending: isQuotaPending,
    isError: isQuotaError,
  } = useQuotaQuery();
  const { filters, setFilters } = useFileFilters();
  const {
    data: files,
    isPending: isFilesPending,
    isError: isFilesError,
    refetch,
  } = useFilesQuery(filters);

  useEffect(() => {
    refetch();
  }, [searchParams]);

  return (
    <main className="min-h-main w-full max-w-content mx-auto flex flex-col p-4">
      <h2 className="text-3xl text-primary font-bold mb-2 md:text-5xl">
        Uploaded Files
      </h2>

      <Busy isBusy={isFilesPending || isQuotaPending}>Fetching files</Busy>

      <div className="w-full flex items-center gap-4">
        {quota && (
          <QuotaProgress quota={quota.quota} usedSpace={quota.usedSpace} />
        )}
      </div>

      <UploadDialog />

      <div className="my-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <SearchInput
          searchKey="search"
          type="text"
          placeholder="Search ..."
          className="min-w-[100px] w-full sm:w-[360px]"
          onSearch={(search) => {
            setFilters((filters) => ({ ...filters, search }));
          }}
        />
        <div className="flex gap-2 w-full sm:w-fit">
          <Select
            defaultValue="uploaded_at"
            onValueChange={(orderBy) => {
              if (!isValidFilesOrderField(orderBy)) {
                return;
              }
              setFilters((filters) => ({ ...filters, orderBy: orderBy }));
            }}
          >
            <SelectTrigger className="sm:w-[180px] border-2">
              <SelectValue placeholder="Order By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uploaded_at">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() =>
              setFilters((filters) => ({
                ...filters,
                order: filters.order === "asc" ? "desc" : "asc",
              }))
            }
          >
            {filters.order === "asc" && <ArrowUpZA />}
            {filters.order === "desc" && <ArrowDownZA />}
          </Button>
        </div>
      </div>

      {(isFilesError || isQuotaError) && (
        <div className="grid place-content-center grow">
          <span className="font-bold text-2xl">
            Something went wrong while fetching files.
          </span>
        </div>
      )}

      {files && files.items.length === 0 && (
        <div className="grid place-content-center grow">
          <span className="font-bold text-2xl">No files to show.</span>
        </div>
      )}

      {files && files.items.length > 0 && (
        <>
          {files.items.map((file, index) => (
            <File file={file} key={`${index}-${file.fileHash}`} />
          ))}
          <Paginator
            page={filters.page}
            pageSize={filters.pageSize}
            totalPages={files.totalPages}
            onPageChange={({ page, pageSize }) =>
              setFilters((filters) => ({ ...filters, page, pageSize }))
            }
            className="mt-auto"
          />
        </>
      )}
    </main>
  );
};

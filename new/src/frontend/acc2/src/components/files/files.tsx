import { MoleculeSetStats } from "@acc2/api/calculations/types";
import { Paginator } from "../ui/paginator";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
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
import { useEffect, useState } from "react";
import { isValidFilesOrderField, PagedData } from "@acc2/api/types";
import { useSearchParams } from "react-router";
import { SearchInput } from "../shared/search-input";
import { useQuotaQuery } from "@acc2/hooks/queries/use-quota-query";
import { useFilesMutation } from "@acc2/hooks/mutations/use-files-mutation";
import { handleApiError } from "@acc2/api/base";
import { toast } from "sonner";
import { FileResponse } from "@acc2/api/files/types";
import { File } from "./file";
import { useFileFilters } from "@acc2/hooks/filters/use-file-filters";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
dayjs.extend(localizedFormat);

export const Files = () => {
  const [searchParams, _] = useSearchParams();
  const { data: quota } = useQuotaQuery();
  const filesMutation = useFilesMutation();

  const { filters, setFilters } = useFileFilters();

  const [files, setFiles] = useState<PagedData<FileResponse>>({
    items: [],
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount: 0,
    totalPages: 1,
  });

  const getFiles = async () => {
    await filesMutation.mutateAsync(filters, {
      onError: (error) => toast.error(handleApiError(error)),
      onSuccess: (data) => setFiles(data),
    });
  };

  useEffect(() => {
    getFiles();
  }, [searchParams]);

  return (
    <main className="min-h-main w-full max-w-content mx-auto flex flex-col p-4">
      <h2 className="text-3xl text-primary font-bold mb-2 md:text-5xl">
        Uploaded Files
      </h2>

      <div className="w-full flex items-center gap-4">
        {quota && (
          <QuotaProgress quota={quota.quota} usedSpace={quota.usedSpace} />
        )}
      </div>

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

      {files.items.length === 0 && (
        <div className="grid place-content-center grow">
          <span className="font-bold text-2xl">No files to show.</span>
        </div>
      )}

      {files.items.length > 0 && (
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

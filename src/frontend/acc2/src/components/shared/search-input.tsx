import { cn } from "@acc2/lib/utils";
import { InputHTMLAttributes } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "../ui/input";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  searchKey: string;
  onSearch?: (term: string) => void;
};

export const SearchInput = ({
  searchKey,
  className,
  onSearch,
  ...props
}: SearchInputProps) => {
  const [searchParams, _] = useSearchParams();
  const handleSearch = useDebouncedCallback((term) => {
    onSearch?.(term);
  }, 300);

  return (
    <Input
      {...props}
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get(searchKey)?.toString()}
      className={cn("border-2 w-[360px]", className)}
    />
  );
};

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { ScrollArea } from "../ui/scroll-area";
import { Calculation } from "./calculation";
import { useCalculationsMutation } from "@acc2/hooks/mutations/use-calculations-mutation";
import { PagedData, PagingFilters } from "@acc2/api/types";
import { toast } from "sonner";
import { handleApiError } from "@acc2/api/base";
import { CalculationPreview } from "@acc2/api/calculations/types";

export const Calculations = () => {
  const calculationMutation = useCalculationsMutation();

  const [calculations, setCalculations] = useState<
    PagedData<CalculationPreview>
  >({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const getCalculations = async (filters: PagingFilters) => {
    await calculationMutation.mutateAsync(filters, {
      onError: (error) => toast.error(handleApiError(error)),
      onSuccess: (data) => setCalculations(data),
    });
  };

  useEffect(() => {
    getCalculations({ page: 1, pageSize: 10 });
  }, []);

  return (
    <main className="h-main w-full max-w-content mx-auto flex flex-col p-4">
      <h2 className="text-3xl text-primary font-bold mb-2 md:text-5xl">
        Calculations
      </h2>

      {calculations.items.length === 0 && (
        <div className="grid place-content-center grow">
          <span className="font-bold text-2xl">No calculations to show.</span>
        </div>
      )}
      {calculations.items.length > 0 && (
        <>
          <ScrollArea type="auto" className="grow h-0 pr-4 w-full">
            {calculations.items.map((calculation, index) => (
              <Calculation
                key={index}
                calculation={calculation}
                className="mb-2"
              />
            ))}
          </ScrollArea>
          <Pagination>
            <PaginationContent>
              <PaginationItem className="w-32">
                {calculations.page <= 1 && (
                  <PaginationPrevious
                    href="#"
                    tabIndex={-1}
                    className="opacity-50 pointer-events-none"
                    aria-disabled
                  />
                )}
                {calculations.page > 1 && <PaginationPrevious href="#" />}
              </PaginationItem>
              {calculations.page > 1 && (
                <PaginationItem>
                  <PaginationLink href="#">
                    {calculations.page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {calculations.page}
                </PaginationLink>
              </PaginationItem>
              {calculations.totalPages > calculations.page && (
                <PaginationItem>
                  <PaginationLink href="#">
                    {calculations.page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {calculations.totalPages > calculations.page + 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem className="w-32">
                {calculations.totalPages > calculations.page && (
                  <PaginationNext href="#" />
                )}
                {calculations.totalPages <= calculations.page && (
                  <PaginationNext
                    href="#"
                    tabIndex={-1}
                    className="opacity-50 pointer-events-none"
                    aria-disabled
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </main>
  );
};

import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Calculation } from "./calculation";
import { useCalculationsMutation } from "@acc2/hooks/mutations/use-calculations-mutation";
import { PagedData, PagingFilters } from "@acc2/api/types";
import { toast } from "sonner";
import { handleApiError } from "@acc2/api/base";
import { CalculationPreview } from "@acc2/api/calculations/types";
import { useSearchParams } from "react-router";
import { Paginator } from "../ui/paginator";

export const Calculations = () => {
  const calculationMutation = useCalculationsMutation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [calculations, setCalculations] = useState<
    PagedData<CalculationPreview>
  >({
    items: [],
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    pageSize: Math.max(1, Number(searchParams.get("pageSize") ?? 5)),
    totalCount: 0,
    totalPages: 1,
  });

  const getCalculations = async (filters: PagingFilters) => {
    setSearchParams(
      new URLSearchParams({
        page: `${filters.page}`,
        pageSize: `${filters.pageSize}`,
      })
    );
    await calculationMutation.mutateAsync(filters, {
      onError: (error) => toast.error(handleApiError(error)),
      onSuccess: (data) => setCalculations(data),
    });
  };

  useEffect(() => {
    getCalculations({
      page: calculations.page,
      pageSize: calculations.pageSize,
    });
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
          <Paginator
            page={calculations.page}
            pageSize={calculations.pageSize}
            totalPages={calculations.totalPages}
            onPageChange={getCalculations}
          />
        </>
      )}
    </main>
  );
};

import { api } from "../base";
import { ApiResponse, PagedData, PagingFilters } from "../types";
import { CalculationPreview } from "./types";

export const getCalculations = async (
  filters: PagingFilters
): Promise<PagedData<CalculationPreview>> => {
  const response = await api.get<ApiResponse<PagedData<CalculationPreview>>>(
    `/charges/calculations`,
    {
      params: {
        page: filters.page,
        page_size: filters.pageSize,
      },
    }
  );

  if (!response.data.success) {
    throw Error(response.data.message);
  }

  return response.data.data;
};

export const getCalculationJson = async (
  calculationId: string
): Promise<string> => {
  const response = await api.get<string>(`/charges/${calculationId}/json`);

  if (!response.data) {
    throw Error("Unable to get calculation json.");
  }

  return response.data;
};

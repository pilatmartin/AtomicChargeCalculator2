import { getQuota } from "@acc2/api/files/files";
import { useQuery } from "@tanstack/react-query";

export const useQuotaQuery = () => {
  return useQuery({
    queryKey: ["quota"],
    queryFn: getQuota,
  });
};

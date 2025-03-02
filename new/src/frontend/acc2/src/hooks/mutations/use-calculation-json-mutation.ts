import { getCalculationJson } from "@acc2/api/calculations/calculations";
import { useMutation } from "@tanstack/react-query";

export const useCalculationJsonMutation = () => {
  return useMutation({
    mutationFn: getCalculationJson,
  });
};

import { compute } from "@acc2/api/compute";
import { useMutation } from "@tanstack/react-query";

export const useComputationMutation = () => {
  return useMutation({
    mutationFn: async ({ computationId }: { computationId: string }) =>
      await compute(computationId),
  });
};

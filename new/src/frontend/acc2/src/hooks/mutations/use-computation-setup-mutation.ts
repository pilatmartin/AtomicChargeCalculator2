import { setup } from "@acc2/api/compute";
import { useMutation } from "@tanstack/react-query";

export const useComputationSetupMutation = () => {
  return useMutation({
    mutationFn: setup,
  });
};

import { login } from "@acc2/api/auth/auth";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};

import { logout } from "@acc2/api/auth/auth";
import { useMutation } from "@tanstack/react-query";

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logout,
  });
};

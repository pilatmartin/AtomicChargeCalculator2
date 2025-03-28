import { getFiles } from "@acc2/api/files/files";
import { useMutation } from "@tanstack/react-query";

export const useFilesMutation = () => {
  return useMutation({
    mutationFn: getFiles,
  });
};

import { deleteFile, getFiles, upload } from "@acc2/api/files/files";
import { useMutation } from "@tanstack/react-query";

export const useFilesMutation = () => {
  return useMutation({
    mutationKey: ["files", "list"],
    mutationFn: getFiles,
  });
};

export const useFileDeleteMutation = () => {
  return useMutation({
    mutationKey: ["files", "delete"],
    mutationFn: deleteFile,
  });
};

export const useFileUploadMutation = () => {
  return useMutation({
    mutationKey: ["files", "upload"],
    mutationFn: upload,
  });
};

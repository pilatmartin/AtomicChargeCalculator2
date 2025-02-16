import { api } from "./base";
import { Response } from "./types";

export type SetupResponse = {
  computationId: string;
};

export const setup = async (
  files: FileList
): Promise<Response<SetupResponse>> => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const response = await api.postForm("/charges/setup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export type ComputeResponse = {
  molecules: string[];
  configs: {
    method: string;
    parameters: string;
  }[];
};

export const compute = async (
  computationId: string
): Promise<Response<ComputeResponse>> => {
  const response = await api.post(
    "/charges/calculate",
    [
      {
        method: null,
        parameters: null,
        read_hetatm: true,
        ignore_water: false,
        permissive_types: false,
      },
    ],
    {
      params: {
        computation_id: computationId,
        response_format: "mmcif",
      },
    }
  );
  return response.data;
};

import { api } from "./base";
import { Response } from "./types";

// TODO: add types
export const getAvailableMethods = async (): Promise<unknown> => {
  return await api.get("/charges/methods");
};

export type SuitableMethods = {
  methods: string[];
  parameters: {
    [key: string]: string[];
  };
};

export const getSuitableMethods = async (
  computationId: string
): Promise<Response<SuitableMethods>> => {
  const response = await api.post(
    "/charges/methods",
    {},
    { params: { computation_id: computationId } }
  );
  return response.data;
};

export type ComputeResponse = {
  molecules: string[];
  configs: {
    method: string;
    parameters: string;
  }[];
};

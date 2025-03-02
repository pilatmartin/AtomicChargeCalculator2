export type CalculationPreview = {
  id: string;
  files: string[];
  configs: {
    method: string;
    parameters: string;
    readHetatm: boolean;
    ignoreWater: boolean;
    permissiveTypes: boolean;
  }[];
};

export type UploadResponse = {
  file: string;
  file_hash: string;
}[];

export type QuotaResponse = {
  usedSpace: number;
  availableSpace: number;
  quota: number;
};

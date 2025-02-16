import { baseApiUrl } from "@acc2/api/base";
import { useQuery } from "@tanstack/react-query";

export const useMolstarLoad = async (
  computationId: string,
  molecule: string
) => {
  const molstar: any = {}; // TODO: add molstar context
  useQuery({
    queryKey: ["mmcif", computationId, molecule],
    queryFn: async () =>
      await molstar.load(
        `${baseApiUrl}/charges/mmcif?computation_id=${computationId}&molecule=${molecule}`
      ),
  });
};

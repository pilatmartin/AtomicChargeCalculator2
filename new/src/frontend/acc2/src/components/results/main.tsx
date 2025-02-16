import { MolStarWrapper } from "./molstar";
import { Controls } from "./controls";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate, useSearchParams } from "react-router";
import { useComputationMutation } from "@acc2/hooks/mutations/use-computation-mutation";
import { useCallback, useEffect, useState } from "react";
import { ComputeResponse } from "@acc2/api/compute";
import MolstarPartialCharges from "molstar-partial-charges";

export const Main = () => {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const computationId = searchParams.get("comp_id");
  if (!computationId) {
    navigate("/");
    return null;
  }

  const computeMutation = useComputationMutation();
  const [computation, setComputation] = useState<ComputeResponse>();
  const [molstar, setMolstar] = useState<MolstarPartialCharges>();

  const compute = useCallback(async (): Promise<void> => {
    const computeResponse = await computeMutation.mutateAsync(
      {
        computationId,
      },
      {
        onError: () => {
          navigate("/");
        },
      }
    );

    if (!computeResponse.success) {
      // TODO: add toast or smth
      console.error(computeResponse.message);
      navigate("/");
      return;
    }

    setComputation(computeResponse.data);
  }, []);

  useEffect(() => {
    compute();
  }, []);

  return (
    <main className="mx-auto w-full selection:text-white selection:bg-primary mb-8">
      <ScrollArea type="auto" className="relative">
        <h2 className="w-4/5 mx-auto max-w-content mt-8 text-3xl text-primary font-bold mb-2 sm:text-5xl">
          Computational Results
        </h2>
        {computation && molstar && (
          <Controls
            computationId={computationId}
            computation={computation}
            molstar={molstar}
          />
        )}
        {computation && (
          <MolStarWrapper
            molstar={molstar}
            setMolstar={setMolstar}
            computationId={computationId}
            molecule={computation.molecules[0]}
          />
        )}
      </ScrollArea>
    </main>
  );
};

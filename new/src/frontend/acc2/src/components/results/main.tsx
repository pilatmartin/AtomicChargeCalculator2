import { MolStarWrapper } from "./molstar";
import { Controls } from "./controls/controls";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import MolstarPartialCharges from "molstar-partial-charges";
import { ComputeResponse } from "@acc2/api/compute";
import { useComputationMutation } from "@acc2/hooks/mutations/use-computation-mutation";

export const Main = () => {
  const navigate = useNavigate();
  const computationMutation = useComputationMutation();

  const [searchParams, _setSearchParams] = useSearchParams();
  const [molstar, setMolstar] = useState<MolstarPartialCharges>();
  const [computation, setComputation] = useState<ComputeResponse>();

  const computationId = searchParams.get("comp_id");
  if (!computationId) {
    navigate("/");
    return null;
  }

  const compute = async () => {
    const response = await computationMutation.mutateAsync(
      { computationId },
      {
        onError: () => {
          console.log("Something went wrong during computation.");
          navigate("/");
        },
      }
    );

    if (!response.success) {
      navigate("/");
    } else {
      setComputation(response.data);
    }
  };

  useEffect(() => {
    compute();
  }, []);

  return (
    <main className="mx-auto w-full selection:text-white selection:bg-primary mb-8">
      <ScrollArea type="auto" className="relative">
        <h2 className="w-4/5 mx-auto max-w-content mt-8 text-3xl text-primary font-bold mb-2 sm:text-5xl">
          Computational Results
        </h2>
        {molstar && computation && (
          <Controls
            computationId={computationId}
            computation={computation}
            molstar={molstar}
          />
        )}
        <MolStarWrapper setMolstar={setMolstar} />
      </ScrollArea>
    </main>
  );
};

import { Controls } from "@acc2/components/results/controls/controls";
import { MolStarWrapper } from "@acc2/components/results/molstar";
import { Busy } from "@acc2/components/ui/busy";
import { ScrollArea } from "@acc2/components/ui/scroll-area";
import { BusyContextProvider } from "@acc2/contexts/busy-context";
import { useMoleculesMutation } from "@acc2/hooks/mutations/use-molecules-mutation";
import { useTitle } from "@acc2/hooks/use-title";
import { cn } from "@acc2/lib/utils";
import MolstarPartialCharges from "molstar-partial-charges";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export const Results = () => {
  useTitle("Results");

  const navigate = useNavigate();
  const moleculesMutation = useMoleculesMutation();

  const [searchParams, _setSearchParams] = useSearchParams();
  const [molstar, setMolstar] = useState<MolstarPartialCharges>();
  const [molecules, setMolecules] = useState<string[]>();
  const [busyCount, setBusyCount] = useState<number>(0);

  const computationId = searchParams.get("comp_id");
  if (!computationId) {
    navigate("/");
    return null;
  }

  const loadMolecules = async () => {
    const response = await moleculesMutation.mutateAsync(computationId, {
      onError: () => {
        toast.error("Unable to load computation data.");
        navigate("/");
      },
    });

    if (!response.success) {
      navigate("/");
      return;
    }
    setMolecules(response.data);
  };

  useEffect(() => {
    loadMolecules();
  }, []);

  return (
    <main
      className={cn(
        "mx-auto w-full selection:text-white selection:bg-primary mb-8 relative",
        moleculesMutation.isPending || !molstar ? "opacity-0" : "opacity-100"
      )}
    >
      <BusyContextProvider value={{ busyCount, setBusyCount }}>
        <Busy isBusy={busyCount > 0} />
        <ScrollArea type="auto" className="relative">
          <h2 className="w-4/5 mx-auto max-w-content mt-8 text-3xl text-primary font-bold mb-2 sm:text-5xl">
            Computational Results
          </h2>
          {molstar && molecules && (
            <Controls
              computationId={computationId}
              molecules={molecules}
              molstar={molstar}
            />
          )}
          <MolStarWrapper setMolstar={setMolstar} />
        </ScrollArea>
      </BusyContextProvider>
    </main>
  );
};

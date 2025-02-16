import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "./router";
import { ComputationContextProvider } from "./contexts/computation-context";
import { useState } from "react";
import { ComputeResponse } from "./api/compute";

const queryClient = new QueryClient();

export const App = () => {
  const [computation, setComputation] = useState<ComputeResponse>({
    configs: [],
    molecules: [],
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ComputationContextProvider value={{ computation, setComputation }}>
        <Router />
      </ComputationContextProvider>
    </QueryClientProvider>
  );
};

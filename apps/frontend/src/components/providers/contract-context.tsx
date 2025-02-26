import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  MarketplaceContract,
  initializeQueryClient,
  initializeExecutionClient,
} from "@/contract/contract"; // adjust the import path

// Define the shape of our context.
interface ContractContextType {
  // The query client might be null initially, so we allow that.
  queryClient: InstanceType<
    typeof MarketplaceContract.CowrieMarketplaceQueryClient
  > | null;
  // A helper function to create an execution client using the sender's wallet address.
  getExecutionClient: (
    sender: string,
  ) => Promise<
    InstanceType<typeof MarketplaceContract.CowrieMarketplaceClient>
  >;
}

// Create the context.
const ContractContext = createContext<ContractContextType | undefined>(
  undefined,
);

// The provider component.
export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient, setQueryClient] =
    useState<ContractContextType["queryClient"]>(null);

  // Initialize the query client when the provider mounts.
  useEffect(() => {
    async function init() {
      const { queryClient } = await initializeQueryClient();
      setQueryClient(queryClient);
    }
    init();
  }, []);

  // This function creates an execution client for the provided sender.
  const getExecutionClient = async (sender: string) => {
    const { executionClient } = await initializeExecutionClient(sender);
    return executionClient;
  };

  return (
    <ContractContext.Provider value={{ queryClient, getExecutionClient }}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom hook to consume the context.
export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};

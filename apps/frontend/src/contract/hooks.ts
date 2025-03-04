import { useMutation, useQuery } from "@tanstack/react-query";

import { useContract } from "@/components/providers/contract-context";
import { CowrieMarketplaceQueryClient } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.client";
import { Uint128 } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.types";

export const useGetProduct = (id: number) => {};

const getAllProducts = async (
  queryClient: CowrieMarketplaceQueryClient | null,
) => {
  if (!queryClient) return null;
  return await queryClient.getListings({
    status: "active",
  });
};

export const useGetAllProducts = () => {
  const { queryClient } = useContract();
  return useQuery({
    queryFn: () => getAllProducts(queryClient),
    queryKey: ["all-active-products"],
    refetchInterval: 3600,
  });
};

// interface ExecuteListProduct {
//  executeMsg: Extract<ExecuteMsg, {create_listing: any}>["create_listing"]
// }

type ExecuteMsg = {
  description: string;
  imageUrl: string;
  price: Uint128;
  title: string;
  tokenDenom: string;
};

export const useListNewProduct = () => {
  const { getExecutionClient } = useContract();

  return useMutation(async ({ executeMsg }: { executeMsg: ExecuteMsg }) => {
    const execClient = await getExecutionClient();

    if (!execClient) {
      throw new Error("Execution client not available");
    }

    const res = await execClient?.createListing({
      ...executeMsg,
    });

    return res;
  }, {});
};

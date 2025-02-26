import { useMutation, useQuery } from "@tanstack/react-query";

import { useContract } from "@/components/providers/contract-context";
import {
  CowrieMarketplaceClient,
  CowrieMarketplaceQueryClient,
} from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.client";
import { Listing } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.types";
import { Coin } from "@cosmjs/proto-signing";
import { ExecuteMsg } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.types";

export const useGetProduct = (id: number) => {};

const getAllProducts = async (
  queryClient: CowrieMarketplaceQueryClient | null,
) => {
  if (!queryClient) return;
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

interface ExecuteListProduct {
  sender: string;
  executeMsg: ExecuteMsg["create_listing"];
  funds?: Coin[];
}

export const useListNewProduct = () => {
  const { getExecutionClient } = useContract();
  const dummySender = "neutron1ng85pfzhvln6fs7fzx7yxjy9n7kawahzc8lcvx";
  const executionClient = getExecutionClient(dummySender);
  return useMutation(
    async ({ sender, executeMsg, funds }: ExecuteListProduct) => {
      const exec = await getExecutionClient(sender || dummySender);
      return exec.createListing({
        ...executeMsg,
      });
    },
  );
};

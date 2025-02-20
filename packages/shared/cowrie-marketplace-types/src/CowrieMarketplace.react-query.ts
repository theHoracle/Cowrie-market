/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import { InstantiateMsg, ExecuteMsg, Uint128, QueryMsg, ListingStatus, ConfigResponse, Addr, ListingResponse, Listing, ListingsResponse, UserListingsResponse } from "./CowrieMarketplace.types";
import { CowrieMarketplaceQueryClient, CowrieMarketplaceClient } from "./CowrieMarketplace.client";
export const cowrieMarketplaceQueryKeys = {
  contract: ([{
    contract: "cowrieMarketplace"
  }] as const),
  address: (contractAddress: string) => ([{ ...cowrieMarketplaceQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  getConfig: (contractAddress: string, args?: Record<string, unknown>) => ([{ ...cowrieMarketplaceQueryKeys.address(contractAddress)[0],
    method: "get_config",
    args
  }] as const),
  getListing: (contractAddress: string, args?: Record<string, unknown>) => ([{ ...cowrieMarketplaceQueryKeys.address(contractAddress)[0],
    method: "get_listing",
    args
  }] as const),
  getListings: (contractAddress: string, args?: Record<string, unknown>) => ([{ ...cowrieMarketplaceQueryKeys.address(contractAddress)[0],
    method: "get_listings",
    args
  }] as const),
  getUserListings: (contractAddress: string, args?: Record<string, unknown>) => ([{ ...cowrieMarketplaceQueryKeys.address(contractAddress)[0],
    method: "get_user_listings",
    args
  }] as const)
};
export interface CowrieMarketplaceReactQuery<TResponse, TData = TResponse> {
  client: CowrieMarketplaceQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface CowrieMarketplaceGetUserListingsQuery<TData> extends CowrieMarketplaceReactQuery<UserListingsResponse, TData> {
  args: {
    limit?: number;
    seller: string;
    startAfter?: number;
  };
}
export function useCowrieMarketplaceGetUserListingsQuery<TData = UserListingsResponse>({
  client,
  args,
  options
}: CowrieMarketplaceGetUserListingsQuery<TData>) {
  return useQuery<UserListingsResponse, Error, TData>(cowrieMarketplaceQueryKeys.getUserListings(client.contractAddress, args), () => client.getUserListings({
    limit: args.limit,
    seller: args.seller,
    startAfter: args.startAfter
  }), options);
}
export interface CowrieMarketplaceGetListingsQuery<TData> extends CowrieMarketplaceReactQuery<ListingsResponse, TData> {
  args: {
    limit?: number;
    startAfter?: number;
    status?: ListingStatus;
  };
}
export function useCowrieMarketplaceGetListingsQuery<TData = ListingsResponse>({
  client,
  args,
  options
}: CowrieMarketplaceGetListingsQuery<TData>) {
  return useQuery<ListingsResponse, Error, TData>(cowrieMarketplaceQueryKeys.getListings(client.contractAddress, args), () => client.getListings({
    limit: args.limit,
    startAfter: args.startAfter,
    status: args.status
  }), options);
}
export interface CowrieMarketplaceGetListingQuery<TData> extends CowrieMarketplaceReactQuery<ListingResponse, TData> {
  args: {
    listingId: number;
  };
}
export function useCowrieMarketplaceGetListingQuery<TData = ListingResponse>({
  client,
  args,
  options
}: CowrieMarketplaceGetListingQuery<TData>) {
  return useQuery<ListingResponse, Error, TData>(cowrieMarketplaceQueryKeys.getListing(client.contractAddress, args), () => client.getListing({
    listingId: args.listingId
  }), options);
}
export interface CowrieMarketplaceGetConfigQuery<TData> extends CowrieMarketplaceReactQuery<ConfigResponse, TData> {}
export function useCowrieMarketplaceGetConfigQuery<TData = ConfigResponse>({
  client,
  options
}: CowrieMarketplaceGetConfigQuery<TData>) {
  return useQuery<ConfigResponse, Error, TData>(cowrieMarketplaceQueryKeys.getConfig(client.contractAddress), () => client.getConfig(), options);
}
export interface CowrieMarketplaceUpdateConfigMutation {
  client: CowrieMarketplaceClient;
  msg: {
    commissionRate?: number;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useCowrieMarketplaceUpdateConfigMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, CowrieMarketplaceUpdateConfigMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, CowrieMarketplaceUpdateConfigMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateConfig(msg, fee, memo, funds), options);
}
export interface CowrieMarketplaceBuyItemMutation {
  client: CowrieMarketplaceClient;
  msg: {
    listingId: number;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useCowrieMarketplaceBuyItemMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, CowrieMarketplaceBuyItemMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, CowrieMarketplaceBuyItemMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.buyItem(msg, fee, memo, funds), options);
}
export interface CowrieMarketplaceCancelListingMutation {
  client: CowrieMarketplaceClient;
  msg: {
    listingId: number;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useCowrieMarketplaceCancelListingMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, CowrieMarketplaceCancelListingMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, CowrieMarketplaceCancelListingMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.cancelListing(msg, fee, memo, funds), options);
}
export interface CowrieMarketplaceUpdateListingMutation {
  client: CowrieMarketplaceClient;
  msg: {
    description?: string;
    imageUrl?: string;
    listingId: number;
    price?: Uint128;
    title?: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useCowrieMarketplaceUpdateListingMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, CowrieMarketplaceUpdateListingMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, CowrieMarketplaceUpdateListingMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateListing(msg, fee, memo, funds), options);
}
export interface CowrieMarketplaceCreateListingMutation {
  client: CowrieMarketplaceClient;
  msg: {
    description: string;
    imageUrl: string;
    price: Uint128;
    title: string;
    tokenDenom: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useCowrieMarketplaceCreateListingMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, CowrieMarketplaceCreateListingMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, CowrieMarketplaceCreateListingMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.createListing(msg, fee, memo, funds), options);
}
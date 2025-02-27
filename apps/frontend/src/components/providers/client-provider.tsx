"use client";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-providers";
import { ChainProvider, useChain } from "@cosmos-kit/react";
import { chains, assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import QueryProvider from "./query-provider";
import WalletChainProvider from "./wallet/wallet-provider";
import { ContractProvider } from "./contract-context";

function ClientProviders({ children }: PropsWithChildren) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <ContractProvider>
            <WalletChainProvider>{children}</WalletChainProvider>
          </ContractProvider>
        </QueryProvider>
      </ThemeProvider>
    </>
  );
}

export default ClientProviders;

"use client";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-providers";
import { ChainProvider, useChain } from "@cosmos-kit/react";
import { chains, assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import QueryProvider from "./query-provider";
import WalletChainProvider from "./wallet/wallet-provider";

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
          <WalletChainProvider>{children}</WalletChainProvider>
        </QueryProvider>
      </ThemeProvider>
    </>
  );
}

export default ClientProviders;

"use client";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-providers";
import { ChainProvider, useChain } from "@cosmos-kit/react";
import { chains, assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import QueryProvider from "./query-provider";

function ClientProviders({ children }: PropsWithChildren) {
  
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider >
        <ChainProvider
          chains={chains}
          assetLists={assets}
          wallets={wallets}
          // walletConnectOptions={{
          //   signClient: {
          //     projectId: 'your_project_id', // Optional: only if using WalletConnect
          //     relayUrl: 'wss://relay.walletconnect.org',
          //   }
          // }}
          >
          {children}
        </ChainProvider>
        </QueryProvider>
      </ThemeProvider>
    </>
  );
}

export default ClientProviders;

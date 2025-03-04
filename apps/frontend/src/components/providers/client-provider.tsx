"use client";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-providers";

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
          <WalletChainProvider>
            <ContractProvider>{children}</ContractProvider>
          </WalletChainProvider>
        </QueryProvider>
      </ThemeProvider>
    </>
  );
}

export default ClientProviders;

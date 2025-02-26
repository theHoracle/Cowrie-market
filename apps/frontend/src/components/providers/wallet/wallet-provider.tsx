import "@interchain-ui/react/styles";

import { SignerOptions } from "cosmos-kit";
import { ChainProvider } from "@cosmos-kit/react";
import { assets, chains } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";

function WalletChainProvider({ children }: { children: React.ReactNode }) {
  const signerOptions: SignerOptions = {
    // signingStargate: () => {
    //   return getSigningCosmosClientOptions();
    // }
  };

  return (
    <ChainProvider
      chains={chains}
      assetLists={assets}
      wallets={wallets}
      walletConnectOptions={{
        signClient: {
          projectId: "a8510432ebb71e6948cfd6cde54b70f7",
          relayUrl: "wss://relay.walletconnect.org",
          metadata: {
            name: "Cowrie markeplace",
            description: "Cosmos powered marketplace",
            url: "https://docs.hyperweb.io/cosmos-kit/",
            icons: [],
          },
        },
      }}
      // @ts-ignore
      signerOptions={signerOptions}
    >
      {children}
    </ChainProvider>
  );
}

export default WalletChainProvider;

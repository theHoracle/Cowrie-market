import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { contracts } from "@thehoracle/cowrie-marketplace-types";
import { GasPrice } from "@cosmjs/stargate";

export const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS ||
  "neutron14y82yr0a670zdk9cx67yq4xu2qxcacc80jcutafevlfhwmghq3hqck32yj";

export const RPC_ENDPOINT =
  process.env.CONTRACT_RPC_ENDPOINT ||
  "https://rpc-palvus.pion-1.ntrn.tech:443";

const MNEMONIC =
  process.env.MNEMONIC ||
  "enough media top pupil cave field one print alcohol blanket relief forget";

if (!CONTRACT_ADDRESS) {
  throw new Error("CONTRACT ADDRESS NOT SET");
}

if (!MNEMONIC) {
  throw new Error("MNEMONIC NOT SET");
}

export const MarketplaceContract = contracts.CowrieMarketplace;

const getSigningClient = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "neutron",
  });
  return SigningCosmWasmClient.connectWithSigner(
    RPC_ENDPOINT,
    // @ts-ignore
    wallet,
    { gasPrice: GasPrice.fromString("0.025untrn") },
  );
};

// Initialize clients
export const initializeQueryClient = async () => {
  const signingClient = await getSigningClient();

  const queryClient = new MarketplaceContract.CowrieMarketplaceQueryClient(
    signingClient,
    CONTRACT_ADDRESS,
  );

  return {
    queryClient,
  };
};

export const initializeExecutionClient = async (sender: string) => {
  const signingClient = await getSigningClient();
  const executionClient = new MarketplaceContract.CowrieMarketplaceClient(
    signingClient,
    sender,
    CONTRACT_ADDRESS,
  );

  return {
    executionClient,
  };
};

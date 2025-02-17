import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { contracts } from "@thehoracle/cowrie-marketplace-types";
import { GasPrice } from "@cosmjs/stargate";

export const contractAddress = process.env.CONTRACT_ADDRESS || "neutron14y82yr0a670zdk9cx67yq4xu2qxcacc80jcutafevlfhwmghq3hqck32yj";

const rpcEndpoint = process.env.CONTRACT_RPC_ENDPOINT || "https://rpc-palvus.pion-1.ntrn.tech:443";
const mnemonic = process.env.MNEMONIC || "enough media top pupil cave field one print alcohol blanket relief forget";

if (!contractAddress) {
    throw new Error("CONTRACT ADDRESS NOT SET");
}

if (!mnemonic) {
    throw new Error("MNEMONIC NOT SET");
}

export const contract = contracts.CowrieMarketplace

const cosmwasmClient = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
  // @ts-expect-error
  const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet, { gasPrice: GasPrice.fromString("0.025ucosm") });
  return client;
}

export const client = new contracts.CowrieMarketplace.CowrieMarketplaceQueryClient((await cosmwasmClient()), contractAddress);
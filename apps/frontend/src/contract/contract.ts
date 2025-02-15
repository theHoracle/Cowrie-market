import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const rpcEndpoint =
  process.env.CONTRACT_RPC_ENDPOINT || "http://localhost:25667";
const contractAddress = process.env.CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("CONTRACT ADDRESS NOT SET");
}

// Connect to the nod
const client = await SigningCosmWasmClient.connect(rpcEndpoint);

const queryClient = async (queryMsg) => {
  return client.queryContractSmart(contractAddress, JSON.parse(queryMsg));
};

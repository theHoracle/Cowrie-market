import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { readFileSync, writeFileSync } from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const rpcEndpoint = "https://rpc-palvus.pion-1.ntrn.tech";
const mnemonic = process.env.MNEMONIC || "";
const wasmFilePath = "./artifacts/cowrie_marketplace.wasm";

async function main() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "neutron",
  });

  const [account] = await wallet.getAccounts();

  const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    wallet,
    {
      gasPrice: GasPrice.fromString("0.024untrn"),
    },
  );

  const contractAddress = readFileSync("10789_deploy.txt").toString();

  const migrateMsg = {
    migrate: {},
  };
  const migrate = await client.execute(
    account.address,
    contractAddress,
    migrateMsg,
    "auto",
  );
}

main().catch(console.error);

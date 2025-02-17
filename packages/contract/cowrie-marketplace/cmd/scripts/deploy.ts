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

  const wasmCode = readFileSync(wasmFilePath);
  const uploadReciept = await client.upload(account.address, wasmCode, "auto");

  const codeId = uploadReciept.codeId;

  const initMsg = {
    commission_rate: 300,
  };
  const instantiateReciept = await client.instantiate(
    account.address,
    codeId,
    initMsg,
    "Cowrie Marketplace",
    "auto",
  );
  const contractAddress = instantiateReciept.contractAddress;
  // only return code that will create a new file with the codeId+deploy as name in the root and write the CA into itimport { writeFileSync } from "fs";
  const deployInfo = `${codeId}_deploy.txt`;
  writeFileSync(deployInfo, contractAddress);

  console.log("--------------------------------------------------------");
  console.log(":: Code Id :: ------ :: Contract Address :: ------------");
  console.log("--------------------------------------------------------");

  console.log("--------------------------------------------------------");
  console.log(`:: ${codeId} :: ------ ${contractAddress} `);
  console.log("--------------------------------------------------------");
}

main().catch(console.error);

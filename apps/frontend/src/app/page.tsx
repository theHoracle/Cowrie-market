import { client } from "@/contract/contract";
import Image from "next/image";

export default async function Home() {
  const bal = await client.getBalance(
    "wasm1tnwkf33txhugatkz77u0l7w0c5rjfd2tx42y0t",
    "uatom",
  );
  return <div>Balance is: {bal.amount}</div>;
}

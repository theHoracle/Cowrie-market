"use client";

import { useState } from "react";

import { Wallet } from "./wallet/Wallet";
import { CHAIN_NAME } from "@/config/defaults";

export const ConnectWallet = () => {
  const [chainName, setChainName] = useState(CHAIN_NAME);

  function onChainChange(chainName?: string) {
    if (chainName) {
      setChainName(chainName);
    }
  }
  return <Wallet chainName={chainName} onChainChange={onChainChange} />;
};

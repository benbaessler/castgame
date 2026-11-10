import { createConfig } from "@ponder/core";
import { http } from "viem";

import { gameAbi } from "@castgame/shared/abis";
import { gameAddress } from "@castgame/shared/constants";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_84532),
    },
  },
  contracts: {
    Game: {
      abi: gameAbi,
      address: gameAddress,
      network: "baseSepolia",
      startBlock: 14372488,
    },
  },
});

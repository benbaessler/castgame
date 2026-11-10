import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { gameAbi } from "@castgame/shared/abis";
import { gameAddress } from "@castgame/shared/constants";

const useMainnet = process.env.USE_MAINNET === "true";

const chain = useMainnet ? base : baseSepolia;

export const client = createPublicClient({
	chain,
	transport: http(),
});

export const getFeeAmount = async (amount: bigint) => {
	const feePercent = await client.readContract({
		address: gameAddress,
		abi: gameAbi,
		functionName: "feePercent",
	});

	return (amount * feePercent) / BigInt(100);
};

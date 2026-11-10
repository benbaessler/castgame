import { base, baseSepolia } from "viem/chains";

export const useMainnet = process.env.USE_MAINNET === "true";
export const chain = useMainnet ? base : baseSepolia;
export const chainId = useMainnet ? "eip155:8453" : "eip155:84532";
export const blockExplorer = useMainnet
	? "https://basescan.org"
	: "https://sepolia.basescan.org";

export const tokenSymbol = "ETH";

// GraphQL endpoint of the indexer (apps/api)
export const apiEndpoint = process.env.API_URL!;

export const ipfsGateway = "https://ipfs.io/ipfs";
export const assetsIpfsHash = "QmP1ogNrTciYXRGANBwuHhsJeRS68ePK8erKN2TqYYafcC";
export const logoIpfsHash = "QmPyhMaHL5w3teHNuSMADXFiUFC4FPurXcquyNUnMnAz57";

export const getSCVQuery = (castHash: string) => `{
    FarcasterCasts(
      input: {filter: {hash: {_eq: "${castHash}"}}, blockchain: ALL}
    ) {
      Cast {
        castValue {
					formattedValue
				}
      }
    }
  }`;

export function formatNumber(number: number): string {
	if (number >= 1000000) {
		return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
	} else if (number >= 1000) {
		return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	} else {
		return number.toString();
	}
}

export function timeUntil(futureDate: Date): string {
	const now = new Date();
	const diffMs = futureDate.getTime() - now.getTime();

	if (diffMs <= 0) {
		return "Trading time has ended";
	}

	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	if (diffHours >= 1) {
		return `Trading ends in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
	} else {
		return `Trading ends in ${diffMinutes} minute${
			diffMinutes !== 1 ? "s" : ""
		}`;
	}
}

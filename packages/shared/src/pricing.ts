import { parseEther } from "viem";

// Bonding curve parameters per tier, in ETH.
// price(supply) = basePrice + scaleFactor * supply ^ curveExponent
export const priceTiers = [
	{
		basePrice: 0.0001, // $0.25
		curveExponent: 1.2,
		scaleFactor: 0.00015,
	},
	{
		basePrice: 0.0002, // $0.50
		curveExponent: 1.25,
		scaleFactor: 0.00015,
	},
	{
		basePrice: 0.0004, // $1
		curveExponent: 1.3,
		scaleFactor: 0.00015,
	},
	{
		basePrice: 0.0006, // $1.50
		curveExponent: 1.3,
		scaleFactor: 0.0002,
	},
	{
		basePrice: 0.0008, // $2
		curveExponent: 1.35,
		scaleFactor: 0.0002,
	},
];

/** Share of the curve price a seller receives; the rest stays in the reward pool. */
const SELL_PAYOUT_PERCENT = 80n;

interface CastAuthor {
	follower_count: number;
	power_badge?: boolean;
}

/**
 * The price tier of a cast is derived from its author's reach: more followers
 * means a steeper curve. Authors without a power badge drop one tier.
 */
export const getActiveTier = (author: CastAuthor): number => {
	let tier;
	if (author.follower_count < 400) {
		tier = 0;
	} else if (author.follower_count > 400 && author.follower_count < 1000) {
		tier = 1;
	} else if (author.follower_count > 1000 && author.follower_count < 10000) {
		tier = 2;
	} else if (author.follower_count > 10000 && author.follower_count < 50000) {
		tier = 3;
	} else {
		tier = 4;
	}

	if (!author.power_badge && tier > 0) tier--;
	return tier;
};

/** Price in wei of the next ticket at the given supply. */
export function getPrice(tier: bigint, supply: bigint): bigint {
	const { basePrice, curveExponent, scaleFactor } = priceTiers[Number(tier)]!;
	return parseEther(
		(
			basePrice +
			scaleFactor * Math.pow(Number(supply), curveExponent)
		).toString()
	);
}

/** Total price in wei for buying `amount` tickets starting at `supply`. */
export function getBuyPrice(
	tier: bigint,
	supply: bigint,
	amount: bigint
): bigint {
	let totalPrice = 0n;
	for (let i = 0; i < Number(amount); i++) {
		totalPrice += getPrice(tier, supply + BigInt(i));
	}
	return totalPrice;
}

/** Total payout in wei for selling `amount` tickets starting at `supply`. */
export function getSellPrice(
	tier: bigint,
	supply: bigint,
	amount: bigint
): bigint {
	let totalPrice = 0n;
	if (supply === 0n)
		return parseEther((priceTiers[Number(tier)]!.basePrice * 0.8).toString());

	for (let i = 0; i < amount; i++) {
		if (supply < BigInt(i) + 1n) break;
		totalPrice += getPrice(tier, supply - BigInt(i) - 1n);
	}
	return (totalPrice * SELL_PAYOUT_PERCENT) / 100n;
}

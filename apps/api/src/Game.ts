import { ponder } from "@/generated";
import { getFeeAmount } from "./viem";
import { neynar } from "./api";
import { getActiveTier, getPrice, getSellPrice } from "@castgame/shared/pricing";
import { zeroAddress } from "viem";
require("dotenv").config();

ponder.on("Game:GameStarted", async ({ event, context }) => {
	const { GameStats } = context.db;

	await GameStats.create({
		id: 0n,
		data: {
			users: [],
		},
	});
});

ponder.on("Game:Purchased", async ({ event, context }) => {
	const { Transaction, Ticket, User, GameStats } = context.db;

	const { cast } = await neynar.lookUpCastByHashOrWarpcastUrl(
		event.args.castHash,
		"hash"
	);

	const feeAmount = await getFeeAmount(event.args.price);
	const activeTier = BigInt(getActiveTier(cast.author));

	let reqs = [
		GameStats.findUnique({ id: 0n }) as any,
		// Update ticket supply
		Ticket.upsert({
			id: event.args.castHash,
			create: {
				supply: event.args.amount,
				holders: [event.args.senderFid],
				activeTier,
				buyPrice: getPrice(activeTier, event.args.amount),
				sellPrice: getSellPrice(activeTier, event.args.amount, 1n),
				castCreated: cast.timestamp,
			},
			update: ({ current }) => ({
				supply: current.supply + event.args.amount,
				holders: current.holders.includes(event.args.senderFid)
					? current.holders
					: [...current.holders, event.args.senderFid],
				buyPrice: getPrice(
					current.activeTier,
					current.supply + event.args.amount
				),
				sellPrice: getSellPrice(
					current.activeTier,
					current.supply + event.args.amount,
					1n
				),
			}),
		}),
		// Log transaction
		Transaction.create({
			id: event.log.id,
			data: {
				castHash: event.args.castHash,
				type: "buy",
				senderFid: event.args.senderFid,
				senderAddress: event.args.buyer,
				price: event.args.price,
				amount: event.args.amount,
				timestamp: BigInt(new Date().getTime()),
			},
		}),
	];
	if (event.args.buyer === event.args.castCreator) {
		reqs.push([
			User.upsert({
				id: `${event.args.buyer.toLowerCase()}:${event.args.castHash}`,
				create: {
					ticketBalance: event.args.amount,
					referralFeesEarned: 0n,
					creatorFeesEarned: feeAmount,
				},
				update: ({ current }) => ({
					ticketBalance: current.ticketBalance + event.args.amount,
					creatorFeesEarned: current.creatorFeesEarned + feeAmount,
				}),
			}),
		]);
	} else {
		reqs.push([
			// Track buyer balance
			User.upsert({
				id: `${event.args.buyer.toLowerCase()}:${event.args.castHash}`,
				create: {
					ticketBalance: event.args.amount,
					referralFeesEarned: 0n,
					creatorFeesEarned: 0n,
				},
				update: ({ current }) => ({
					ticketBalance: current.ticketBalance + event.args.amount,
				}),
			}),
			// Track creator fees
			User.upsert({
				id: `${event.args.castCreator.toLowerCase()}:${event.args.castHash}`,
				create: {
					ticketBalance: 0n,
					referralFeesEarned: 0n,
					creatorFeesEarned: feeAmount,
				},
				update: ({ current }) => ({
					creatorFeesEarned: current.creatorFeesEarned + feeAmount,
				}),
			}),
		]);
	}
	if (event.args.referrer !== zeroAddress) {
		reqs.push(
			// Track referral fees
			User.upsert({
				id: `${event.args.referrer.toLowerCase()}:${event.args.castHash}`,
				create: {
					ticketBalance: 0n,
					referralFeesEarned: feeAmount,
					creatorFeesEarned: 0n,
				},
				update: ({ current }) => ({
					referralFeesEarned: current.referralFeesEarned + feeAmount,
				}),
			})
		);
	}


	// update game stats (users)
	const [gameStats] = await Promise.all(reqs);

	if (!gameStats.users.includes(event.args.buyer)) {
		await GameStats.update({
			id: 0n,
			data: ({ current }) => ({
				users: [...current.users, event.args.buyer],
			}),
		});
	}
	if (!gameStats.users.includes(event.args.castCreator)) {
		await GameStats.update({
			id: 0n,
			data: ({ current }) => ({
				users: [...current.users, event.args.castCreator],
			}),
		});
	}
	if (
		event.args.referrer !== zeroAddress &&
		!gameStats.users.includes(event.args.referrer)
	) {
		await GameStats.update({
			id: 0n,
			data: ({ current }) => ({
				users: [...current.users, event.args.referrer],
			}),
		});
	}
});

ponder.on("Game:Sold", async ({ event, context }) => {
	const { User, Ticket, Transaction } = context.db;

	const [feeAmount, user] = await Promise.all([
		getFeeAmount(event.args.price),
		await User.findUnique({
			id: `${event.args.seller.toLowerCase()}:${event.args.castHash}`,
		}),
	]);

	let reqs = [
		// Update ticket supply + holders
		Ticket.update({
			id: event.args.castHash,
			data: ({ current }) => ({
				supply: current.supply - event.args.amount,
				buyPrice: getPrice(
					current.activeTier,
					current.supply - event.args.amount
				),
				sellPrice: getSellPrice(
					current.activeTier,
					current.supply - event.args.amount,
					1n
				),
				holders:
					user?.ticketBalance! > event.args.amount
						? current.holders
						: current.holders.filter(
								(holder) => holder !== event.args.senderFid
						  ),
			}),
		}),
		// Decrease seller balance
		User.update({
			id: `${event.args.seller.toLowerCase()}:${event.args.castHash}`,
			data: ({ current }) => ({
				ticketBalance: current.ticketBalance - event.args.amount,
			}),
		}),
		// Track creator fees
		User.upsert({
			id: `${event.args.castCreator.toLowerCase()}:${event.args.castHash}`,
			create: {
				ticketBalance: 0n,
				referralFeesEarned: 0n,
				creatorFeesEarned: feeAmount,
			},
			update: ({ current }) => ({
				creatorFeesEarned: current.creatorFeesEarned + feeAmount,
			}),
		}),
		// Log transaction
		Transaction.create({
			id: event.log.id,
			data: {
				castHash: event.args.castHash,
				type: "sell",
				senderFid: event.args.senderFid,
				senderAddress: event.args.seller,
				price: event.args.price,
				amount: event.args.amount,
				timestamp: BigInt(new Date().getTime()),
			},
		}),
	];

	if (event.args.referrer !== zeroAddress) {
		reqs.push(
			// Track referral fees
			User.upsert({
				id: `${event.args.referrer.toLowerCase()}:${event.args.castHash}`,
				create: {
					ticketBalance: 0n,
					referralFeesEarned: feeAmount,
					creatorFeesEarned: 0n,
				},
				update: ({ current }) => ({
					referralFeesEarned: current.referralFeesEarned + feeAmount,
				}),
			})
		);
	}

	await Promise.all(reqs);
});

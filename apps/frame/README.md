# apps/frame

The trading interface: a [Frog](https://frog.fm) app serving a Farcaster cast
action and the frames it opens.

| Route | Purpose |
| --- | --- |
| `/api/action` | Cast action; opens the ticket frame for the cast it was triggered on |
| `/api/ticket/:hash` | Ticket overview for a cast: score, price, supply, tickets owned |
| `/api/trade/:hash` | Buy/sell screen and transaction status |
| `/api/buy`, `/api/sell` | Transaction routes: compute the price, sign the quote, return calldata for `Game.buy` / `Game.sell` |
| `/api/details` | Round overview: reward pool, time left, player count |

The price quote is signed in [`lib/contract.ts`](lib/contract.ts) with
`PRIVATE_KEY`, which must be the owner of the Game contract.

```bash
cp .env.sample .env
bun run dev   # http://localhost:5173/api
```

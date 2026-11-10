# apps/api

The indexer, built with [Ponder](https://ponder.sh). It listens to the Game
contract's `GameStarted`, `Purchased` and `Sold` events and serves the result
as a GraphQL API that the frame, the web app and the scripts query.

| Table | Contents |
| --- | --- |
| `Ticket` | Per cast: supply, holders, price tier, current buy and sell price |
| `User` | Per `address:castHash`: ticket balance, creator and referral fees earned |
| `Transaction` | Every buy and sell |
| `GameStats` | Addresses that have taken part in the round |

Schema: [`ponder.schema.ts`](ponder.schema.ts). Handlers: [`src/Game.ts`](src/Game.ts).

```bash
cp .env.sample .env.local
bun run dev   # GraphQL at http://localhost:42069
```

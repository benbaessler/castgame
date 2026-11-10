# scripts

Operator scripts for running a round.

| Command | What it does |
| --- | --- |
| `bun run round:create` | Asks for the round's title, channel, contract address and timings, then replaces the `Round` row in Postgres ([`src/game.ts`](src/game.ts)) |
| `bun run payout:preview` | Ranks the round's casts by score and prints the `winners` and `amounts` arrays for `Game.payout` ([`src/distribute.ts`](src/distribute.ts)). It does not send a transaction |

```bash
cp .env.sample .env
```

# apps/web

The dashboard, a Next.js 14 app. It reads the current round from Postgres, game
state from the indexer (`apps/api`) and cast data from Neynar and Airstack.

| Page | Purpose |
| --- | --- |
| `/` | Round overview and the casts being traded, sortable by score, price or age |
| `/activity` | Feed of recent buys and sells |
| `/tickets` | Tickets held by the signed-in player (Privy login) |

Routes under `app/api` proxy Neynar and Airstack so their API keys stay on the
server.

```bash
cp .env.sample .env
bun run dev   # http://localhost:3000
```

# packages/shared

Code used by more than one package. Imported as `@castgame/shared/<module>`.

| Module | Contents |
| --- | --- |
| `abis` | ABI of the Game contract |
| `constants` | Address of the deployed Game contract |
| `pricing` | Price tiers, tier selection and the bonding curve (`getPrice`, `getBuyPrice`, `getSellPrice`) |
| `indexer` | GraphQL helper for the indexer and cast score formatting |

[`prisma/schema.prisma`](prisma/schema.prisma) defines the `Round` table.
Generate the client with `bun run db:generate` from the repo root.

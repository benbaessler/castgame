# contracts

Foundry project with the on-chain part of the game.

- [`src/Game.sol`](src/Game.sol): buying and selling tickets against
  owner-signed price quotes, fee distribution, and the owner-only `payout` once
  a round is over. Ticket balances are plain mappings keyed by cast hash.
- [`src/Tickets.sol`](src/Tickets.sol): an ERC-1155 version of tickets from an
  earlier design. `Game` no longer uses it; it is kept with its tests for
  reference.

The contracts are unaudited. The deployment the apps point at is on the Base
Sepolia testnet.

```bash
git submodule update --init --recursive
cp .env.sample .env   # PRIVATE_KEY_DEV can be any throwaway key
forge build
forge test
```

Deploy with `forge script script/Game.s.sol --rpc-url <rpc> --broadcast`.

# Lidqx

Lidqx is a yield protocol where users deposit into a vault, receive a yield-bearing position, and split that position into principal and yield components for different strategy profiles.

## Why gPAS Uses Exchange-Rate Yield

- gPAS does not increase token count over time.
- Yield is reflected through exchange-rate appreciation.
- This keeps accounting predictable for split/recombine operations with PT and YT.

## What The Project Does

- Vault flow:
  - Deposit PAS
  - Mint gPAS (yield-bearing representation)
  - Grow value through exchange-rate mechanics

- Tokenization flow:
  - Split gPAS into PT and YT
  - Recombine PT + YT back to gPAS

- Market flow:
  - Trade PT, YT, and gPAS pool exposures
  - Build fixed-vs-variable yield positions based on user risk preference

- LP pools flow:
  - Provide liquidity to PT, YT, and gPAS pools
  - Earn fee-based LP exposure while managing pool inventory risk

- Runtime + interoperability flow:
  - Use precompile-aware paths for system/native asset operations
  - Support owner-gated XCM gateway actions for advanced cross-system operations

## Strategy Model

- PT is for principal-focused exposure with maturity-driven behavior.
- YT is for yield-focused exposure and upside/volatility in yield expectations.
- LP is for market-making exposure with fee capture and inventory risk tradeoff.
- Holding, trading, and recombining lets users move between conservative and aggressive yield views.

## Protocol Stages

1. Stage 1 - Vault Deposit: deposit PAS and mint gPAS.
2. Stage 2 - Yield Tokenisation: split gPAS into PT and YT.
3. Stage 3 - PT Strategy: take principal-oriented, maturity-aware positions.
4. Stage 4 - YT Strategy: take yield-oriented, expectation-driven positions.
5. Stage 5 - LP Pools: provide liquidity across PT, YT, and gPAS pools.
6. Stage 6 - Yield Trading: rotate PT and YT exposures as market conditions change.

## End-To-End User Flow

1. User deposits PAS and receives gPAS.
2. User chooses either:
  - hold gPAS for straightforward yield exposure, or
  - split into PT + YT for strategy control.
3. User can trade PT/YT in pools or recombine back to gPAS.
4. At maturity, positions settle according to PT principal rights and YT yield rights.

## Network

- Chain: Polkadot Hub Paseo (EVM)
- RPC: https://eth-rpc-testnet.polkadot.io/
- Explorer: https://blockscout-testnet.polkadot.io/

## Deployed Contracts In Use

Source of truth: contracts/paseo_deployments.json

- gPAS: 0x18376636a83EA29FA2130c40c783e31F7500bbA1
- Vault: 0xB11e5Cb9D8924a6153A9EdaCe85f117FE52b29c7
- Splitter: 0xcF697b7CdFA106722DA3d3F2049f652079D3328b
- PT: 0x175BFC27980DbfDd21BB1C51A138adf31703FC2D
- YT: 0xa181f1A912700992BB2B05540BC9e5A8e2BDf160
- SimplePool: 0x14b3A34851a0f9dbc6E61476AD2b34a8852b4bc3
- YTPool: 0x070d54c9d98cC94B3e35e07e4E01051784b78430
- gPASPool: 0x3653a452d3aCEF2698b49b1602704466d014611b
- ValidatorRewards: 0x8D6fFE419da91FD3AD829B07E86f73c0B796ec65

## Run The Project

```bash
# frontend
cd frontend
npm install
npm run dev

# contracts
cd ../contracts
npm install
npx hardhat compile
npm test
```

## Repository Structure

- frontend: React + Vite app for user flows, trading views, and protocol guide.
- contracts: Hardhat workspace with Solidity contracts, deployment scripts, and tests.
- contracts/paseo_deployments.json: deployed addresses used by frontend integrations.

## Current Scope

- This version focuses on core vault, split/recombine, and pool interactions.
- Admin-facing controls (for example reward and XCM operations) are intentionally gated.
- Deployed addresses may change between redeployments; always re-check `contracts/paseo_deployments.json` before testing.

## License

MIT


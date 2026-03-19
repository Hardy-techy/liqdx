import { useEffect, useMemo, useState } from "react";
import { useBalance, usePublicClient } from "wagmi";
import { parseAbiItem, formatEther } from "viem";
import { Container, Stats } from "@components";
import { VaultContract } from "@contracts";
import { useGPASTotalSupply, useVaultExchangeRate } from "@hooks/read";

interface PortfolioStatsProps {
  sttPriceUsd: number;
}

const DEPOSIT_RECEIPT_EVENT = parseAbiItem(
  "event DepositReceipt(bytes32 indexed receiptHash, address indexed user, uint256 amount)"
);

const PortfolioStats = ({ sttPriceUsd }: PortfolioStatsProps) => {
  const publicClient = usePublicClient();
  const { data: vaultBalance } = useBalance({
    address: VaultContract.address,
    query: {
      refetchInterval: 10_000,
      refetchOnWindowFocus: true,
    },
  });
  const { data: gpasTotalSupplyRaw } = useGPASTotalSupply();
  const { data: exchangeRateRaw } = useVaultExchangeRate();

  const [activeStakers, setActiveStakers] = useState(0);

  useEffect(() => {
    if (!publicClient) return;

    let cancelled = false;

    const fetchActiveStakers = async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        const configuredDeployBlock = Number(import.meta.env.VITE_VAULT_DEPLOY_BLOCK ?? 0);
        let fromBlock = configuredDeployBlock > 0
          ? BigInt(configuredDeployBlock)
          : latestBlock > 500_000n
            ? latestBlock - 500_000n
            : 0n;

        const chunkSize = 50_000n;
        const stakerSet = new Set<string>();

        while (fromBlock <= latestBlock) {
          const toBlock = fromBlock + chunkSize > latestBlock ? latestBlock : fromBlock + chunkSize;
          const logs = await publicClient.getLogs({
            address: VaultContract.address,
            event: DEPOSIT_RECEIPT_EVENT,
            fromBlock,
            toBlock,
          });

          for (const log of logs) {
            const user = log.args.user;
            if (user) stakerSet.add(user.toLowerCase());
          }

          fromBlock = toBlock + 1n;
        }

        if (!cancelled) {
          setActiveStakers(stakerSet.size);
        }
      } catch {
        if (!cancelled) {
          setActiveStakers(0);
        }
      }
    };

    fetchActiveStakers();
    const interval = window.setInterval(fetchActiveStakers, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [publicClient]);

  const exchangeRate = exchangeRateRaw ? Number(formatEther(exchangeRateRaw as bigint)) : 1;
  const vaultBalancePas = Number(vaultBalance?.formatted ?? 0);
  const gpasSupply = gpasTotalSupplyRaw ? Number(formatEther(gpasTotalSupplyRaw as bigint)) : 0;
  const projectedAprEnv = Number(import.meta.env.VITE_PROJECTED_APR ?? 5.5);
  const projectedApr = Number.isFinite(projectedAprEnv) ? projectedAprEnv : 5.5;

  const tvlUsd = vaultBalancePas * sttPriceUsd;
  const marketCapUsd = gpasSupply * exchangeRate * sttPriceUsd;
  const estimatedApr = useMemo(() => projectedApr, [projectedApr]);

  return (
    <Container className="relative" background="">
      <Stats
        tvl={tvlUsd}
        stakers={activeStakers}
        stSttMarketCap={marketCapUsd}
        estimatedApr={estimatedApr}
      />
    </Container>
  )
}

export default PortfolioStats
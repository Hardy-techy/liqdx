import { Container, PoolBox } from "@components";
import { usePoolInfo, useYTPoolInfo, useGPASPoolInfo } from "@hooks/read";
import { SimplePoolContract, YTPoolContract, gPASPoolContract } from "@contracts";

type PoolTuple = readonly [bigint, bigint, bigint, bigint] | undefined;

const parsePool = (raw: PoolTuple) => {
  const reservePAS = raw ? Number(raw[0]) / 1e18 : 0;
  const reserveToken = raw ? Number(raw[1]) / 1e18 : 0;
  const volume = raw ? Number(raw[3]) / 1e18 : 0;
  const totalLiq = reservePAS + reserveToken * (reservePAS / (reserveToken || 1));
  return { reservePAS, reserveToken, volume, totalLiq };
};

const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const Pools = () => {
  const { data: ptPoolRaw } = usePoolInfo();
  const { data: ytPoolRaw } = useYTPoolInfo();
  const { data: gPASPoolRaw } = useGPASPoolInfo();

  const ptPool = parsePool(ptPoolRaw as PoolTuple);
  const ytPool = parsePool(ytPoolRaw as PoolTuple);
  const gPool = parsePool(gPASPoolRaw as PoolTuple);

  const pools = [
    {
      tokenPair: "PT-gPAS / PAS",
      address: shortAddr(SimplePoolContract.address),
      liquidity: `${ptPool.totalLiq.toFixed(2)} PAS`,
      totalSwapVolume: `${ptPool.volume.toFixed(2)} PAS`,
      apy: "0.3% fee",
    },
    {
      tokenPair: "YT-gPAS / PAS",
      address: shortAddr(YTPoolContract.address),
      liquidity: `${ytPool.totalLiq.toFixed(2)} PAS`,
      totalSwapVolume: `${ytPool.volume.toFixed(2)} PAS`,
      apy: "0.3% fee",
    },
    {
      tokenPair: "gPAS / PAS",
      address: shortAddr(gPASPoolContract.address),
      liquidity: `${gPool.totalLiq.toFixed(2)} PAS`,
      totalSwapVolume: `${gPool.volume.toFixed(2)} PAS`,
      apy: "0.3% fee",
    },
  ];

  return (
    <Container className="relative" background="bg-[#0a0510]">
      <div className="relative"></div>

      <div className="flex-col gap-5 px-5 py-10 mt-10 lg:flex-row lg:items-center bg-[#120a1a] shadow-2xl border border-white/5 rounded-2xl">
        <p className="mb-5 text-sm text-white/60">
          Volume shown here is cumulative AMM swap volume. Stake/unstake (Vault mint/burn) is tracked in Portfolio, not Pools.
        </p>
        <div className="flex gap-10 flex-col lg:flex-row">
          <div className="flex-1 flex justify-center relative overflow-hidden">
            <div className="w-full mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {pools.map((pool, i) => (
                  <PoolBox
                    key={i}
                    tokenPair={pool.tokenPair}
                    address={pool.address}
                    liquidity={pool.liquidity}
                    totalSwapVolume={pool.totalSwapVolume}
                    apy={pool.apy}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Pools;

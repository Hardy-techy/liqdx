import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
  usePTBalance, useYTBalance,
  useSplitterMaturity, useSplitterExchangeRate, useSplitterStartRate,
  usePoolLPBalance, usePoolInfo, useYTPoolInfo, useGPASPoolInfo,
} from "@hooks/read";
import { useReadContract } from "wagmi";
import { YTPoolContract, gPASPoolContract } from "@contracts";

const Position = () => {
  const [activeTab, setActiveTab] = useState<"lp" | "pt" | "yt">("lp");
  const { address: walletAddress } = useAccount();

  // PT/YT on-chain data
  const { data: ptBalanceRaw } = usePTBalance(walletAddress);
  const { data: ytBalanceRaw } = useYTBalance(walletAddress);
  const { data: maturityRaw } = useSplitterMaturity();
  const { data: exchangeRateRaw } = useSplitterExchangeRate();
  const { data: startRateRaw } = useSplitterStartRate();

  // LP balances for all 3 pools
  const { data: ptLPRaw } = usePoolLPBalance(walletAddress);
  const { data: ytLPRaw } = useReadContract({
    ...YTPoolContract, functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  });
  const { data: gPASLPRaw } = useReadContract({
    ...gPASPoolContract, functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  });

  // Pool reserves for share calculation
  type PoolTuple = readonly [bigint, bigint, bigint, bigint] | undefined;
  const { data: ptPoolRaw } = usePoolInfo();
  const { data: ytPoolRaw } = useYTPoolInfo();
  const { data: gPoolRaw } = useGPASPoolInfo();

  // Parse PT/YT values
  const ptBalance = ptBalanceRaw ? Number(ptBalanceRaw) / 1e18 : 0;
  const ytBalance = ytBalanceRaw ? Number(ytBalanceRaw) / 1e18 : 0;
  const maturityTs = maturityRaw ? Number(maturityRaw) : 0;
  const exchangeRate = exchangeRateRaw ? Number(exchangeRateRaw) / 1e18 : 1;
  const startRate = startRateRaw ? Number(startRateRaw) / 1e18 : 1;

  // Parse LP balances
  const ptLP = ptLPRaw ? Number(ptLPRaw) / 1e18 : 0;
  const ytLP = ytLPRaw ? Number(ytLPRaw as bigint) / 1e18 : 0;
  const gPASLP = gPASLPRaw ? Number(gPASLPRaw as bigint) / 1e18 : 0;

  // Pool total supplies for share calc
  const ptPoolInfo = ptPoolRaw as PoolTuple;
  const ytPoolInfo = ytPoolRaw as PoolTuple;
  const gPoolInfo = gPoolRaw as PoolTuple;

  const ptPoolLP = ptPoolInfo ? Number(ptPoolInfo[2]) / 1e18 : 1;
  const ytPoolLP = ytPoolInfo ? Number(ytPoolInfo[2]) / 1e18 : 1;
  const gPoolLP = gPoolInfo ? Number(gPoolInfo[2]) / 1e18 : 1;

  // Derived
  const maturityDate = maturityTs > 0
    ? new Date(maturityTs * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";
  const isMatured = maturityTs > 0 && Date.now() / 1000 > maturityTs;
  const yieldPerYT = exchangeRate - startRate;
  const totalYTYield = ytBalance * yieldPerYT;
  const ptValue = ptBalance * exchangeRate;

  const hasAnyLP = ptLP > 0 || ytLP > 0 || gPASLP > 0;

  const tabs: { key: "lp" | "pt" | "yt"; label: string }[] = [
    { key: "lp", label: "LP Positions" },
    { key: "pt", label: "PT Positions" },
    { key: "yt", label: "YT Positions" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-3 flex flex-col font-saira gap-6 p-8 rounded-2xl bg-[#120a1a]/90 backdrop-blur-md border border-white/5 shadow-2xl"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your Positions</h2>
        <p className="text-[#94A3B8] text-sm">
          View your LP, Principal Token & Yield Token positions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0d0714] rounded-xl border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white/10 text-white shadow-sm border border-white/10"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LP Content */}
      {activeTab === "lp" && (
        <div className="flex flex-col gap-4">
          {hasAnyLP ? (
            <>
              {ptLP > 0 && ptPoolInfo && (
                <LPCard
                  name="PT-gPAS / PAS"
                  balance={ptLP}
                  share={(ptLP / ptPoolLP) * 100}
                  underlyingPAS={(Number(ptPoolInfo[0]) / 1e18) * (ptLP / ptPoolLP)}
                  underlyingToken={(Number(ptPoolInfo[1]) / 1e18) * (ptLP / ptPoolLP)}
                  tokenSymbol="PT-gPAS"
                />
              )}
              {ytLP > 0 && ytPoolInfo && (
                <LPCard
                  name="YT-gPAS / PAS"
                  balance={ytLP}
                  share={(ytLP / ytPoolLP) * 100}
                  underlyingPAS={(Number(ytPoolInfo[0]) / 1e18) * (ytLP / ytPoolLP)}
                  underlyingToken={(Number(ytPoolInfo[1]) / 1e18) * (ytLP / ytPoolLP)}
                  tokenSymbol="YT-gPAS"
                />
              )}
              {gPASLP > 0 && gPoolInfo && (
                <LPCard
                  name="gPAS / PAS"
                  balance={gPASLP}
                  share={(gPASLP / gPoolLP) * 100}
                  underlyingPAS={(Number(gPoolInfo[0]) / 1e18) * (gPASLP / gPoolLP)}
                  underlyingToken={(Number(gPoolInfo[1]) / 1e18) * (gPASLP / gPoolLP)}
                  tokenSymbol="gPAS"
                />
              )}
            </>
          ) : (
            <EmptyState text="No LP positions. Add liquidity to a pool to earn swap fees." />
          )}
        </div>
      )}

      {/* PT Content */}
      {activeTab === "pt" && (
        <div className="flex flex-col gap-4">
          {ptBalance > 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0d0714] p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">PT-gPAS</h3>
              <div className="space-y-3">
                <Row label="Balance" value={`${ptBalance.toLocaleString()} PT`} />
                <Row label="PAS Equivalent" value={`~${ptValue.toLocaleString()} PAS`} />
                <Row label="Maturity" value={maturityDate} />
                <Row label="Status" value={isMatured ? "Matured ✅" : "Active"} highlight={isMatured ? "green" : "purple"} />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  disabled={!isMatured}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isMatured
                      ? "bg-gradient-to-r from-[#9333ea] to-[#7e22ce] text-white hover:shadow-purple-500/30"
                      : "bg-[#1e142b] text-white/30 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {isMatured ? "Redeem PAS" : "Not Yet Matured"}
                </button>
              </div>
            </div>
          ) : (
            <EmptyState text="No PT positions. Split gPAS to get PT tokens." />
          )}
        </div>
      )}

      {/* YT Content */}
      {activeTab === "yt" && (
        <div className="flex flex-col gap-4">
          {ytBalance > 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0d0714] p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">YT-gPAS</h3>
              <div className="space-y-3">
                <Row label="Balance" value={`${ytBalance.toLocaleString()} YT`} />
                <Row label="Yield Accrued" value={`${totalYTYield.toLocaleString()} PAS`} highlight={totalYTYield > 0 ? "green" : undefined} />
                <Row label="Exchange Rate" value={`${exchangeRate.toFixed(4)} PAS/gPAS`} />
                <Row label="Maturity" value={maturityDate} />
                <Row label="Claim Status" value={isMatured ? "Matured - claim enabled" : "Claim available at maturity"} highlight={isMatured ? "green" : "purple"} />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  disabled={!isMatured || totalYTYield <= 0}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isMatured && totalYTYield > 0
                      ? "bg-gradient-to-r from-[#9333ea] to-[#7e22ce] text-white hover:shadow-purple-500/30"
                      : "bg-[#1e142b] text-white/30 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {!isMatured ? "Claim At Maturity" : totalYTYield > 0 ? "Claim Yield" : "No Yield Yet"}
                </button>
              </div>
            </div>
          ) : (
            <EmptyState text="No YT positions. Split gPAS to get YT tokens." />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Position;

// -- Sub-components --

interface LPCardProps {
  name: string;
  balance: number;
  share: number;
  underlyingPAS: number;
  underlyingToken: number;
  tokenSymbol: string;
}

const LPCard = ({ name, balance, share, underlyingPAS, underlyingToken, tokenSymbol }: LPCardProps) => (
  <div className="rounded-2xl border border-white/5 bg-[#0d0714] p-6 flex flex-col gap-4 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="flex justify-between items-start relative z-10">
      <h3 className="text-lg font-bold text-white tracking-wide">{name}</h3>
    </div>
    <div className="space-y-3 relative z-10">
      <Row label="LP Tokens" value={`${balance.toFixed(4)} LP`} />
      <Row label="Pool Share" value={`${share.toFixed(2)}%`} highlight="purple" />
      <div className="border border-white/5 bg-white/5 rounded-xl p-3 mt-2 flex justify-between items-center">
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Underlying Assets</span>
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-emerald-400">{underlyingPAS.toFixed(2)} PAS</span>
          <span className="text-sm font-medium text-white">{underlyingToken.toFixed(2)} {tokenSymbol}</span>
        </div>
      </div>
    </div>
    <div className="flex gap-3 mt-2 relative z-10">
      <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#9333ea] to-[#7e22ce] text-white hover:shadow-purple-500/30 transition-all cursor-not-allowed opacity-50">
        Remove Liquidity (Coming Soon)
      </button>
    </div>
  </div>
);

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "purple" }) => (
  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
    <span className="text-[#64748B]">{label}</span>
    <span className={`font-medium ${
      highlight === "green" ? "text-emerald-400" :
      highlight === "purple" ? "text-[#a855f7]" :
      "text-[#E2E8F0]"
    }`}>
      {value}
    </span>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d0714]/50 p-10 flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-2xl">∅</div>
    <p className="text-[#64748B] text-sm text-center">{text}</p>
  </div>
);

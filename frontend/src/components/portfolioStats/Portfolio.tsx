import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { usePASBalance, useStSttBalance, useVaultExchangeRate, useVaultRuntimeScore, useValidatorOwner } from "@hooks/read";
import { useDeposit, useWithdraw, useDistributeRewards } from "@hooks/write";

interface PortfolioProps {
  sttPriceUsd: number;
}

const Portfolio = ({ sttPriceUsd }: PortfolioProps) => {
  // Wallet address
  const { address: walletAddress } = useAccount();
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  // Check if current user is Validator Admin
  const { data: adminAddress } = useValidatorOwner();
  const isAdmin = walletAddress?.toLowerCase() === (adminAddress as string)?.toLowerCase();

  // PAS, gPAS balances & Exchange rate
  const { data: sttBalanceData, refetch: refetchSttBalance } = usePASBalance(walletAddress);
  const { data: stSttBalanceRaw, refetch: refetchStSttBalance } = useStSttBalance(walletAddress);
  const { data: exchangeRateRaw, refetch: refetchExchangeRate } = useVaultExchangeRate();
  const { data: runtimeScoreRaw, refetch: refetchRuntimeScore } = useVaultRuntimeScore(walletAddress);

  const { distributeRewards, isPending: isDistributingRewards, isSuccess: distributedRewardsSuccess } = useDistributeRewards();

  // Hooks to detect deposit/withdraw success
  const { isSuccess: isDepositSuccess } = useDeposit();
  const { isSuccess: isWithdrawSuccess } = useWithdraw();

  // Refetch balances when tx succeeds
  useEffect(() => {
    if (isDepositSuccess || isWithdrawSuccess) {
      refetchSttBalance();
      refetchStSttBalance();
      refetchExchangeRate();
      refetchRuntimeScore();
    }
  }, [
    isDepositSuccess,
    isWithdrawSuccess,
    refetchSttBalance,
    refetchStSttBalance,
    refetchExchangeRate,
    refetchRuntimeScore,
  ]);

  // Refetch data when distributing rewards succeeds
  useEffect(() => {
    if (distributedRewardsSuccess) {
      refetchExchangeRate();
    }
  }, [distributedRewardsSuccess, refetchExchangeRate]);

  // Parse values
  const sttBalance = Number(sttBalanceData?.formatted ?? 0);
  const stSttBalance = stSttBalanceRaw ? Number(stSttBalanceRaw) / 1e18 : 0;
  const exchangeRate = exchangeRateRaw ? Number(exchangeRateRaw) / 1e18 : 1;
  const runtimeScore = runtimeScoreRaw ? Number(runtimeScoreRaw) : 0;

  // Derived values
  const stSttEquivalent = stSttBalance * exchangeRate;
  const totalAssetsStt = sttBalance + stSttEquivalent;
  const totalAssetsUsd = totalAssetsStt * sttPriceUsd;
  const yieldAccrued = stSttEquivalent - stSttBalance;
  const apyPercent = (exchangeRate - 1) * 100;

  const handleDistributeRewards = async () => {
    try {
      if (!walletAddress) return;
      await distributeRewards();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payout failed";
      toast.error(message);
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-3 flex flex-col gap-6 p-8 rounded-3xl bg-[#120a1a]/90 backdrop-blur-md border border-white/5 shadow-2xl font-saira"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Your Portfolio</h2>
          <p className="text-[#94A3B8] text-sm">Overview of your Liquid Staking assets</p>
        </div>
        <div className="bg-[#0d0714] px-4 py-2 border border-white/5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
          <span className="text-sm font-medium text-white/80">{shortAddress}</span>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1a1528] to-[#0d0714] border border-white/5 flex flex-col justify-center">
        <span className="text-[#64748B] text-sm font-medium mb-1 tracking-wide">Total Balance</span>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            {totalAssetsStt.toLocaleString()} PAS
          </span>
          <span className="text-xl text-[#94A3B8] font-medium mb-1">
            ≈ ${(totalAssetsUsd).toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-[#8e86ab] mt-3 uppercase tracking-wider">
          Runtime Score: {runtimeScore > 0 ? runtimeScore.toLocaleString() : "Not available"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-[#0d0714] border border-white/5">
          <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2 block">Available PAS</span>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-white">
              {sttBalance.toLocaleString()} <span className="text-sm text-white/50">PAS</span>
            </span>
            <span className="text-[#94A3B8] text-sm mt-1">≈ ${(sttBalance * sttPriceUsd).toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d0714] border border-[#a855f7]/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]">
          <span className="text-[#a855f7] text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-2">
            Liquid Staked
            <span className="bg-[#a855f7]/20 text-[#a855f7] text-[10px] px-2 py-0.5 rounded-full">Earning Yield</span>
          </span>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-white">
              {stSttBalance.toLocaleString()} <span className="text-sm text-white/50">gPAS</span>
            </span>
            <span className="text-[#94A3B8] text-sm mt-1">≈ {(stSttEquivalent).toFixed(2)} PAS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0c0a18] to-[#1a1528] border border-purple-500/20 shadow-inner overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-400"></div>
          <div className="flex flex-col relative z-10 mb-4">
            <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">Vault APY</span>
            <span className="text-3xl font-light text-white">
              {apyPercent.toFixed(2)}<span className="text-lg text-purple-400 font-bold">%</span>
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={handleDistributeRewards}
              disabled={isDistributingRewards || !walletAddress}
              className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold tracking-wider transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDistributingRewards ? "Distributing..." : "Trigger 30d Epoch Payout (Admin)"}
            </button>
          )}
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0c0a18] to-[#1a1528] border border-emerald-500/20 shadow-inner overflow-hidden relative flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">Yield Accrued</span>
            <span className="text-3xl font-light text-white">
              {yieldAccrued.toLocaleString()} <span className="text-lg text-emerald-400 font-bold">PAS</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Portfolio;


import { motion } from "framer-motion";
import { useVaultExchangeRate } from "@hooks/read"

interface StatsProps {
  tvl: number
  stakers: number
  stSttMarketCap: number
  estimatedApr: number
}

const Stats = ({
  tvl,
  stakers,
  stSttMarketCap,
  estimatedApr,
}: StatsProps) => {

  // Exchange rate
  const { data: exchangeRateRaw } = useVaultExchangeRate();
  const exchangeRate = exchangeRateRaw ? Number(exchangeRateRaw) / 1e18 : 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="flex-2 flex flex-col gap-6 p-8 rounded-3xl bg-[#120a1a]/90 backdrop-blur-md border border-white/5 shadow-2xl font-saira"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Lidqx Stats</h2>
        <p className="text-[#94A3B8] text-sm">Network and market overview</p>
      </div>

      {/* Stats List */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex justify-between items-center p-4 bg-[#0d0714] rounded-2xl border border-white/5">
          <span className="text-[#94A3B8] text-sm font-medium">Total Value Locked (TVL)</span>
          <span className="text-white text-lg font-light">${tvl.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[#0d0714] rounded-2xl border border-white/5">
          <span className="text-[#94A3B8] text-sm font-medium">Active Stakers</span>
          <span className="text-white text-lg font-light">{stakers.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[#0d0714] rounded-2xl border border-white/5">
          <span className="text-[#94A3B8] text-sm font-medium">gPAS Market Cap</span>
          <span className="text-white text-lg font-light">${stSttMarketCap.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[#0d0714] rounded-2xl border border-white/5">
          <span className="text-[#94A3B8] text-sm font-medium">Exchange Rate</span>
          <span className="text-white text-lg font-light">
            1 <span className="text-[#64748B] text-sm">gPAS</span> = {exchangeRate.toFixed(4)} <span className="text-[#64748B] text-sm">PAS</span>
          </span>
        </div>

        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#0c0a18] to-[#1a1528] rounded-2xl border border-purple-500/20 mt-2">
          <span className="text-[#9333ea] font-semibold uppercase tracking-wider text-xs">Projected APR (Monthly Epoch)</span>
          <span className="text-[#9333ea] text-2xl font-bold">
            {estimatedApr.toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default Stats


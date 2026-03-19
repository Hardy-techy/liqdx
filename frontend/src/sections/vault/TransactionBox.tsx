import { useState, useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { parseEther } from "viem"
import { GlowBackground } from "@components"
import { formatInputAmount, isSafeDecimalInput } from "../../utils/amount"
import {
  usePASBalance,
  useStSttBalance,
  useVaultExchangeRate,
} from "@hooks/read"
import {
  useDeposit,
  useWithdraw,
} from "@hooks/write"
import { toast } from "react-hot-toast"

const TransactionBox = () => {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit")
  const [amount, setAmount] = useState<string>("")
  const { address: walletAddress } = useAccount()

  const { deposit, hash: depositHash, isPending: isDepositPending, isLoading: isDepositLoading, isSuccess: isDepositSuccess } = useDeposit()
  const { withdraw, hash: withdrawHash, isPending: isWithdrawPending, isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWithdraw()

  const handledDepositHashRef = useRef<string | undefined>(undefined)
  const handledWithdrawHashRef = useRef<string | undefined>(undefined)

  const { data: exchangeRateRaw, refetch: refetchExchangeRate } = useVaultExchangeRate()
  const exchangeRate = exchangeRateRaw ? Number(exchangeRateRaw) / 1e18 : 1     

  const { data: sttBalanceData, refetch: refetchSttBalance } = usePASBalance(walletAddress)
  const sttBalance = Number(sttBalanceData?.formatted ?? 0)

  const { data: gPASBalanceRaw, refetch: refetchStSttBalance } = useStSttBalance(walletAddress)
  const stSttBalance = gPASBalanceRaw ? Number(gPASBalanceRaw) / 1e18 : 0

  const maxBalance = mode === "deposit" ? sttBalance : stSttBalance

  const inputAmount = parseFloat(amount)
  const hasInvalidAmountFormat = amount !== "" && !isSafeDecimalInput(amount)
  const result =
    !isNaN(inputAmount) && inputAmount > 0
      ? mode === "deposit"
        ? inputAmount / exchangeRate
        : inputAmount * exchangeRate
      : 0

  const isDisabled = !walletAddress || !amount || hasInvalidAmountFormat || isNaN(inputAmount) || inputAmount <= 0 || inputAmount > maxBalance

  const inputToken = mode === "deposit" ? "PAS" : "gPAS"
  const outputToken = mode === "deposit" ? "gPAS" : "PAS"

  const handleConfirm = async () => {
    try {
      if (!isSafeDecimalInput(amount)) {
        toast.error("Invalid amount format")
        return
      }

      if (mode === "deposit") {
        await deposit(parseEther(amount))
      } else {
        await withdraw(parseEther(amount))
      }
    } catch (err) {
      console.error("Transaction failed:", err)
      toast.error("Transaction failed")
    }
  }

  const isSubmitting =
    (mode === "deposit" && (isDepositPending || isDepositLoading)) ||
    (mode === "withdraw" && (isWithdrawPending || isWithdrawLoading))

  useEffect(() => {
    if (isDepositSuccess && depositHash && handledDepositHashRef.current !== depositHash) {
      handledDepositHashRef.current = depositHash
      toast.success("Deposit successful!")
      refetchSttBalance()
      refetchStSttBalance()
      refetchExchangeRate()
      setAmount("")
    }
  }, [isDepositSuccess, depositHash, refetchSttBalance, refetchStSttBalance, refetchExchangeRate])

  useEffect(() => {
    if (isWithdrawSuccess && withdrawHash && handledWithdrawHashRef.current !== withdrawHash) {
      handledWithdrawHashRef.current = withdrawHash
      toast.success("Withdraw successful!")
      refetchSttBalance()
      refetchStSttBalance()
      refetchExchangeRate()
      setAmount("")
    }
  }, [isWithdrawSuccess, withdrawHash, refetchSttBalance, refetchStSttBalance, refetchExchangeRate])

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-6 p-8 bg-[#0c0a18]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl relative overflow-hidden">
        <GlowBackground />
        <div className="z-10">
          <p className="text-[#94A3B8] text-sm mb-2">Stake PAS to mint gPAS, or unstake gPAS back to PAS.</p>
        </div>

        <div className="flex gap-2 mb-2 p-1 bg-[#0d0714] rounded-xl border border-white/5 z-10">
          <button onClick={() => setMode("deposit")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "deposit" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/50 hover:text-white/80"}`}
          >Deposit</button>
          <button onClick={() => setMode("withdraw")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "withdraw" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-white/50 hover:text-white/80"}`}
          >Withdraw</button>
        </div>

        <div className="flex flex-col gap-3 z-10">
          <div className="bg-[#0d0714] border border-white/5 transition-colors focus-within:border-[#9333ea]/50 hover:border-white/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                {mode === "deposit" ? "Pay" : "Withdraw"}
              </span>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>Balance: {maxBalance.toLocaleString()}</span>
                <button type="button" onClick={() => setAmount(formatInputAmount(maxBalance))} className="text-[#9333ea] font-bold hover:text-[#7e22ce] uppercase tracking-wider">Max</button>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <input type="text" inputMode="decimal" placeholder="0.0" value={amount} onChange={(e) => {
                const next = e.target.value.trim()
                if (isSafeDecimalInput(next)) {
                  setAmount(next)
                }
              }} className="w-0 min-w-0 flex-1 bg-transparent text-white text-3xl font-light outline-none" />
              <div className="shrink-0 flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-white font-bold">{inputToken}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0714] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Receive</span>
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-0 min-w-0 flex-1 text-3xl text-white font-light truncate">{result > 0 ? result.toLocaleString() : '0.0'}</span>
              <div className="shrink-0 flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-white font-bold">{outputToken}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={isDisabled || isSubmitting}
          onClick={handleConfirm}
          className={`mt-2 py-4 rounded-xl font-bold text-lg transition-all z-10 ${isDisabled ? "bg-[#1e142b] text-white/40 cursor-not-allowed border border-white/5" : "bg-gradient-to-r from-[#9333ea] to-[#7e22ce] text-white shadow-purple-500/30 hover:shadow-purple-500/50"}`}
        >
          {isSubmitting ? "Submitting..." : "Confirm"}
        </button>
      </div>
    </div>
  )
}

export default TransactionBox

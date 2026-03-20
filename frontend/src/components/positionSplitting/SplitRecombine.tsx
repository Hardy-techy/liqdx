import { useState, useRef, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi"
import { motion } from "framer-motion";
import { toast } from "react-hot-toast"

import { useStSttBalance, usePTBalance, useYTBalance } from "@hooks/read"
import { useApproveToken, useSplit, useRecombine } from "@hooks/write"
import { gPASContract, PTContract, YTContract, SplitterContract } from "@contracts"
import { parseEther } from "viem";
import { formatDisplayAmount, formatInputAmount, isSafeDecimalInput } from "../../utils/amount";

interface TokenOption {
  coin: string;
  icon: string;
}

const tokens: TokenOption[] = [
  { coin: "gPAS", icon: "/gPAS.png" },
];

const SplitRecombine = () => {
  const [mode, setMode] = useState<"split" | "recombine">("split");
  const [amount, setAmount] = useState<string>("");
  const { address: walletAddress } = useAccount()

  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenOption>(tokens[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Generic Hook configurations ---
  const {
    approve: approveGPAS,
    isPending: isApproveGPASPending,
    isSuccess: isApproveGPASSuccess,
  } = useApproveToken(gPASContract.address, gPASContract.abi);
  const {
    approve: approvePT,
    isPending: isApprovePTPending,
    isSuccess: isApprovePTSuccess,
  } = useApproveToken(PTContract.address, PTContract.abi);
  const {
    approve: approveYT,
    isPending: isApproveYTPending,
    isSuccess: isApproveYTSuccess,
  } = useApproveToken(YTContract.address, YTContract.abi);

  const { split, isPending: isSplitPending, isLoading: isSplitLoading, isSuccess: isSplitSuccess } = useSplit()
  const { recombine, isPending: isRecombinePending, isLoading: isRecombineLoading, isSuccess: isRecombineSuccess } = useRecombine()

  // Balances
  const { data: gPASBalanceRaw, refetch: refetchStSttBalance } = useStSttBalance(walletAddress)
  const stSttBalance = gPASBalanceRaw ? Number(gPASBalanceRaw) / 1e18 : 0
  
  const { data: PTBalanceRaw, refetch: refetchPTBalance } = usePTBalance(walletAddress)
  const PTBalance = PTBalanceRaw ? Number(PTBalanceRaw) / 1e18 : 0

  const { data: YTBalanceRaw, refetch: refetchYTBalance } = useYTBalance(walletAddress)
  const YTBalance = YTBalanceRaw ? Number(YTBalanceRaw) / 1e18 : 0

  const maxRecombine = Math.min(PTBalance, YTBalance)
  const maxBalance = mode === "split" ? stSttBalance : maxRecombine

  const hasInvalidAmountFormat = amount !== "" && !isSafeDecimalInput(amount);
  const inputAmount = hasInvalidAmountFormat ? 0 : parseFloat(amount) || 0;
  const inputAmountWei = (() => {
    if (!amount || hasInvalidAmountFormat) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  })()
  
  // Allowances
  const { data: gPASAllowanceRaw, refetch: refetchGPASAllowance } = useReadContract({
    ...gPASContract,
    functionName: "allowance",
    args: walletAddress ? [walletAddress, SplitterContract.address] : undefined,
    query: { enabled: !!walletAddress }
  })
  const { data: ptAllowanceRaw, refetch: refetchPTAllowance } = useReadContract({
    ...PTContract,
    functionName: "allowance",
    args: walletAddress ? [walletAddress, SplitterContract.address] : undefined,
    query: { enabled: !!walletAddress }
  })
  const { data: ytAllowanceRaw, refetch: refetchYTAllowance } = useReadContract({
    ...YTContract,
    functionName: "allowance",
    args: walletAddress ? [walletAddress, SplitterContract.address] : undefined,
    query: { enabled: !!walletAddress }
  })
  
  const gPASAllowanceWei = typeof gPASAllowanceRaw === "bigint" ? gPASAllowanceRaw : 0n
  const ptAllowanceWei = typeof ptAllowanceRaw === "bigint" ? ptAllowanceRaw : 0n
  const ytAllowanceWei = typeof ytAllowanceRaw === "bigint" ? ytAllowanceRaw : 0n

  const gPASAllowance = Number(gPASAllowanceWei) / 1e18;
  const ptAllowance = Number(ptAllowanceWei) / 1e18;
  const ytAllowance = Number(ytAllowanceWei) / 1e18;

  const needsGPASApproval = mode === "split" && inputAmountWei > gPASAllowanceWei;
  const needsPTApproval = mode === "recombine" && inputAmountWei > ptAllowanceWei;
  const needsYTApproval = mode === "recombine" && !needsPTApproval && inputAmountWei > ytAllowanceWei;

  const isDisabled =
    !amount || hasInvalidAmountFormat || isNaN(inputAmount) || inputAmount <= 0 || inputAmount > maxBalance

  // Preview result
  const result =
    !isNaN(inputAmount) && inputAmount > 0
      ? mode === "split"
        ? `${formatDisplayAmount(inputAmount)} PT + ${formatDisplayAmount(inputAmount)} YT`
        : `${formatDisplayAmount(inputAmount)} gPAS`
      : mode === "split"
      ? "0 PT + 0 YT"
      : "0 gPAS";

  const inputToken = mode === "split" ? selectedToken.coin : "PT + YT";

  const handleConfirm = async () => {
    try {
      if (!isSafeDecimalInput(amount)) {
        toast.error("Invalid amount format")
        return
      }

      if (inputAmountWei <= 0n) {
        toast.error("Enter a valid amount")
        return
      }

      if (mode === "split") {
        if (inputAmountWei > gPASAllowanceWei) {
          toast.error("Approve gPAS before splitting")
          return
        }
        await split(inputAmountWei)
      } else {
        await recombine(inputAmountWei)
      }
    } catch (err) {
      console.error("Transaction failed:", err)
      const message = err instanceof Error ? err.message : "Transaction failed"
      toast.error(message)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isSubmitting =
    (mode === "split" && (isSplitPending || isSplitLoading)) ||
    (mode === "recombine" && (isRecombinePending || isRecombineLoading))

  useEffect(() => {
    if (isApproveGPASSuccess) {
      toast.success("gPAS approved!")
      refetchGPASAllowance()
    }
  }, [isApproveGPASSuccess, refetchGPASAllowance])

  useEffect(() => {
    if (isApprovePTSuccess) {
      toast.success("PT approved!")
      refetchPTAllowance()
    }
  }, [isApprovePTSuccess, refetchPTAllowance])

  useEffect(() => {
    if (isApproveYTSuccess) {
      toast.success("YT approved!")
      refetchYTAllowance()
    }
  }, [isApproveYTSuccess, refetchYTAllowance])

  useEffect(() => {
    if (isSplitSuccess) {
      toast.success("Split successful!")
      refetchStSttBalance()
      refetchPTBalance()
      refetchYTBalance()
      setAmount("")
    }
  }, [isSplitSuccess, refetchStSttBalance, refetchPTBalance, refetchYTBalance])

  useEffect(() => {
    if (isRecombineSuccess) {
      toast.success("Recombine successful!")
      refetchStSttBalance()
      refetchPTBalance()
      refetchYTBalance()
      setAmount("")
    }
  }, [isRecombineSuccess, refetchStSttBalance, refetchPTBalance, refetchYTBalance])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="flex-2 flex flex-col font-saira gap-4 p-8 rounded-2xl bg-[#0d0714] border border-white/5 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-[.scrolling-group]:opacity-100 transition-opacity pointer-events-none"></div>
      
      {/* Header */}
      <h2 className="text-3xl font-semibold text-white/80 mb-2 relative z-10">
        Split & Recombine
      </h2>
      <p className="text-gray-400 text-sm mb-6 relative z-10">
        Convert gPAS into PT & YT, or recombine them back.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 relative z-10">
        <button
          onClick={() => setMode("split")}
          className={`flex-1 py-3 rounded-xl text-center font-bold tracking-wider transition-all uppercase text-sm ${
            mode === "split"
              ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "bg-[#1a1528] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
          }`}
        >
          Split
        </button>
        <button
          onClick={() => setMode("recombine")}
          className={`flex-1 py-3 rounded-xl text-center font-bold tracking-wider transition-all uppercase text-sm ${
            mode === "recombine"
              ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "bg-[#1a1528] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
          }`}
        >
          Recombine
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 relative z-10">
        {/* Token Selector */}
        <div
          ref={dropdownRef}
          className="bg-[#1a1528]/80 border border-white/5 rounded-2xl p-4 flex justify-between items-center relative cursor-pointer hover:border-purple-500/20 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <img
              src={selectedToken.icon}
              alt={selectedToken.coin}
              className="w-10 h-10 rounded-full border border-purple-400/40 object-cover"
            />
            <span className="text-white text-lg font-medium tracking-wide">
              {selectedToken.coin}
            </span>
          </div>
          <span
            className={`ml-2 inline-block transition-transform duration-300 ${
              isOpen ? "-rotate-180" : "rotate-0"
            }`}
          >
            <i className="fa-solid fa-chevron-down text-gray-400"></i>
          </span>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute top-16 left-0 w-full bg-[#120a1a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
              {tokens.map((item) => (
                <div
                  key={item.coin}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-purple-500/20 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedToken(item);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.coin}
                    className="w-10 h-10 rounded-full border border-purple-400/40 object-cover"
                  />
                  <span className="text-white font-medium">{item.coin}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-[#1a1528]/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            {inputToken} to {mode}
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const next = e.target.value.trim()
              if (isSafeDecimalInput(next)) {
                setAmount(next)
              }
            }}
            className="flex-1 bg-transparent text-white text-3xl outline-none font-light placeholder-white/20 caret-white"
          />
          <div className="flex items-center gap-5 text-xs text-gray-500 mt-2">
            <span className="text-white/40">
              Balance: {formatDisplayAmount(maxBalance)} {inputToken}
            </span>
            <button
              type="button"
              onClick={() => setAmount(formatInputAmount(maxBalance))}
              className="text-purple-400 font-bold tracking-wider uppercase hover:text-purple-300"
            >
              Max
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-[#0d0714] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 opacity-80">
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">You will receive</span>
          <span className="text-2xl text-white/90 font-light">{result}</span>
        </div>
      </div>

      {/* Dynamic 2-Step Action Buttons */}
      {needsGPASApproval ? (
        <button
          onClick={async () => {
            try {
              if (inputAmountWei <= 0n) {
                toast.error("Enter a valid amount")
                return
              }
              await approveGPAS(SplitterContract.address, inputAmountWei)
            }
            catch(e) { console.error(e) }
          }}
          disabled={isDisabled || isApproveGPASPending}
          className="mt-4 py-4 rounded-xl text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed z-10"
        >
          {isApproveGPASPending ? "Approving..." : "Approve gPAS"}
        </button>
      ) : needsPTApproval ? (
        <button
          onClick={async () => {
            try {
              if (inputAmountWei <= 0n) {
                toast.error("Enter a valid amount")
                return
              }
              await approvePT(SplitterContract.address, inputAmountWei)
            }
            catch(e) { console.error(e) }
          }}
          disabled={isDisabled || isApprovePTPending}
          className="mt-4 py-4 rounded-xl text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed z-10"
        >
          {isApprovePTPending ? "Approving..." : "Approve PT"}
        </button>
      ) : needsYTApproval ? (
        <button
          onClick={async () => {
            try {
              if (inputAmountWei <= 0n) {
                toast.error("Enter a valid amount")
                return
              }
              await approveYT(SplitterContract.address, inputAmountWei)
            }
            catch(e) { console.error(e) }
          }}
          disabled={isDisabled || isApproveYTPending}
          className="mt-4 py-4 rounded-xl text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed z-10"
        >
          {isApproveYTPending ? "Approving..." : "Approve YT"}
        </button>
      ) : (
        <button
          disabled={isDisabled || isSubmitting}
          onClick={handleConfirm}
          className="mt-4 py-4 rounded-xl text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed z-10"
        >
          {isSubmitting ? "Submitting..." : mode === "split" ? "Split" : "Recombine"}
        </button>
      )}
    </motion.div>
  );
};

export default SplitRecombine;

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { toast } from "react-hot-toast";
import { formatInputAmount, isSafeDecimalInput } from "../../utils/amount";
import { 
  PTContract, YTContract, gPASContract, 
  SimplePoolContract, YTPoolContract, gPASPoolContract 
} from "@contracts";
import { useSwap, useAddLiquidity, useApproveToken } from "@hooks/write";
import { usePASBalance, usePTBalance, useYTBalance, useStSttBalance, usePoolInfo, useYTPoolInfo, useGPASPoolInfo } from "@hooks/read";

const Swap = () => {
  const { pair } = useParams<{ pair: string }>();
  const { address: walletAddress } = useAccount();

  // Parse pair route (e.g. "pt-gpas__pas")
  const isPT = pair?.includes("pt-gpas");
  const isYT = pair?.includes("yt-gpas");
  
  // Dynamic Contracts
  const tokenContract = isPT ? PTContract : (isYT ? YTContract : gPASContract);
  const poolContract = isPT ? SimplePoolContract : (isYT ? YTPoolContract : gPASPoolContract);
  
  const tokenSymbol = isPT ? "PT-gPAS" : (isYT ? "YT-gPAS" : "gPAS");

  // Balances
  const { data: pasBalData, refetch: refetchPAS } = usePASBalance(walletAddress);
  const { data: ptBalData, refetch: refetchPT } = usePTBalance(walletAddress);
  const { data: ytBalData, refetch: refetchYT } = useYTBalance(walletAddress);
  const { data: gpasBalData, refetch: refetchGPAS } = useStSttBalance(walletAddress);
  
  const pasBalance = Number(pasBalData?.formatted || 0);
  const tokenBalanceNum = Number(isPT ? ptBalData : (isYT ? ytBalData : gpasBalData)) / 1e18 || 0;

  // Pool Reserves for exact rate calculation
  const { data: ptReserves, refetch: refetchPTReserves } = usePoolInfo();
  const { data: ytReserves, refetch: refetchYTReserves } = useYTPoolInfo();
  const { data: gpasReserves, refetch: refetchGPASReserves } = useGPASPoolInfo();
  
  type PoolTuple = readonly [bigint, bigint, bigint, bigint];
  const reserves = (isPT ? ptReserves : (isYT ? ytReserves : gpasReserves)) as PoolTuple | undefined;
  const reservePAS = reserves ? Number(reserves[0]) / 1e18 : 0;
  const reserveToken = reserves ? Number(reserves[1]) / 1e18 : 0;
  const currentPrice = reserveToken > 0 ? (reservePAS / reserveToken) : 1; // PAS per Token

  // States
  const [activeTab, setActiveTab] = useState<"swap" | "liquidity">("swap");
  const [isSwappingPAS, setIsSwappingPAS] = useState(true); // true = PAS -> Token, false = Token -> PAS
  const [amount, setAmount] = useState("");

  const hasInvalidAmountFormat = amount !== "" && !isSafeDecimalInput(amount);

  // Auto-calculated outcome based on constant product formula loosely (or strictly spot price)
  const amtNum = hasInvalidAmountFormat ? 0 : parseFloat(amount) || 0;
  const liquidityPasAmount = activeTab === "liquidity" ? amtNum : 0;
  const requiredTokenNum = currentPrice > 0 ? liquidityPasAmount / currentPrice : 0;
  const hasEnoughLiquidityBalances =
    activeTab !== "liquidity" ||
    (liquidityPasAmount > 0 && liquidityPasAmount <= pasBalance && requiredTokenNum <= tokenBalanceNum);
  let estimatedReceive = 0;
  if (activeTab === "swap") {
    // Spot price estimation (simplified 0.3% fee)
    if (isSwappingPAS) {
      estimatedReceive = (amtNum * 0.997) / currentPrice;
    } else {
      estimatedReceive = (amtNum * 0.997) * currentPrice;
    }
  }

  // Wagmi Hooks
  const { approve, isPending: isApproving, isSuccess: isApproveSuccess } = useApproveToken(tokenContract.address, tokenContract.abi);
  const { swapPASforToken, swapTokenForPAS, isPending: isSwapping, isSuccess: isSwapSuccess } = useSwap(poolContract.address, poolContract.abi);
  const { addLiquidity, isPending: isAddingLiq, isSuccess: isAddLiqSuccess } = useAddLiquidity(poolContract.address, poolContract.abi);

  // Check Token Allowance for Swapping Token->PAS or Adding Liquidity
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: tokenContract.address,
    abi: tokenContract.abi,
    functionName: "allowance",
    args: walletAddress ? [walletAddress, poolContract.address] : undefined,
    query: { enabled: !!walletAddress }
  });
  const allowance = Number(allowanceRaw || 0) / 1e18;
  const needsApproval = (activeTab === "swap" && !isSwappingPAS && amtNum > allowance) || 
                        (activeTab === "liquidity" && hasEnoughLiquidityBalances && requiredTokenNum > allowance);

  // Effect Listeners for Refetching UI States
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Token Approved!");
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isSwapSuccess) {
      toast.success("Swap Successful!");
      setAmount("");
      refetchPAS();
      if (isPT) refetchPT();
      if (isYT) refetchYT();
      if (!isPT && !isYT) refetchGPAS();
      refetchPTReserves();
      refetchYTReserves();
      refetchGPASReserves();
    }
  }, [isSwapSuccess, isPT, isYT, refetchPAS, refetchPT, refetchYT, refetchGPAS, refetchPTReserves, refetchYTReserves, refetchGPASReserves]);

  useEffect(() => {
    if (isAddLiqSuccess) {
      toast.success("Liquidity Added Successfully!");
      setAmount("");
      refetchPAS();
      if (isPT) refetchPT();
      if (isYT) refetchYT();
      if (!isPT && !isYT) refetchGPAS();
      refetchPTReserves();
      refetchYTReserves();
      refetchGPASReserves();
    }
  }, [isAddLiqSuccess, isPT, isYT, refetchPAS, refetchPT, refetchYT, refetchGPAS, refetchPTReserves, refetchYTReserves, refetchGPASReserves]);

  // Handlers
  const handleSwap = async () => {
    if (hasInvalidAmountFormat) {
      toast.error("Invalid amount format");
      return;
    }
    if (!amtNum || !walletAddress || needsApproval) return;
    try {
      if (isSwappingPAS) {
        await swapPASforToken(parseEther(amount));
      } else {
        await swapTokenForPAS(parseEther(amount));
      }
    } catch(e) { console.error(e) }
  };

  const handleAddLiquidity = async () => {
    if (hasInvalidAmountFormat) {
      toast.error("Invalid amount format");
      return;
    }
    if (!amtNum || !walletAddress || needsApproval || !hasEnoughLiquidityBalances) return;
    try {
      await addLiquidity(parseEther(requiredTokenNum.toFixed(18)), parseEther(amount));
    } catch(e) { console.error(e) }
  };

  const handleMaxSwapAmount = () => {
    const maxPay = isSwappingPAS ? pasBalance : tokenBalanceNum;
    setAmount(formatInputAmount(maxPay));
  };

  const handleMaxLiquidityPas = () => {
    const maxByRatio = tokenBalanceNum * currentPrice;
    const maxPas = Math.min(pasBalance, maxByRatio);
    setAmount(formatInputAmount(maxPas));
  };

  // Toggle tokens for swap
  const toggleTokens = () => setIsSwappingPAS(!isSwappingPAS);

  return (
    <div className="flex-2 flex flex-col font-saira rounded-2xl bg-[#0d0714] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-[.scrolling-group]:opacity-100 transition-opacity pointer-events-none"></div>
      
      {/* Tabs */}
      <div className="p-3 border-b border-white/10 relative z-10 bg-[#120a1a]">
        <div className="flex w-full rounded-xl bg-black/20 border border-white/10 p-1">
        <button 
          onClick={() => setActiveTab("swap")}
          className={`flex-1 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] rounded-lg transition-all ${activeTab === "swap" ? "text-white bg-purple-500/20 border border-purple-400/30 shadow-[0_0_14px_rgba(168,85,247,0.2)]" : "text-white/55 hover:text-white hover:bg-white/5"}`}
        >
          Swap
        </button>
        <button 
          onClick={() => setActiveTab("liquidity")}
          className={`flex-1 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] rounded-lg transition-all ${activeTab === "liquidity" ? "text-white bg-purple-500/20 border border-purple-400/30 shadow-[0_0_14px_rgba(168,85,247,0.2)]" : "text-white/55 hover:text-white hover:bg-white/5"}`}
        >
          Add Liquidity
        </button>
        </div>
      </div>

      <div className="p-8 relative z-10 flex flex-col gap-6">
        
        {/* Header inside tab */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {activeTab === "swap" ? "Swap Tokens" : "Provide Liquidity"}
          </h2>
          <span className="text-xs font-semibold text-purple-200 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-400/25 tracking-wide">
            Pool: {tokenSymbol} / PAS
          </span>
        </div>

        {activeTab === "swap" ? (
          /* SWAP UI */
          <div className="flex flex-col gap-3 mt-2">
            <div className="bg-[#1a1528]/90 rounded-2xl p-4 border border-white/10 hover:border-purple-400/30 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex justify-between mb-2">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">You pay</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs font-medium">Bal: {isSwappingPAS ? pasBalance.toFixed(4) : tokenBalanceNum.toFixed(4)}</span>
                  <button type="button" onClick={handleMaxSwapAmount} className="text-purple-400 font-bold tracking-wider uppercase text-[10px] hover:text-purple-300">Max</button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const next = e.target.value.trim();
                    if (isSafeDecimalInput(next)) {
                      setAmount(next);
                    }
                  }}
                  className="w-full bg-transparent text-white text-3xl outline-none font-light placeholder-white/20 caret-white"
                />
                <span className="ml-4 px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-white font-semibold tracking-wide text-sm whitespace-nowrap">
                  {isSwappingPAS ? "PAS" : tokenSymbol}
                </span>
              </div>
            </div>

            <div className="flex justify-center -my-1 z-10">
              <button
                onClick={toggleTokens}
                className="bg-[#120a1a] border border-purple-400/40 hover:border-purple-300 text-purple-300 rounded-full w-11 h-11 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.2)] transition-all hover:shadow-[0_0_24px_rgba(168,85,247,0.32)] hover:scale-105"
              >
                <i className="fa-solid fa-arrow-up-long absolute text-[10px] -translate-y-1"></i>
                <i className="fa-solid fa-arrow-down-long absolute text-[10px] translate-y-1"></i>
              </button>
            </div>

            <div className="bg-[#1a1528]/70 rounded-2xl p-4 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex justify-between mb-2">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">You receive</span>
                <span className="text-white/40 text-xs font-medium">Bal: {!isSwappingPAS ? pasBalance.toFixed(4) : tokenBalanceNum.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90 text-3xl font-light">
                  {estimatedReceive > 0 ? estimatedReceive.toFixed(4) : "0.00"}
                </span>
                <span className="ml-4 px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-white font-semibold tracking-wide text-sm whitespace-nowrap">
                  {!isSwappingPAS ? "PAS" : tokenSymbol}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">Est. Price</p>
                <p className="mt-1 text-sm text-white/85">1 {tokenSymbol} = {currentPrice > 0 ? currentPrice.toFixed(4) : "0.0000"} PAS</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">Trading Fee</p>
                <p className="mt-1 text-sm text-white/85">0.30% per swap</p>
              </div>
            </div>

            {needsApproval ? (
              <button 
                onClick={async () => {
                  try { await approve(poolContract.address, parseEther(amount)) } 
                  catch(e) { console.error(e) }
                }}
                disabled={!amtNum || hasInvalidAmountFormat || isApproving}
                className="mt-2 w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 rounded-xl text-white text-base font-semibold tracking-[0.12em] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase"
              >
                {isApproving ? "Approving..." : "Approve Token"}
              </button>
            ) : (
              <button 
                onClick={handleSwap}
                disabled={!amtNum || hasInvalidAmountFormat || isSwapping}
                className="mt-2 w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 rounded-xl text-white text-base font-semibold tracking-[0.12em] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase"
              >
                {isSwapping ? "Swapping..." : "Swap"}
              </button>
            )}
          </div>

        ) : (

          /* ADD LIQUIDITY UI */
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-white/60 text-sm mb-2">
              Deposit <span className="text-purple-400 font-bold">PAS</span> and auto-match <span className="text-purple-400 font-bold">{tokenSymbol}</span> at the current market ratio to earn 0.3% of all trades on this pair.
            </p>

            <div className="bg-[#1a1528]/90 rounded-2xl p-4 border border-white/10 hover:border-purple-500/25 transition-colors relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex justify-between mb-2 relative z-10">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Deposit PAS</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs font-medium">Available: {pasBalance.toFixed(4)}</span>
                  <button type="button" onClick={handleMaxLiquidityPas} className="text-purple-400 font-bold tracking-wider uppercase text-[10px] hover:text-purple-300">Max</button>
                </div>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const next = e.target.value.trim();
                    if (isSafeDecimalInput(next)) {
                      setAmount(next);
                    }
                  }}
                  className="w-full bg-transparent text-white text-3xl outline-none font-light placeholder-white/20 caret-white"
                />
                <span className="ml-4 px-3 py-1.5 bg-[#0d0714] border border-white/15 rounded-lg text-white font-semibold tracking-wide text-sm whitespace-nowrap">
                  PAS
                </span>
              </div>
            </div>
            
            <div className="flex justify-center -my-2 z-10">
              <div className="bg-[#0d0714] border border-white/10 rounded-full px-4 py-1 flex items-center gap-2">
                <span className="text-white/40 text-xs font-bold">+</span>
              </div>
            </div>

            <div className="bg-[#1a1528]/55 rounded-2xl p-4 border border-white/10 relative overflow-hidden opacity-95">
              <div className="flex justify-between mb-2">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Required {tokenSymbol} (Auto-calculated)</span>
                <span className="text-white/40 text-xs font-medium">Available: {tokenBalanceNum.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90 text-3xl font-light">
                  {liquidityPasAmount > 0 ? requiredTokenNum.toFixed(4) : "0.00"}
                </span>
                <span className="ml-4 px-3 py-1.5 bg-black/25 border border-white/10 rounded-lg text-white/90 font-semibold tracking-wide text-sm whitespace-nowrap">
                  {tokenSymbol}
                </span>
              </div>
            </div>

            {activeTab === "liquidity" && amtNum > 0 && !hasEnoughLiquidityBalances && (
              <p className="text-xs text-rose-300">
                Insufficient balance for pool ratio. Lower PAS amount.
              </p>
            )}

            {needsApproval ? (
              <button 
                onClick={async () => {
                  try { await approve(poolContract.address, parseEther(requiredTokenNum.toFixed(18))) } 
                  catch(e) { console.error(e) }
                }}
                disabled={!amtNum || hasInvalidAmountFormat || isApproving || !hasEnoughLiquidityBalances}
                className="mt-2 w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 rounded-xl text-white text-base font-semibold tracking-[0.12em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase"
              >
                {isApproving ? "Approving..." : "Approve Token"}
              </button>
            ) : (
              <button 
                onClick={handleAddLiquidity}
                disabled={!amtNum || hasInvalidAmountFormat || isAddingLiq || !hasEnoughLiquidityBalances}
                className="mt-2 w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 rounded-xl text-white text-base font-semibold tracking-[0.12em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase"
              >
                {isAddingLiq ? "Adding Liquidity..." : "Add Liquidity"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Swap;

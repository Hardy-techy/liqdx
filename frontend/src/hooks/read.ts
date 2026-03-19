import { useReadContract, useBalance } from "wagmi"
import { gPASContract, VaultContract, PTContract, YTContract, SplitterContract, SimplePoolContract, YTPoolContract, gPASPoolContract, ValidatorRewardsContract } from "@contracts"

const erc20ReadAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

const vaultRuntimeReadAbi = [
  {
    type: "function",
    name: "latestRuntimeScore",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

// Get PAS balance
export const usePASBalance = (walletAddress?: string) => {
  return useBalance({ 
    address: walletAddress as `0x${string}` | undefined,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000,
      refetchOnWindowFocus: true,
    },
  })
}

// Get gPAS balance
export const useStSttBalance = (walletAddress?: string) => {
  return useReadContract({
    ...gPASContract,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000,
      refetchOnWindowFocus: true,
    },
  })
}

// Get vault exchange rate
export const useVaultExchangeRate = () => {
  return useReadContract({
    ...VaultContract,
    functionName: "exchangeRate",
    query: {
      refetchInterval: 4_000,
      refetchOnWindowFocus: true,
    },
  })
}

// Get PTgPAS balance
export const usePTBalance = (walletAddress?: string) => {
  return useReadContract({
    ...PTContract,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  })
}

// Get YTgPAS balance
export const useYTBalance = (walletAddress?: string) => {
  return useReadContract({
    ...YTContract,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  })
}

// Get Splitter maturity timestamp
export const useSplitterMaturity = () => {
  return useReadContract({
    ...SplitterContract,
    functionName: "maturity",
  })
}

// Get Splitter exchange rate
export const useSplitterExchangeRate = () => {
  return useReadContract({
    ...SplitterContract,
    functionName: "getExchangeRate",
  })
}

// Get Splitter start rate
export const useSplitterStartRate = () => {
  return useReadContract({
    ...SplitterContract,
    functionName: "startRate",
  })
}

// Get SimplePool info (reserves, totalLP, volume)
export const usePoolInfo = () => {
  return useReadContract({
    ...SimplePoolContract,
    functionName: "getPoolInfo",
  })
}

// Get YT Pool info
export const useYTPoolInfo = () => {
  return useReadContract({
    ...YTPoolContract,
    functionName: "getPoolInfo",
  })
}

// Get gPAS Pool info
export const useGPASPoolInfo = () => {
  return useReadContract({
    ...gPASPoolContract,
    functionName: "getPoolInfo",
  })
}

// Get user's LP token balance
export const usePoolLPBalance = (walletAddress?: string) => {
  return useReadContract({
    ...SimplePoolContract,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  })
}

export const useVaultOwner = () => {
  return useReadContract({
    ...VaultContract,
    functionName: "owner",
  })
}

export const useNativeAssetConfigured = () => {
  return useReadContract({
    ...VaultContract,
    functionName: "nativeAssetConfigured",
  })
}

export const useNativeAssetId = () => {
  return useReadContract({
    ...VaultContract,
    functionName: "nativeAssetId",
  })
}

export const useNativeAssetToken = () => {
  return useReadContract({
    ...VaultContract,
    functionName: "nativeAssetToken",
  })
}

export const useNativeAssetVaultBalance = (walletAddress?: string) => {
  return useReadContract({
    ...VaultContract,
    functionName: "nativeAssetBalances",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: { enabled: Boolean(walletAddress) },
  })
}

export const useNativeAssetWalletBalance = (tokenAddress?: string, walletAddress?: string, enabled = true) => {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20ReadAbi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: { enabled: Boolean(enabled && tokenAddress && walletAddress) },
  })
}

export const useNativeAssetAllowance = (
  tokenAddress?: string,
  ownerAddress?: string,
  spenderAddress?: string,
  enabled = true
) => {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20ReadAbi,
    functionName: "allowance",
    args:
      ownerAddress && spenderAddress
        ? [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
        : undefined,
    query: { enabled: Boolean(enabled && tokenAddress && ownerAddress && spenderAddress) },
  })
}

export const useVaultRuntimeScore = (walletAddress?: string) => {
  return useReadContract({
    address: VaultContract.address,
    abi: vaultRuntimeReadAbi,
    functionName: "latestRuntimeScore",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000,
      refetchOnWindowFocus: true,
    },
  })
}

export const useValidatorOwner = () => {
  return useReadContract({
    ...ValidatorRewardsContract,
    functionName: "owner",
  })
}

export const useGPASTotalSupply = () => {
  return useReadContract({
    ...gPASContract,
    functionName: "totalSupply",
    query: {
      refetchInterval: 10_000,
      refetchOnWindowFocus: true,
    },
  })
}

export const useValidatorMonthlyEpochRewardAmount = () => {
  return useReadContract({
    ...ValidatorRewardsContract,
    functionName: "monthlyEpochRewardAmount",
    query: {
      refetchInterval: 10_000,
      refetchOnWindowFocus: true,
    },
  })
}

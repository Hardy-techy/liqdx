import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { VaultContract, gPASContract, SplitterContract, ValidatorRewardsContract } from "@contracts"

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

// Deposit PAS — sends native PAS to the Vault, receives gPAS
export const useDeposit = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const deposit = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")

    return await writeContractAsync({
      ...VaultContract,
      functionName: 'deposit',
      value: amount,
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { deposit, hash, error, isPending, isLoading, isSuccess}
}

// Withdraw gPAS — burns gPAS and returns native PAS
export const useWithdraw = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract() 

  const withdraw = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")

    return await writeContractAsync({
      ...VaultContract,
      functionName: "withdraw",
      args: [amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { withdraw, hash, error, isPending, isLoading, isSuccess }
}

export const useConfigureNativeAsset = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const configureNativeAsset = async (assetId: number) => {
    if (!Number.isInteger(assetId) || assetId < 0 || assetId > 0xffffffff) {
      throw new Error("Asset ID must be a valid uint32")
    }

    return await writeContractAsync({
      ...VaultContract,
      functionName: "configureNativeAsset",
      args: [assetId],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { configureNativeAsset, hash, error, isPending, isLoading, isSuccess }
}

export const useDepositNativeAsset = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const depositNativeAsset = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")

    return await writeContractAsync({
      ...VaultContract,
      functionName: "depositNativeAsset",
      args: [amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { depositNativeAsset, hash, error, isPending, isLoading, isSuccess }
}

export const useWithdrawNativeAsset = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const withdrawNativeAsset = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")

    return await writeContractAsync({
      ...VaultContract,
      functionName: "withdrawNativeAsset",
      args: [amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { withdrawNativeAsset, hash, error, isPending, isLoading, isSuccess }
}

export const useApproveNativeAsset = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const approveNativeAsset = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    if (!tokenAddress) throw new Error("Native asset token address is not set")

    return await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { approveNativeAsset, hash, error, isPending, isLoading, isSuccess }
}

// Approve Splitter to spend user's gPAS
export const useApproveStPAS = () => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const approve = async (amount: bigint) => {
    return await writeContractAsync({
      ...gPASContract,
      functionName: "approve",
      args: [SplitterContract.address, amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { approve, hash, error, isPending, isLoading, isSuccess }
}

// Split gPAS -> PT + YT
export const useSplit = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const split = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")
    if (!address) throw new Error("Wallet not connected")
    if (!publicClient) throw new Error("Public client unavailable")

    let estimatedGas: bigint
    try {
      estimatedGas = await publicClient.estimateContractGas({
        ...SplitterContract,
        functionName: "split",
        args: [amount],
        account: address,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      if (message.includes("allowance") || message.includes("insufficient")) {
        throw new Error("Approve enough gPAS before splitting.")
      }
      throw new Error("Unable to prepare split transaction. Check amount and approvals, then try again.")
    }

    const networkGasPrice = await publicClient.getGasPrice()
    const paddedGas = (estimatedGas * 120n) / 100n

    return await writeContractAsync({
      ...SplitterContract,
      functionName: "split",
      args: [amount],
      gas: paddedGas,
      gasPrice: networkGasPrice,
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { split, hash, error, isPending, isLoading, isSuccess }
}

// Recombine PT + YT -> gPAS
export const useRecombine = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const recombine = async (amount: bigint) => {
    if (amount <= 0n) throw new Error("Amount must be greater than 0")
    if (!address) throw new Error("Wallet not connected")
    if (!publicClient) throw new Error("Public client unavailable")

    let estimatedGas: bigint
    try {
      estimatedGas = await publicClient.estimateContractGas({
        ...SplitterContract,
        functionName: "recombine",
        args: [amount],
        account: address,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      if (message.includes("not enough pt") || message.includes("not enough yt")) {
        throw new Error("Not enough PT/YT to recombine this amount.")
      }
      throw new Error("Unable to prepare recombine transaction. Check balances and try again.")
    }

    const networkGasPrice = await publicClient.getGasPrice()
    const paddedGas = (estimatedGas * 120n) / 100n

    return await writeContractAsync({
      ...SplitterContract,
      functionName: "recombine",
      args: [amount],
      gas: paddedGas,
      gasPrice: networkGasPrice,
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { recombine, hash, error, isPending, isLoading, isSuccess }
}

// Distribute monthly epoch validator rewards
export const useDistributeRewards = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const distributeRewards = async () => {
    if (!address) throw new Error("Wallet not connected")
    if (!publicClient) throw new Error("Public client unavailable")

    let estimatedGas: bigint
    try {
      estimatedGas = await publicClient.estimateContractGas({
        ...ValidatorRewardsContract,
          functionName: "distributeMonthlyEpochReward",
        account: address,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.toLowerCase().includes("30-day epoch cooldown has not passed yet")) {
        throw new Error("Admin payout is locked for 30 days after the previous epoch payout. Please try again later.")
      }
      throw new Error("Unable to prepare payout transaction. Please retry in a moment.")
    }

    const networkGasPrice = await publicClient.getGasPrice()
    const paddedGas = (estimatedGas * 120n) / 100n
    const boundedGas = paddedGas > 500_000n ? 500_000n : paddedGas
    const boundedGasPrice = networkGasPrice > 10_000_000_000n ? 10_000_000_000n : networkGasPrice

    return await writeContractAsync({
      ...ValidatorRewardsContract,
      functionName: 'distributeMonthlyEpochReward',
      gas: boundedGas,
      gasPrice: boundedGasPrice,
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return { distributeRewards, hash, error, isPending, isLoading, isSuccess }
}

// AMM Liquidity & Swaps

export const useApproveToken = (tokenAddress: `0x${string}`, tokenAbi: any) => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()
  
  const approve = async (spender: `0x${string}`, amount: bigint) => {
    return await writeContractAsync({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { approve, hash, error, isPending, isLoading, isSuccess }
}

export const useSwap = (poolAddress: `0x${string}`, poolAbi: any) => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  // Swap PAS -> Token
  const swapPASforToken = async (pasAmount: bigint) => {
    return await writeContractAsync({
      address: poolAddress,
      abi: poolAbi,
      functionName: 'swapPASforToken',
      args: [],
      value: pasAmount,
    })
  }

  // Swap Token -> PAS
  const swapTokenForPAS = async (tokenAmount: bigint) => {
    return await writeContractAsync({
      address: poolAddress,
      abi: poolAbi,
      functionName: 'swapTokenForPAS',
      args: [tokenAmount],
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { swapPASforToken, swapTokenForPAS, hash, error, isPending, isLoading, isSuccess }
}

export const useAddLiquidity = (poolAddress: `0x${string}`, poolAbi: any) => {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const addLiquidity = async (tokenAmount: bigint, pasAmount: bigint) => {
    return await writeContractAsync({
      address: poolAddress,
      abi: poolAbi,
      functionName: 'addLiquidity',
      args: [tokenAmount],
      value: pasAmount,
    })
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { addLiquidity, hash, error, isPending, isLoading, isSuccess }
}

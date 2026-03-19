// contracts/index.ts

import PTJson from "./PT.json"
import YTJson from "./YT.json"
import gPASJson from "./gPAS.json"
import VaultJson from "./Vault.json"
import SplitterJson from "./Splitter.json"
import SimplePoolJson from "./SimplePool.json"
import YTPoolJson from "./YTPool.json"
import gPASPoolJson from "./gPASPool.json"
import ValidatorRewardsJson from "./ValidatorRewards.json"

export const ValidatorRewardsContract = {
  address: ValidatorRewardsJson.address as `0x${string}`,
  abi: ValidatorRewardsJson.abi,
} as const

export const PTContract = {
  address: PTJson.address as `0x${string}`,
  abi: PTJson.abi,
} as const

export const YTContract = {
  address: YTJson.address as `0x${string}`,
  abi: YTJson.abi,
} as const

export const gPASContract = {
  address: gPASJson.address as `0x${string}`,
  abi: gPASJson.abi,
} as const

export const VaultContract = {
  address: VaultJson.address as `0x${string}`,
  abi: VaultJson.abi,
} as const

export const SplitterContract = {
  address: SplitterJson.address as `0x${string}`,
  abi: SplitterJson.abi,
} as const

export const SimplePoolContract = {
  address: SimplePoolJson.address as `0x${string}`,
  abi: SimplePoolJson.abi,
} as const

export const YTPoolContract = {
  address: YTPoolJson.address as `0x${string}`,
  abi: YTPoolJson.abi,
} as const

export const gPASPoolContract = {
  address: gPASPoolJson.address as `0x${string}`,
  abi: gPASPoolJson.abi,
} as const

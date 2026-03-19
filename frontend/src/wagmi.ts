import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';

// Paseo Polkadot Hub Testnet definition
const paseo_hub = {
  id: 420420417,
  name: 'Polkadot Hub Paseo',
  iconUrl: 'https://polkadot.network/assets/img/polkadot-token-logo.png', // Fallback dot icon
  iconBackground: '#E6007A',
  nativeCurrency: { name: 'Paseo', symbol: 'PAS', decimals: 18},
  rpcUrls: {
    default: { http: ['https://eth-rpc-testnet.polkadot.io/'] }
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://blockscout-testnet.polkadot.io/' },
  }
} as const satisfies Chain;

export const wagmiConfig = getDefaultConfig({
  appName: 'Lidqx to Paseo Hub',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [
    paseo_hub
  ],
})

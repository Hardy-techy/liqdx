import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Vault, Market, PoolDetail, Guide, SwapPage, PoolsPage } from './pages'
import Layout from './Layout'
import LayoutGuide from './LayoutGuide'
import { ScrollToTop } from './utils'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { wagmiConfig } from './wagmi'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme  } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          theme={darkTheme({
            accentColor: '#9333ea',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Vault />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/market" element={<Market />} />
                <Route path="/swap" element={<SwapPage />} />
                <Route path="/swap/:pair" element={<SwapPage />} />
                <Route path="/pools" element={<PoolsPage />} />
                <Route path="/pools/:pair/:address" element={<PoolDetail />} />
              </Route>

              <Route path="/guide" element={<LayoutGuide />}>
                <Route path="/guide" element={<Guide />} />
              </Route>
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                   background: "rgba(12, 10, 24, 0.95)",
                  color: "#fff",
                   borderRadius: "1rem",
                   padding: "20px 24px",
                   border: "1px solid rgba(147, 51, 234, 0.15)",
                   boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                   fontFamily: "Inter, sans-serif",
                   fontSize: "0.925rem",
                   maxWidth: "420px",
                   minHeight: "72px",
                  lineHeight: "1.5",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981", // emerald-500
                    secondary: "#111827",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444", // red-500
                    secondary: "#111827",
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#9333ea",
                    secondary: "#111827",
                  },
                },
              }}
            />

          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

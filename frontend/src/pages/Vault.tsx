import { VaultTitle, PortfolioStats, XcmAdminPanel } from "@sections";
import { Container, Portfolio } from "@components";

const Vault = () => {
  const showTrack2Admin = import.meta.env.VITE_ENABLE_TRACK2_ADMIN === "true";
  const sttPriceUsd = 1.2;

  return (
    <>
      <VaultTitle />
      <Container className="relative" background="">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left: User Portfolio Balances */}
          <div className="flex-1 xl:max-w-lg">
            <Portfolio sttPriceUsd={sttPriceUsd} />
          </div>

          {/* Right: Global Protocol Stats */}
          <div className="flex-1">
            <PortfolioStats sttPriceUsd={sttPriceUsd} />
          </div>
        </div>

        {showTrack2Admin && (
          <div className="mt-8">
            <XcmAdminPanel />
          </div>
        )}
      </Container>
    </>
  )
}

export default Vault;
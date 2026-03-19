import { useParams } from "react-router-dom";
import { Container, Swap, Chart } from "@components";
import { MarketTitle, TransactionBox } from "@sections";

const SwapPage = () => {
  const { pair } = useParams<{ pair: string }>();

  return (
    <>
      {pair ? (
        <>
          <MarketTitle title="Swap" subtitle="Trade PT, YT, and gPAS against PAS" />
          <Container className="py-8">
            <div className="mb-5 rounded-xl border border-white/10 bg-[#120a1a] px-4 py-3 text-sm text-white/75">
              Track 2 PVM is applied in Stake minting and reflected in Portfolio runtime score. Swap uses AMM pool pricing only.
            </div>
            <div className="flex flex-col xl:flex-row gap-8">
              <Swap />
              <Chart />
            </div>
          </Container>
        </>
      ) : (
        <>
          <MarketTitle title="Stake" subtitle="Stake PAS and manage your gPAS position" />
          <Container className="py-16 flex justify-center items-center">
            <div className="w-full max-w-lg">
              <TransactionBox />
            </div>
          </Container>
        </>
      )}
    </>
  )
}

export default SwapPage;

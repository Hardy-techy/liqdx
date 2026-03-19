import { Link } from "react-router-dom";

interface PoolBoxProps {
  tokenPair: string;
  address: string;
  liquidity: string;
  totalSwapVolume: string;
  apy: string;
}

const PoolBox = ({ tokenPair, address, liquidity, totalSwapVolume, apy }: PoolBoxProps) => {
  
  const pairSlug = tokenPair
    .replace(/\s+/g, "")
    .replace("/", "__")
    .toLowerCase();

  return (
    <Link to={`/pools/${pairSlug}/${address}`} className="block block h-full">
      <div className="bg-[#0d0714] backdrop-blur-md px-8 py-10 rounded-3xl w-full h-full shadow-lg hover:shadow-purple-500/20 transition-all border border-white/5 hover:border-[#9333ea]/50 cursor-pointer">
        {/* Header */}
        <h3 className="text-2xl font-saira text-white font-bold mb-6 tracking-wide">
          {tokenPair}
        </h3>

        {/* Info section */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/60">Address</span>
            <span className="text-[#9333ea] underline underline-offset-2">
              {address}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/60">Liquidity</span>
            <span className="text-white">{liquidity}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/60">Total Swap Volume</span>
            <span className="text-white">{totalSwapVolume}</span>
          </div>
          <div className="flex justify-between mt-4 pb-2">
            <span className="text-white/60">APY</span>
            <span className="text-white font-semibold">{apy}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PoolBox;


import { Container } from "@components";
import { useParams } from "react-router-dom";

const PoolTitle = () => {
  const { pair, address } = useParams();

  const decodedPair = pair?.replace("__", " / ").toUpperCase();
  const explorerBase = "https://blockscout-testnet.polkadot.io";
  const isFullAddress = !!address && /^0x[a-fA-F0-9]{40}$/.test(address);
  const shortAddress = isFullAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  return (
    <Container className="relative py-0 pt-20" background="bg-black">
      <h2 className="text-3xl font-saira mt-3 uppercase text-white/80">
        {decodedPair?.toUpperCase()}
      </h2>

      {address && (
        isFullAddress ? (
          <a
            href={`${explorerBase}/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-400 text-sm font-mono hover:text-cyan-300 hover:border-cyan-400/50 transition"
          >
            <span className="truncate max-w-[220px]">{shortAddress}</span>
            <span>↗</span>
          </a>
        ) : (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-400 text-sm font-mono">
            <span className="truncate max-w-[220px]">{shortAddress}</span>
            <span>↗</span>
          </div>
        )
      )}
    </Container>
  );
};

export default PoolTitle;

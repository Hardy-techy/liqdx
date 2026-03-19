import { Container } from "@components";
import { useParams } from "react-router-dom";

const PoolTitle = () => {
  const { pair, address } = useParams();

  const decodedPair = pair?.replace("__", " / ").toUpperCase();

  return (
    <Container className="relative py-0 pt-20" background="bg-black">
      <h2 className="text-3xl font-saira mt-3 uppercase text-white/80">
        {decodedPair?.toUpperCase()}
      </h2>

      {address && (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-400 text-sm font-mono">
          <span className="truncate max-w-[220px]">{address}</span>
          <p className="hover:text-cyan-400 transition">
            ↗
          </p>
        </div>
      )}
    </Container>
  );
};

export default PoolTitle;

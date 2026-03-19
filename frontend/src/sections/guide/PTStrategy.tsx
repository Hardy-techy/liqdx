import { Container, GlowBackground } from "@components";

const PTStrategy = () => {
  return (
    <Container className="relative" background="bg-black">
      <div className="relative">
        <GlowBackground />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-saira items-center text-center text-white mt-5 mb-10">
        Stage 3: Locking in your returns –{" "}
        <span className="font-bold" style={{ color: "#1BDEBF" }}>
          PT
        </span>{" "}
        strategy
      </h1>

      {/* Intro Section */}
      <div className="flex flex-col gap-5 px-5 py-5 mb-20 bg-dark-transparent rounded-2xl border border-white/20">
        <Container>
          <p className="text-gray-300 leading-relaxed mb-10">
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              Principal Tokens (PT)
            </span>{" "}
            can be traded on <span className="font-bold text-white">Lidqx Market</span>, where their price 
            shifts based on market activity.
          </p>

          <div className="flex justify-center mb-20">
            <div className="w-4/5 rounded-lg border border-white/15 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
              PT market flow visual removed
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-5">
            Suppose a user decides to purchase{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            representing staked <span className="font-bold text-white">gPAS</span>, called{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT-gPAS
            </span>
            . Since{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PTs
            </span>{" "}
            exclude the yield portion,{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT-gPAS
            </span>{" "}
            will always trade below{" "}
            <span className="font-bold text-white">1 PAS</span>.
          </p>

          <p className="text-gray-300 leading-relaxed mb-10">
            For example, if the user buys 1{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT-gPAS
            </span>{" "}
            at <span className="font-bold text-white">0.9 PAS</span>, once maturity arrives they can
            redeem it for <span className="font-bold text-white">1 PAS</span>. The payout at
            maturity is fixed, meaning the user secures a predictable return regardless of future
            yield changes.
          </p>

          <div className="flex justify-center mb-10">
            <div className="w-4/5 rounded-lg border border-white/15 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
              PT maturity example visual removed
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-5">
            In simple terms, this is what a{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            trade looks like:
          </p>

          <div className="bg-[#152D35] text-[#1BDEBF] font-bold p-5 rounded-xl">
            Buy and hold{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            → lock in a fixed return at maturity
          </div>
        </Container>
      </div>

      {/* Timing Section */}
      <div className="flex flex-col gap-5 px-5 py-5 mb-20 bg-dark-transparent rounded-2xl border border-white/20">
        <Container>
          <div className="relative">
            <GlowBackground />
          </div>

          <h2 className="text-3xl font-saira mb-10">
            When is the time to buy or sell{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>
            ?
          </h2>

          <hr className="border-t border-gray-700 my-10" />

          {/* Buying Section */}
          <h3 className="text-2xl font-saira text-white mb-3">
            A. Buying{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>
          </h3>

          <p className="text-gray-300 leading-relaxed mb-5">
            The fixed return from holding{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            depends on both the market and its current price. Intuitively, you’ll want to buy when{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            is cheaper, as that gives you a higher fixed yield.
          </p>

          <p className="text-gray-300 leading-relaxed mb-3">To decide, consider two things:</p>

          <div className="space-y-3 mb-10">
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-gray-300 font-bold">
              1. Your estimate of the average yield from now until maturity
            </div>
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-gray-300 font-bold">
              2. Whether the current fixed yield is attractive enough to lock in
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-5">
            For example, suppose you expect the average yield on{" "}
            <span className="font-bold text-white">gPAS</span> until maturity to be 5%, but{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT-gPAS
            </span>{" "}
            is trading at a fixed rate of 6%. In this case, buying and holding{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT-gPAS
            </span>{" "}
            would lock in a better return.
          </p>

          <div className="bg-[#152D35] text-[#1BDEBF] font-bold p-4 rounded-lg mb-20">
            Pro Tip: Timing matters. As people trade{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            on Lidqx, the fixed rate moves up and down. If you wait and enter when{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            is oversold (due to volatility or mispricing), you can lock in a higher fixed rate until
            maturity.
          </div>

          <hr className="border-t border-gray-700 my-10" />

          {/* Selling Section */}
          <h3 className="text-2xl font-saira text-white mb-3">
            B. Selling{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            early
          </h3>

          <p className="text-gray-300 leading-relaxed mb-3">
            Instead of holding until maturity, you can also sell your{" "}
            <span className="font-bold" style={{ color: "#1BDEBF" }}>
              PT
            </span>{" "}
            early. Common reasons include:
          </p>

          <div className="space-y-3 mb-10">
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-gray-300 font-bold">
              1. Exiting the position to free up capital
            </div>
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-gray-300 font-bold">
              2. Taking profit if the price of{" "}
              <span className="font-bold" style={{ color: "#1BDEBF" }}>
                PT
              </span>{" "}
              has risen significantly. This strategy is often called{" "}
              <span className="italic">Active Yield Trading</span>.
            </div>
          </div>
        </Container>
      </div>
    </Container>
  );
};

export default PTStrategy;

import { Container, GlowBackground } from "@components";

const Trading = () => {
  return (
    <Container className="relative" background="bg-black">

      <div className="relative">
        <GlowBackground />
      </div>

      <h1 className="text-4xl font-saira items-center text-center text-white mt-5 mb-10">
        Stage 5: Yield Trading
      </h1>

      <div className="flex flex-col gap-5 px-5 py-5 mb-20 bg-dark-transparent rounded-2xl border border-white/20">
        <Container>
          <p className="text-gray-300 leading-relaxed mb-5">
            Yield trading combines the strategies of{" "}
            <span className="font-bold" style={{ color: '#1BDEBF' }}>PT</span> 
            {" "}and{" "}
            <span className="font-bold" style={{ color: '#78B4FB' }}>YT</span>.  
            By actively buying and selling both tokens on the{" "}
            <span className="font-bold text-white">Lidqx Market</span>, traders can position 
            themselves depending on how they expect yields to move over time.
          </p>

          <p className="text-gray-300 leading-relaxed mb-10">
            In simple terms,{" "}
            <span className="font-bold" style={{ color: '#1BDEBF' }}>PT </span> 
            is about locking in fixed returns, while{" "}
            <span className="font-bold" style={{ color: '#78B4FB' }}>YT </span> 
            lets you speculate on future yield. Together, they open the door 
            for more advanced strategies where you can hedge, speculate, or 
            arbitrage based on market conditions.
          </p>

          {/* PT Trade Summary */}
          <div className="space-y-3 mb-5">
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-[#1BDEBF] font-bold">
              Buy & hold <span className="font-bold" style={{ color: '#1BDEBF' }}>PT</span> → Fixed return at maturity
            </div>
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-[#1BDEBF] font-bold">
              Best when you want stability and certainty
            </div>
          </div>

          {/* YT Trade Summary */}
          <div className="space-y-3 mb-10">
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-[#78B4FB] font-bold">
              Buy & hold <span className="font-bold" style={{ color: '#78B4FB' }}>YT</span> → Long yield until maturity
            </div>
            <div className="bg-[#152D35] rounded-xl p-4 border border-white/10 text-[#78B4FB] font-bold">
              Profits = Future yield – YT cost
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-5">
            Yield trading is not just about passively holding.  
            Skilled traders can rotate between{" "}
            <span className="font-bold" style={{ color: '#1BDEBF' }}>PT </span> 
            and{" "}
            <span className="font-bold" style={{ color: '#78B4FB' }}>YT </span> 
            depending on market conditions, locking in returns when the 
            fixed yield looks attractive or speculating on growth when 
            future yields seem undervalued.
          </p>

          {/* Pro Tip */}
          <div className="bg-[#152D35] text-white font-bold p-5 rounded-xl">
            Pro Tip: Yield trading rewards patience and timing.  
            Watch market swings closely — volatility can present 
            rare opportunities to either lock in high fixed rates 
            or buy yield exposure at a discount.
          </div>
        </Container>
      </div>
    </Container>
  );
};

export default Trading;

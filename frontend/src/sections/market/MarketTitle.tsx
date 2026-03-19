import { Container } from "@components";

const MarketTitle = ({ title = "Market", subtitle = "Trade Principal & Yield tokens seamlessly" }: { title?: string, subtitle?: string }) => {
  return (
    <Container className="relative py-0 pt-16 flex flex-col items-center justify-center">
      <h2 className='text-4xl md:text-5xl font-bold tracking-tight text-white mb-3'>
        {title}
      </h2>
      <div className="w-12 h-1 rounded-full bg-gradient-to-r from-purple-500 to-violet-400 mb-3" />
      <p className="text-[#a09bb5] text-sm tracking-wide">{subtitle}</p>
    </Container>
  )
}

export default MarketTitle

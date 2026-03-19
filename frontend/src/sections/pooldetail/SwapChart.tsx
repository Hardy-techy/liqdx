import { Container, Swap, Chart } from "@components"

const SwapChart = () => {
  return (
    <Container className="relative" background="bg-black">
      <div className="flex flex-col xl:flex-row gap-10">
        <Swap />
        <Chart />
      </div>
    </Container>
  )
}

export default SwapChart

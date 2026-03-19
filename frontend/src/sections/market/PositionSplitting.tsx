import { Container, Position, SplitRecombine } from "@components";

const PositionSplitting = () => {
  return (
    <Container className="relative" background="">
      <div className="flex flex-col xl:flex-row gap-10">
        <Position />
        <SplitRecombine />
      </div>
    </Container>
  )
}

export default PositionSplitting

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const StatCard = ({ value, label, prefix, suffix }: StatCardProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.3,    
  });

  return (
    <div
      ref={ref}
      className="card-glass px-10 py-14 rounded-3xl flex flex-col items-center justify-center w-full h-full hover:border-purple-500/15 transition-all duration-300"
    >
      <span
        className="font-semibold 
        bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400
        bg-clip-text text-transparent
        leading-[120%] tracking-[-2.1px] 
        text-[clamp(30px,3.594vw,50px)]"
      >
        {inView ? (
          <CountUp
            end={value}
            duration={4}
            separator=","
            prefix={prefix}
            suffix={suffix}
            decimals={value % 1 !== 0 ? 2 : 0}
          />
        ) : (
          `${prefix ?? ""} 0 ${suffix ?? ""}` // show 0 before animation
        )}
      </span>
      <p className="text-sm text-[#a09bb5] mt-3 tracking-wide font-medium uppercase">{label}</p>
    </div>
  );
};

export default StatCard;

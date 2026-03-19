import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "00:00", price: 1.0, liquidity: 45.7, volume: 3.2 },
  { time: "02:00", price: 1.02, liquidity: 45.9, volume: 2.8 },
  { time: "04:00", price: 0.98, liquidity: 46.2, volume: 3.6 },
  { time: "06:00", price: 1.05, liquidity: 47.0, volume: 4.1 },
  { time: "08:00", price: 1.08, liquidity: 48.2, volume: 5.0 },
  { time: "10:00", price: 1.12, liquidity: 49.0, volume: 4.4 },
];

const Chart = () => {
  const { pair } = useParams(); // e.g. "pt-ststt"
  const [base, quote] = pair ? pair.split("__") : ["TokenA", "TokenB"];

  return (
    <div className="flex-2 flex flex-col font-saira gap-6 p-8 rounded-2xl bg-gray-900/70 border border-gray-800">
      <h2 className="text-3xl font-semibold text-white/80 mb-2">Pool Metrics</h2>
      <p className="text-gray-400 text-sm mb-6">
        Live metrics tracking <span className="text-cyan-400">{base.toUpperCase()} / {quote.toUpperCase()}</span> pool performance.
      </p>

      <div className="w-full h-72">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#aaa" />
            <YAxis
              stroke="#aaa"
              label={{
                value: `Price (${quote.toUpperCase()})`,
                angle: -90,
                position: "insideLeft",
                fill: "#aaa",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#fff",
              }}
              labelStyle={{ color: "#22d3ee" }}
              formatter={(value: number, name: string) => {
                if (name === "price") return [`${value.toFixed(2)} ${quote.toUpperCase()}`, "Price"];
                if (name === "liquidity") return [`$${value.toFixed(1)}M`, "Liquidity"];
                if (name === "volume") return [`$${value.toFixed(1)}M`, "24h Volume"];
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              name="price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;

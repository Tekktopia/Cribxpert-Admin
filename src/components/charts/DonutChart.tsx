// src/components/charts/DonutChart.tsx
// Recharts-powered donut. Drop-in replacement for the old canvas version —
// same { label, value, color }[] contract, but with smooth rendering,
// hover tooltips, and a centered total.
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: ChartData[];
  /** Optional centered label under the total (e.g. "users"). */
  centerLabel?: string;
}

export function DonutChart({ data, centerLabel }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const slices = data.filter((d) => d.value > 0);

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices.length ? slices : [{ label: "None", value: 1, color: "#e5e7eb" }]}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={slices.length > 1 ? 2 : 0}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {(slices.length ? slices : [{ color: "#e5e7eb" }]).map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          {slices.length > 0 && (
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
              formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Centered total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-gray-900 leading-none">{total.toLocaleString()}</span>
        {centerLabel && <span className="text-[10px] text-gray-400 mt-0.5">{centerLabel}</span>}
      </div>
    </div>
  );
}

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export interface ChartCardProps {
  label: string;
  data: { date: string; value: number }[];
  chartType: "line" | "bar";
  color: string;
  unit?: string;
}

/**
 * ChartCard
 * ------------------------------------------------------------------
 * Generic card to display either a line or bar chart using Recharts.
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  label,
  data,
  chartType,
  color,
  unit
}) => (
  <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-2" style={{ borderColor: "transparent" }}>
    <h3 className="text-sm font-semibold text-slate-600 pl-1">{label}</h3>

    <ResponsiveContainer width="100%" height={250}>
      {chartType === "bar" ? (
        <BarChart data={data} margin={{ right: 10, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10 }} unit={unit} />
          <Tooltip />
          {/* Provide a name prop so the legend displays the metric label */}
          <Bar dataKey="value" name={label} fill={color} radius={4} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ right: 10, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10 }} unit={unit} />
          <Tooltip />
          {/* Provide a name prop so the legend displays the metric label */}
          <Line type="monotone" dataKey="value" name={label} stroke={color} dot={{ r: 4 }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
        </LineChart>
      )}
    </ResponsiveContainer>
  </div>
);

export default ChartCard;
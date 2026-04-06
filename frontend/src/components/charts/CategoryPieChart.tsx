import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryDatum {
  name: string;
  amount: number;
  color: string;
  icon: string;
}

interface Props {
  data?: CategoryDatum[]; // allow undefined and guard inside
}

const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const safeData: CategoryDatum[] = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-xs text-slate-400">
        No category data for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={safeData}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {safeData.map((e, i) => (
            <Cell key={i} fill={e.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: any) => [`€${Number(v).toFixed(2)}`]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
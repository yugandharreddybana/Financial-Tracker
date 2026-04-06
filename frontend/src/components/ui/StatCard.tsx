// StatCard.tsx
import React from "react";
import clsx from "clsx";

interface Props {
  label: string;
  value: string | number;
  trend: string;
  variant: "positive" | "negative" | "neutral";
}

const variantClasses: Record<Props["variant"], string> = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-50 text-slate-700",
};

const StatCard: React.FC<Props> = ({ label, value, trend, variant }) => (
  <div className="card p-4 flex items-center justify-between">
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-900 mt-1">
        {typeof value === "number"
          ? value.toLocaleString("en-IE", { maximumFractionDigits: 2 })
          : value}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">{trend}</p>
    </div>
    <div
      className={clsx(
        "px-2.5 py-1 rounded-full text-[11px] font-semibold",
        variantClasses[variant],
      )}
    >
      {variant === "positive" && "On track"}
      {variant === "negative" && "Warning"}
      {variant === "neutral" && "Info"}
    </div>
  </div>
);

export default StatCard;
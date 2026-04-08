import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../services/api";
import toast from "react-hot-toast";
import { TrendingUp, Wallet, PiggyBank, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

interface CategoryBreakdown {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}
interface TrendMonth {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}
interface IncomeData {
  thisMonthTotal: number;
  byCategory: CategoryBreakdown[];
  trend: TrendMonth[];
  ytdIncome: number;
  ytdExpenses: number;
  ytdSavings: number;
  ytdSavingsRate: number;
}

const fmtEur = (v: number) =>
  v.toLocaleString("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 });

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-800 text-xs">
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtEur(p.value)}
        </p>
      ))}
    </div>
  );
};

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}> = ({ icon, label, value, sub, color }) => (
  <div className="card p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color + "20" }}
    >
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  </div>
);

const IncomeAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<IncomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [salaryDelta, setSalaryDelta] = useState(0); // -30 to +50 %

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<IncomeData>("/income/breakdown");
      setData(res.data);
    } catch {
      toast.error("Failed to load income analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // What-if calculations
  const whatIf = useMemo(() => {
    if (!data) return null;
    const salaryCategory = data.byCategory.find(
      (c) => c.categoryName.toLowerCase().includes("salary")
    );
    const salaryBase = salaryCategory?.amount ?? data.thisMonthTotal;
    const delta = salaryBase * (salaryDelta / 100);
    const newMonthlyIncome = data.thisMonthTotal + delta;
    const latestTrend = data.trend[data.trend.length - 1];
    const avgMonthlyExpenses = latestTrend?.expenses ?? 0;
    const newSavings = newMonthlyIncome - avgMonthlyExpenses;
    const newSavingsRate =
      newMonthlyIncome > 0
        ? Math.round((newSavings / newMonthlyIncome) * 100)
        : 0;
    const annualDelta = delta * 12;
    return { newMonthlyIncome, newSavings, newSavingsRate, annualDelta, delta };
  }, [data, salaryDelta]);

  if (loading || !data) return <LoadingSpinner size="lg" className="py-32" />;

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Income Analytics"
        subtitle={`Where your money comes from — this month, YTD, and what-if scenarios.`}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill
          icon={<TrendingUp size={18} />}
          label={`Income — ${currentMonth}`}
          value={fmtEur(data.thisMonthTotal)}
          color="#10B981"
        />
        <StatPill
          icon={<Calendar size={18} />}
          label={`Income — YTD ${thisYear}`}
          value={fmtEur(data.ytdIncome)}
          color="#3B82F6"
        />
        <StatPill
          icon={<Wallet size={18} />}
          label={`YTD Expenses`}
          value={fmtEur(data.ytdExpenses)}
          color="#EF4444"
        />
        <StatPill
          icon={<PiggyBank size={18} />}
          label={`YTD Savings`}
          value={fmtEur(data.ytdSavings)}
          sub={`${data.ytdSavingsRate}% savings rate`}
          color="#8B5CF6"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart – 6-month income vs expenses */}
        <div className="card p-4 lg:col-span-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Income vs Expenses — last 6 months
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.trend} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              <Bar dataKey="savings" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart – income sources this month */}
        <div className="card p-4 lg:col-span-2 flex flex-col">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Income sources — {currentMonth}
          </p>
          {data.byCategory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              No income recorded this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.byCategory}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.byCategory.map((c, i) => (
                    <Cell key={i} fill={c.categoryColor} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtEur(v)} />
                <Legend
                  formatter={(value) => {
                    const cat = data.byCategory.find((c) => c.categoryName === value);
                    return (
                      <span style={{ fontSize: 11 }}>
                        {cat?.categoryIcon} {value} ({cat?.percentage ?? 0}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Savings rate line chart */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Savings rate trend — last 6 months
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="savingsRate"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Savings Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* What-if slider */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🧮</span>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">What-if: Salary change</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Drag the slider to see how a salary change would affect your monthly savings and savings rate.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-gray-400 w-10 text-right">-30%</span>
          <input
            type="range"
            min={-30}
            max={50}
            step={1}
            value={salaryDelta}
            onChange={(e) => setSalaryDelta(Number(e.target.value))}
            className="flex-1 accent-primary-600 h-2 cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-10">+50%</span>
        </div>

        <div className="text-center mb-4">
          <span
            className={`text-2xl font-bold ${
              salaryDelta > 0
                ? "text-green-600"
                : salaryDelta < 0
                ? "text-red-600"
                : "text-gray-700"
            }`}
          >
            {salaryDelta > 0 ? "+" : ""}
            {salaryDelta}% salary
          </span>
        </div>

        {whatIf && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">New monthly income</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {fmtEur(whatIf.newMonthlyIncome)}
              </p>
              <p className={`text-[11px] font-medium mt-0.5 ${whatIf.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                {whatIf.delta >= 0 ? "+" : ""}{fmtEur(whatIf.delta)} / mo
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Monthly savings</p>
              <p className={`text-sm font-bold ${whatIf.newSavings >= 0 ? "text-green-700" : "text-red-600"}`}>
                {fmtEur(whatIf.newSavings)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">New savings rate</p>
              <p
                className={`text-sm font-bold ${
                  whatIf.newSavingsRate >= 20
                    ? "text-green-700"
                    : whatIf.newSavingsRate >= 10
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {whatIf.newSavingsRate}%
              </p>
              <p className="text-[11px] text-gray-400">target: 20%+</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Annual impact</p>
              <p
                className={`text-sm font-bold ${
                  whatIf.annualDelta >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {whatIf.annualDelta >= 0 ? "+" : ""}{fmtEur(whatIf.annualDelta)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyticsPage;

import React, { useEffect, useState } from "react";
import { Leaf, Zap, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../services/api";
import { aiService } from "../services/ai.service";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { BankAccount } from "../types";
import { bankAccountService } from "../services/bankAccount.service";

interface CarbonData {
  totalCo2Kg: number;
  byCategory: { name: string; icon: string; co2Kg: number; color: string }[];
  byMonth: { month: string; co2Kg: number }[];
  equivalencies: { label: string; value: string; icon: string }[];
}

const CarbonPage: React.FC = () => {
  const [data, setData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");

  const loadAccounts = async () => {
    try {
      const res = await bankAccountService.getAll();
      setAccounts(res.data);
    } catch {
      toast.error("Failed to load accounts");
    }
  };

  const loadData = async (accountId: number | "ALL") => {
    setLoading(true);
    const param = accountId === "ALL" ? "" : `?bankAccountId=${accountId}`;
    try {
      const r = await api.get(`/dashboard/carbon-footprint${param}`);
      setData(r.data);
    } catch {
      toast.error("Failed to load carbon data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadData(selectedAccountId);
  }, [selectedAccountId]);

  const handleGetTips = async () => {
    if (!data) return;
    setAiLoading(true);
    try {
      const r = await aiService.getCarbonInsights(data);
      setAiTips(r.data.tips || []);
    } catch {
      toast.error("AI service unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !data) return <LoadingSpinner size="lg" className="py-32" />;

  return (
    <div>
      <PageHeader
        title="Carbon Footprint"
        subtitle={
          selectedAccountId === "ALL"
            ? "Track and reduce your spending-related CO₂ emissions across all accounts."
            : "Carbon impact of transactions on this specific account."
        }
        actions={
          <select
            className="select text-xs min-w-[180px]"
            value={selectedAccountId === "ALL" ? "ALL" : String(selectedAccountId)}
            onChange={(e) =>
              setSelectedAccountId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
            }
          >
            <option value="ALL">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="card p-5 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center justify-center mb-2">
            <Leaf className="text-emerald-600" size={20} />
          </div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
            Total CO₂ this month
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {data.totalCo2Kg.toFixed(1)} kg
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Equivalents
          </p>
          <div className="flex flex-col gap-1 text-xs text-gray-600">
            {data.equivalencies.map((e) => (
              <div key={e.label} className="flex items-center justify-between">
                <span>
                  {e.icon} {e.label}
                </span>
                <span className="font-semibold">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="text-slate-600" size={20} />
          </div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Get reduction tips
          </p>
          <button
            onClick={handleGetTips}
            disabled={aiLoading}
            className="btn-primary w-full text-xs"
          >
            {aiLoading ? "Thinking..." : "Ask AI for greener habits"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">CO₂ by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCategory} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(v: any) => `${v.toFixed(1)} kg`} />
                <Bar dataKey="co2Kg" radius={[0, 6, 6, 0]}>
                  {data.byCategory.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">CO₂ over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => `${v.toFixed(1)} kg`} />
                <Bar dataKey="co2Kg" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {aiTips.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            AI Suggestions
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {aiTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CarbonPage;

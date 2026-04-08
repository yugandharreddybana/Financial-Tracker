import React, { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import api from "../services/api";
import { aiService } from "../services/ai.service";
import toast from "react-hot-toast";
import { CreditCard, RefreshCw, Sparkles } from "lucide-react";

interface SubscriptionDto {
  merchant: string;
  avgAmount: number;
  chargeCount: number;
  lastChargeDate: string;
  nextChargeDate: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  bankAccountName?: string;
  currencySymbol: string;
}

const SubscriptionsPage: React.FC = () => {
  const [items, setItems] = useState<SubscriptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<SubscriptionDto[]>("/subscriptions");
      setItems(res.data);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAskAi = async () => {
    if (!items.length) {
      toast("No subscriptions detected yet.");
      return;
    }
    setAiLoading(true);
    try {
      const totalMonthly = items.reduce((sum, s) => sum + (s.avgAmount || 0), 0);
      const res = await aiService.getSubscriptionAdvice({
        subscriptions: items,
        monthlyIncome: undefined,
        totalMonthly,
      });
      setAiSuggestions(res.data.suggestions || []);
    } catch {
      toast.error("AI service unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;

  const total = items.reduce((sum, s) => sum + (s.avgAmount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Recurring charges detected from your transactions. Use this to cut wasteful spend."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary text-xs">
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={handleAskAi}
              disabled={aiLoading}
              className="btn-primary text-xs"
            >
              <Sparkles size={14} /> {aiLoading ? "Asking AI..." : "Ask AI which to cut"}
            </button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="card p-8 flex flex-col items-center text-center gap-2">
          <CreditCard size={32} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No clear subscriptions detected yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Once you have a few months of recurring charges (like Netflix, Spotify, or gym
            memberships), they will appear here.
          </p>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{items.length} recurring merchants detected</span>
            <span>
              Approx. monthly spend: <span className="font-semibold">{items[0]?.currencySymbol || "$"}{total.toFixed(2)}</span>
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {items.map((s) => (
              <div
                key={s.merchant + s.lastChargeDate}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: s.categoryColor + "20" }}
                  >
                    {s.categoryIcon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.merchant}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {s.categoryName}
                      {s.bankAccountName ? ` · ${s.bankAccountName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {s.currencySymbol}
                    {s.avgAmount.toFixed(2)} / month
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Last: {new Date(s.lastChargeDate).toLocaleDateString()} · Next:
                    {" "}
                    {new Date(s.nextChargeDate).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {s.chargeCount} charges detected
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div className="card p-5 mt-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            AI suggestions
          </h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            {aiSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;

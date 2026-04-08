import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import { BankAccount, Transaction } from "../types";
import { bankAccountService } from "../services/bankAccount.service";
import { aiService } from "../services/ai.service";
import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const BankAccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string[] | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [chartType, setChartType] = useState<"balance" | "monthly">("balance");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [accRes, txRes] = await Promise.all([
          bankAccountService.getAll(),
          api.get(`/transactions?bankAccountId=${id}`),
        ]);
        const accs = Array.isArray(accRes.data) ? accRes.data : [];
        const acc = accs.find((a: BankAccount) => a.id === Number(id));
        setAccount(acc || null);
        const txs = Array.isArray(txRes.data) ? txRes.data : [];
        setTransactions(txs);
      } catch { toast.error("Failed to load account details"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  const totalIncome = useMemo(() => filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0), [filtered]);

  // Build running balance chart data
  const balanceChartData = useMemo(() => {
    if (!account) return [];
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    let running = (account.currentBalance || 0) - totalIncome + totalExpense;
    return sorted.map(t => {
      running += t.type === "INCOME" ? t.amount : -t.amount;
      return { date: t.date, balance: Number(running.toFixed(2)), label: t.description };
    });
  }, [filtered, account, totalIncome, totalExpense]);

  // Monthly bar chart
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    filtered.forEach(t => {
      const m = t.date.substring(0, 7);
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 };
      if (t.type === "INCOME") map[m].income += t.amount;
      else map[m].expense += t.amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const handleAiInsight = async () => {
    if (!account) return;
    setAiLoading(true);
    try {
      const r = await aiService.chat(
        `Analyse the transactions for my bank account "${account.name}" (${account.currencyCode}). Current balance: ${account.currencySymbol}${account.currentBalance}. Give me 4-5 specific, actionable insights about spending patterns, suggestions, and observations for this specific account. Be honest and direct.`,
        []
      );
      const text = r.data.message || r.data.insights?.join("\n") || "No insights available.";
      setAiInsight(text.split("\n").filter((l: string) => l.trim()));
    } catch { toast.error("AI service unavailable"); }
    finally { setAiLoading(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;
  if (!account) return <div className="text-center py-16 text-gray-500 dark:text-gray-400">Account not found.</div>;

  const sym = account.currencySymbol;
  const isCC = account.isCreditCard;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/bank-accounts")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><ArrowLeft size={18}/></button>
        <PageHeader
          title={`${account.icon} ${account.name}`}
          subtitle={`${account.currencyCode} · ${isCC ? "Credit Card" : "Bank Account"}`}
          actions={
            <button onClick={handleAiInsight} disabled={aiLoading} className="btn-primary text-xs">
              {aiLoading ? <><LoadingSpinner size="sm"/> Analysing...</> : <><Sparkles size={14}/> AI Insights</>}
            </button>
          }
        />
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <div className="card p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-100 dark:border-purple-900">
          <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-purple-600 dark:text-purple-400"/><h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights for {account.name}</h3></div>
          <div className="space-y-2">
            {aiInsight.map((line, i) => <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{line}</p>)}
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className={`grid gap-4 ${isCC ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{isCC ? "Credit Used" : "Current Balance"}</p>
          <p className={`text-2xl font-bold ${isCC ? "text-red-600" : "text-gray-900 dark:text-white"}`}>{sym}{isCC ? Number(account.creditUsed).toFixed(2) : Number(account.currentBalance).toFixed(2)}</p>
        </div>
        {isCC && (
          <>
            <div className="card p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Credit Limit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sym}{Number(account.creditLimit).toFixed(2)}</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Available</p>
              <p className="text-2xl font-bold text-green-600">{sym}{(Number(account.creditLimit) - Number(account.creditUsed)).toFixed(2)}</p>
            </div>
          </>
        )}
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-green-500"/> Total Income</p>
          <p className="text-2xl font-bold text-green-600">{sym}{totalIncome.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-red-500"/> Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{sym}{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart with date filters */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setChartType("balance")} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${chartType === "balance" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>Balance Trend</button>
            <button onClick={() => setChartType("monthly")} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${chartType === "monthly" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>Monthly Summary</button>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400"/>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input !w-auto text-xs"/>
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input !w-auto text-xs"/>
            {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-primary-600 hover:underline">Clear</button>}
          </div>
        </div>
        <div className="h-64">
          {chartType === "balance" && balanceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }}/>
                <Line type="monotone" dataKey="balance" stroke={account.color || "#3B82F6"} strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          ) : chartType === "monthly" && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }}/>
                <Bar dataKey="income" fill="#10B981" radius={[4,4,0,0]} name="Income"/>
                <Bar dataKey="expense" fill="#EF4444" radius={[4,4,0,0]} name="Expense"/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">No transaction data for the selected period.</div>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transactions ({filtered.length})</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-basic">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td><span className="flex items-center gap-1.5"><span>{t.categoryIcon}</span><span>{t.categoryName}</span></span></td>
                    <td><span className={`badge-soft ${t.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{t.type}</span></td>
                    <td className="text-right font-medium">{t.type === "EXPENSE" ? "-" : "+"}{sym}{t.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccountDetailPage;

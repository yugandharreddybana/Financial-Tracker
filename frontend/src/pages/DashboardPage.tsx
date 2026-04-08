import React, { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import CashFlowChart from "../components/charts/CashFlowChart";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAppSelector } from "../hooks/useAppDispatch";
import api from "../services/api";
import { BankAccount, DashboardStats, CashFlowForecast, NetWorth } from "../types";
import { bankAccountService } from "../services/bankAccount.service";
import { FileText, AlertTriangle, Plus } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import TransactionModal from "../components/modals/TransactionModal";

interface CombinedDashboard { stats: DashboardStats; cashFlow: CashFlowForecast; netWorth: NetWorth; }
interface BudgetAlert { id: number; categoryName: string; categoryIcon: string; categoryColor: string; month: number; year: number; percentage: number; remainingAmount: number; limitAmount: number; status: "APPROACHING" | "OVER"; }

const DashboardPage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [data, setData] = useState<CombinedDashboard | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const loadAccounts = async () => {
    try {
      const res = await bankAccountService.getAll();
      const accs = Array.isArray(res.data) ? res.data : [];
      setAccounts(accs);
      if (selectedAccountId === null && accs.length > 0) {
        setSelectedAccountId(accs[0].id);
      } else if (accs.length === 0) {
        setLoading(false);
      }
    } catch {
      setAccounts([]);
      setLoading(false);
      toast.error("Failed to load accounts");
    }
  };

  const loadDashboard = async (accountId: number | null) => {
    if (accountId === null) return;
    setLoading(true);
    try {
      const param = `?bankAccountId=${accountId}`;
      const [statsRes, cashFlowRes, netWorthRes, alertsRes] = await Promise.all([
        api.get(`/dashboard/stats${param}`),
        api.get(`/dashboard/cash-flow-forecast${param}`),
        api.get(`/dashboard/net-worth${param}`),
        api.get("/budgets/alerts"),
      ]);
      setData({ stats: statsRes.data, cashFlow: cashFlowRes.data, netWorth: netWorthRes.data });
      const ad = alertsRes.data;
      setAlerts(Array.isArray(ad) ? ad : Array.isArray(ad?.alerts) ? ad.alerts : []);
    } catch {
      setAlerts([]);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId !== null) loadDashboard(selectedAccountId);
  }, [selectedAccountId]);

  const handleExportPdf = async () => {
    try {
      const root = document.getElementById("dashboard-export-root");
      if (!root) return;
      const canvas = await html2canvas(root, { scale: 2, backgroundColor: "#f9fafb" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pw / canvas.width, ph / canvas.height);
      pdf.addImage(imgData, "PNG", (pw - canvas.width * ratio) / 2, 20, canvas.width * ratio, canvas.height * ratio);
      pdf.save("finance-dashboard.pdf");
      toast.success("Dashboard exported as PDF");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  if (loading || !data) return <LoadingSpinner size="lg" className="py-16" />;

  const { stats, cashFlow } = data;    const selectedAccount = accounts.find(a => a.id === selectedAccountId);  const greetingName = user?.firstName || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <div id="dashboard-export-root" className="space-y-5">
      <PageHeader
        title={`${greeting}, ${greetingName} 👋`}
        subtitle="Insights for your selected account."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowQuickAdd(true)} className="btn-primary text-xs"><Plus size={14} /> New Transaction</button>
            <button onClick={handleExportPdf} className="btn-secondary text-xs hidden sm:inline-flex"><FileText size={14} /> Export PDF</button>
          </div>
        }
      />

      <div className="flex justify-center">
        <select
          className="select text-xs min-w-[220px]"
          value={selectedAccountId !== null ? String(selectedAccountId) : ""}
          onChange={(e) => setSelectedAccountId(Number(e.target.value))}
        >
          {accounts.filter(a => !a.isCreditCard).map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </select>
      </div>

      {alerts.length > 0 && (
        <div className="card p-4 flex flex-col gap-2 border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2"><AlertTriangle className="text-amber-500" size={16} /><p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Budget alerts - {monthName}</p></div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">{alerts.length} at risk</span>
          </div>
          <div className="space-y-1.5">
            {alerts.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: b.categoryColor + "20" }}>{b.categoryIcon}</span><span className="font-medium">{b.categoryName}</span></div>
                <div className="text-right"><p className="font-semibold">{Math.round(b.percentage)}% used</p><p className="text-[11px]">{b.status === "OVER" ? "Over by" : "Remaining"} EUR {Math.abs(b.remainingAmount).toFixed(2)}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Income (this month)" value={stats.totalIncome} trend="Stable" variant="positive" />
        <StatCard label="Expenses (this month)" value={stats.totalExpenses} trend="Track budgets" variant="negative" />
        <StatCard label="Account balance" value={selectedAccount ? Number(selectedAccount.currentBalance) : 0} trend={selectedAccount && Number(selectedAccount.currentBalance) >= 0 ? "Available funds" : "Overdraft"} variant={selectedAccount && Number(selectedAccount.currentBalance) >= 0 ? "positive" : "negative"} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2"><MonthlyTrendChart data={stats.monthlyTrend} /></div>
        <div className="card p-4"><CategoryPieChart data={stats.topCategories} /></div>
      </div>
      <div className="card p-4"><CashFlowChart data={cashFlow.dailyForecast} /></div>

      {showQuickAdd && (
        <TransactionModal
          isOpen={showQuickAdd}
          onClose={() => {
            setShowQuickAdd(false);
            loadAccounts();
            loadDashboard(selectedAccountId);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;

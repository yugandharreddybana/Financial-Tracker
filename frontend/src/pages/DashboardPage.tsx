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
import { FileText, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface CombinedDashboard {
  stats: DashboardStats;
  cashFlow: CashFlowForecast;
  netWorth: NetWorth;
}

interface BudgetAlert {
  id: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  month: number;
  year: number;
  percentage: number;
  remainingAmount: number;
  limitAmount: number;
  status: "APPROACHING" | "OVER";
}

const DashboardPage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");
  const [data, setData] = useState<CombinedDashboard | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      const res = await bankAccountService.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      setAccounts(list);
    } catch {
      setAccounts([]);
    }
  };

  const loadDashboard = async (accountId: number | "ALL") => {
    setLoading(true);
    try {
      const param = accountId === "ALL" ? "" : `?bankAccountId=${accountId}`;
      const [statsRes, cashFlowRes, netWorthRes, alertsRes] = await Promise.all([
        api.get(`/dashboard/stats${param}`),
        api.get(`/dashboard/cash-flow-forecast${param}`),
        api.get(`/dashboard/net-worth${param}`),
        api.get("/budgets/alerts"),
      ]);

      setData({
        stats: statsRes.data,
        cashFlow: cashFlowRes.data,
        netWorth: netWorthRes.data,
      });

      const alertsData = alertsRes.data;
      const list = Array.isArray(alertsData)
        ? alertsData
        : Array.isArray(alertsData?.alerts)
        ? alertsData.alerts
        : [];
      setAlerts(list);
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
    loadDashboard(selectedAccountId);
  }, [selectedAccountId]);

  const handleExportPdf = async () => {
    try {
      const root = document.getElementById("dashboard-export-root");
      if (!root) return;
      const canvas = await html2canvas(root, { scale: 2, backgroundColor: "#f8fafc" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
      pdf.save("finance-dashboard.pdf");
      toast.success("Dashboard exported as PDF");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    }
  };

  if (loading || !data) return <LoadingSpinner size="lg" className="py-16" />;

  const { stats, cashFlow } = data;
  const greetingName = user?.firstName || "there";
  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <div id="dashboard-export-root" className="space-y-5">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : "evening"}, ${greetingName}`}
        subtitle={
          selectedAccountId === "ALL"
            ? "Overview across all of your accounts."
            : "Insights for a single account so you can zoom in where it matters."
        }
        actions={
          <div className="flex items-center gap-2">
            <select
              className="select text-xs min-w-[180px]"
              value={selectedAccountId === "ALL" ? "ALL" : String(selectedAccountId)}
              onChange={(e) =>
                setSelectedAccountId(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                )
              }
            >
              <option value="ALL">All accounts</option>
              {Array.isArray(accounts) &&
                accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
            </select>
            <button
              onClick={handleExportPdf}
              className="btn-secondary text-xs hidden sm:inline-flex"
            >
              <FileText size={14} /> Export PDF
            </button>
          </div>
        }
      />

      {Array.isArray(alerts) && alerts.length > 0 && (
        <div className="card p-4 flex flex-col gap-2 border border-amber-100 bg-amber-50/60">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={16} />
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                Budget alerts for {monthName}
              </p>
            </div>
            <span className="text-[11px] text-amber-700">
              {alerts.length} at risk
            </span>
          </div>
          <div className="space-y-1.5">
            {alerts.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-xs text-amber-900"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-base"
                    style={{ backgroundColor: b.categoryColor + "20" }}
                  >
                    {b.categoryIcon}
                  </span>
                  <span className="font-medium">{b.categoryName}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Math.round(b.percentage)}% used</p>
                  <p className="text-[11px]">
                    {b.status === "OVER" ? "Over by" : "Remaining"} €
                    {Math.abs(b.remainingAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Income (this month)"
          value={stats.totalIncome}
          trend={"Stable"}
          variant="positive"
        />
        <StatCard
          label="Expenses (this month)"
          value={stats.totalExpenses}
          trend={"Track budgets"}
          variant="negative"
        />
        <StatCard
          label="Net balance"
          value={stats.balance}
          trend={stats.balance >= 0 ? "On track" : "Over budget"}
          variant={stats.balance >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Savings rate"
          value={`${stats.savingsRate}%`}
          trend="Target: 20%+"
          variant="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <MonthlyTrendChart data={stats.monthlyTrend} />
        </div>
        <div className="card p-4">
          <CategoryPieChart data={stats.topCategories} />
        </div>
      </div>

      <div className="card p-4">
        <CashFlowChart data={cashFlow.dailyForecast} />
      </div>
    </div>
  );
};

export default DashboardPage;
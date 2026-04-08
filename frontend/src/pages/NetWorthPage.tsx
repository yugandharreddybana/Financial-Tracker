import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { NetWorth, CashFlowForecast, BankAccount } from "../types";
import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NetWorthChart from "../components/charts/NetWorthChart";
import CashFlowChart from "../components/charts/CashFlowChart";
import clsx from "clsx";
import { bankAccountService } from "../services/bankAccount.service";
import toast from "react-hot-toast";
import { formatCurrency, formatCompact } from "../utils/currency";

const NetWorthPage: React.FC = () => {
  const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowForecast | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  const selectedAccount = selectedAccountId !== "ALL" ? accounts.find(a => a.id === selectedAccountId) : null;
  const currencyCode = selectedAccount?.currencyCode || (accounts.length > 0 ? accounts[0].currencyCode : undefined);
  const currencySymbol = selectedAccount?.currencySymbol || (accounts.length > 0 ? accounts[0].currencySymbol : undefined);
  const fmt = (v: number) => formatCurrency(v, currencyCode, currencySymbol);
  const fmtCompact = (v: number) => formatCompact(v, currencySymbol || "$");
  const statusColor = (s: string) =>
    ({ HEALTHY: "text-green-600 bg-green-50 dark:bg-green-950", WARNING: "text-orange-600 bg-orange-50 dark:bg-orange-950", CRITICAL: "text-red-600 bg-red-50 dark:bg-red-950" }[s] || "");

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
    try {
      const param = accountId === "ALL" ? "" : `?bankAccountId=${accountId}`;
      const [nw, cf] = await Promise.all([
        api.get(`/dashboard/net-worth${param}`),
        api.get(`/dashboard/cash-flow-forecast${param}`),
      ]);
      setNetWorth(nw.data);
      setCashFlow(cf.data);
    } catch {
      toast.error("Failed to load net worth data");
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

  if (loading || !netWorth || !cashFlow) return <LoadingSpinner size="lg" className="py-32" />;

  return (
    <div>
      <PageHeader
        title="Net Worth & Cash Flow"
        subtitle={
          selectedAccountId === "ALL"
            ? "Track your overall wealth and projections across all accounts."
            : "Focused view for a single account's trajectory."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="card p-5 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Total Assets
          </p>
          <p className="text-2xl font-bold text-green-600">{fmt(netWorth.totalAssets || 0)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Net Worth
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(netWorth.netWorth || 0)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Total Liabilities
          </p>
          <p className="text-2xl font-bold text-red-500">{fmt(netWorth.totalLiabilities || 0)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Net Worth History</h3>
          <NetWorthChart data={netWorth.history || []} currencySymbol={currencySymbol} />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">30-Day Cash Flow Forecast</h3>
            <span
              className={clsx(
                "text-xs font-semibold px-2 py-1 rounded-full",
                statusColor(cashFlow.forecastStatus)
              )}
            >
              {cashFlow.forecastStatus}
            </span>
          </div>
          <CashFlowChart data={cashFlow.dailyForecast || []} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUp size={14} className="text-green-600" />
                <p className="text-xs font-semibold text-green-700">Projected Income</p>
              </div>
              <p className="text-base font-bold text-green-700">
                {fmt(cashFlow.projectedMonthlyIncome)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDown size={14} className="text-red-600" />
                <p className="text-xs font-semibold text-red-700">Projected Expense</p>
              </div>
              <p className="text-base font-bold text-red-700">
                {fmt(cashFlow.projectedMonthlyExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthPage;

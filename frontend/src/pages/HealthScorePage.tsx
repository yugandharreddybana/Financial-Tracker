import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { HealthScore, BankAccount } from "../types";
import api from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import clsx from "clsx";
import { bankAccountService } from "../services/bankAccount.service";

const HealthScorePage: React.FC = () => {
  const [data, setData] = useState<HealthScore | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      const res = await bankAccountService.getAll();
      setAccounts(res.data);
    } catch {
      // ignore
    }
  };

  const loadData = async (accountId: number | "ALL") => {
    setLoading(true);
    const param = accountId === "ALL" ? "" : `?bankAccountId=${accountId}`;
    try {
      const r = await api.get(`/dashboard/health-score${param}`);
      setData(r.data);
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

  const gradeColor = (g: string) =>
    ({ A: "text-green-600", B: "text-blue-600", C: "text-orange-500", D: "text-red-500", F: "text-red-700" }[g] ||
      "text-gray-500");
  const gradeBg = (g: string) =>
    ({ A: "bg-green-50 border-green-100", B: "bg-blue-50 border-blue-100", C: "bg-orange-50 border-orange-100", D: "bg-red-50 border-red-100", F: "bg-red-50 border-red-100" }[g] ||
      "bg-gray-50 border-gray-100");

  if (loading || !data) return <LoadingSpinner size="lg" className="py-32" />;

  return (
    <div>
      <PageHeader
        title="Financial Health Score"
        subtitle={
          selectedAccountId === "ALL"
            ? "Your overall money management rating."
            : "Health score based only on this account's activity."
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className={clsx(
            "card p-6 flex flex-col items-center text-center border",
            gradeBg(data.grade)
          )}
        >
          <div
            className="w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center mb-3"
            style={{ borderColor: data.gradeColor }}
          >
            <span className={clsx("text-4xl font-black", gradeColor(data.grade))}>
              {data.grade}
            </span>
          </div>
          <p className="text-4xl font-black text-gray-900 mb-1">
            {data.score}
            <span className="text-lg font-normal text-gray-400">/100</span>
          </p>
          <p className="text-sm text-gray-600">{data.summary}</p>
          <div className="flex items-center gap-2 mt-4 bg-white rounded-xl px-3 py-2">
            <span className="text-sm">🔥</span>
            <p className="text-sm font-semibold text-gray-700">
              Saving streak: <span className="text-orange-500">{data.savingStreak} months</span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {data.components.map((c) => (
            <div key={c.name} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.icon}</span>
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {c.score}/{c.maxScore}
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.score / c.maxScore) * 100}%`, backgroundColor: c.color }}
                />
              </div>
              <p className="text-xs text-gray-500">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
      {data.badges.length > 0 && (
        <div className="card p-5 mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-900">Achievements</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((b) => (
              <span
                key={b}
                className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-100"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScorePage;

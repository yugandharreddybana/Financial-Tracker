import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { fetchTransactions } from "../store/slices/transactionSlice";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import TransactionModal from "../components/modals/TransactionModal";
import EmptyState from "../components/ui/EmptyState";
import { Filter, Search, Download } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector((s) => s.transactions);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);


  const categories = useMemo(
  () => Array.from(new Set(transactions.map((t) => t.categoryName))).sort(),
  [transactions],
);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== "ALL" && t.type !== type) return false;
      if (category !== "ALL" && t.categoryName !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(
          t.description.toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q)
        )) {
          return false;
        }
      }
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      return true;
    });
  }, [transactions, type, category, search, fromDate, toDate]);

  const handleExportCsv = async () => {
    try {
      const res = await api.get("/transactions/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="View, filter and manage all your income and expenses."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportCsv} className="btn-secondary">
              <Download size={14} />
              Export CSV
            </button>
            <button onClick={openCreate} className="btn-primary">
              New transaction
            </button>
          </div>
        }
      />

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Search size={12} /> Search
            </label>
            <input
              className="input"
              placeholder="Search by description, note or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Filter size={12} /> Type
            </label>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ALL">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-1">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                From
              </label>
              <input
                type="date"
                className="input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                To
              </label>
              <input
                type="date"
                className="input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or add a new transaction."
          actionLabel="Add transaction"
          onAction={openCreate}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
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
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 cursor-pointer"
                    onClick={() => openEdit(t.id)}
                  >
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td className="flex items-center gap-2">
                      <span>{t.categoryIcon}</span>
                      <span>{t.categoryName}</span>
                    </td>
                    <td>
                      <span
                        className={`badge-soft ${
                          t.type === "INCOME"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="text-right font-medium">
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={
          editingId ? transactions.find((t) => t.id === editingId) || null : null
        }
      />
      )}
    </div>
  );
};

export default TransactionsPage;

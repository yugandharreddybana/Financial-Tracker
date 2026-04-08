import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { fetchTransactions, deleteTransaction } from "../store/slices/transactionSlice";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import TransactionModal from "../components/modals/TransactionModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { Filter, Search, Download, ArrowRightLeft, X, Pencil, Trash2, Calendar, Tag, CreditCard, FileText, Leaf, RefreshCw } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector((s) => s.transactions);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailTx, setDetailTx] = useState<typeof transactions[0] | null>(null);
  const [deleteTx, setDeleteTx] = useState<typeof transactions[0] | null>(null);

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
    [transactions]
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
        )) return false;
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

  const openCreate = () => { setEditingId(null); setModalOpen(true); };
  const openEdit = (id: number) => { setEditingId(id); setModalOpen(true); setDetailTx(null); };
  const openDetail = (tx: typeof transactions[0]) => { setDetailTx(tx); };
  const handleDeleteTx = async () => {
    if (!deleteTx) return;
    try { await dispatch(deleteTransaction(deleteTx.id)).unwrap(); toast.success("Transaction deleted"); setDetailTx(null); }
    catch { toast.error("Failed to delete"); }
    setDeleteTx(null);
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="View, filter and manage all your income and expenses."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportCsv} className="btn-secondary">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={openCreate} className="btn-primary">
              New transaction
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Search size={12} /> Search
            </label>
            <input className="input" placeholder="Search by description, note or category"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Filter size={12} /> Type
            </label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ALL">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="ALL">All</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-1">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">From</label>
              <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">To</label>
              <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
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
                    className="hover:bg-slate-50/60 dark:hover:bg-gray-800/60 cursor-pointer"
                    onClick={() => openDetail(t)}
                  >
                    <td>{t.date}</td>
                    <td>{t.description}</td>
                    <td className="flex items-center gap-2">
                      <span>{t.categoryIcon}</span>
                      <span>{t.categoryName}</span>
                    </td>
                    <td>
                      <span className={`badge-soft ${
                        t.type === "INCOME"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="text-right font-medium">
                      {t.type === "EXPENSE" ? "-" : "+"}{t.amount.toFixed(2)}
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
          onClose={() => { setModalOpen(false); dispatch(fetchTransactions()); }}
          transaction={
            editingId ? transactions.find((t) => t.id === editingId) || null : null
          }
        />
      )}

      {/* Transaction Detail Slide-over */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailTx(null)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transaction Details</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(detailTx.id)} className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors" title="Edit"><Pencil size={16}/></button>
                <button onClick={() => setDeleteTx(detailTx)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                <button onClick={() => setDetailTx(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-500"/></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Amount banner */}
              <div className={`rounded-2xl p-5 text-center ${detailTx.type === "INCOME" ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100" : "bg-gradient-to-br from-red-50 to-rose-50 border border-red-100"}`}>
                <p className="text-3xl font-bold tracking-tight" style={{ color: detailTx.type === "INCOME" ? "#059669" : "#DC2626" }}>
                  {detailTx.type === "INCOME" ? "+" : "-"}{detailTx.bankAccountCurrencySymbol || "€"}{detailTx.amount.toFixed(2)}
                </p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${detailTx.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {detailTx.type}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{detailTx.description}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Date</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(detailTx.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Tag size={14} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Category</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: detailTx.categoryColor + "20" }}>{detailTx.categoryIcon}</span>
                      <p className="text-sm font-medium text-gray-900">{detailTx.categoryName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank account */}
              {detailTx.bankAccountName && (
                <div className="flex items-start gap-2">
                  <CreditCard size={14} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Bank Account</p>
                    <div className="flex items-center gap-2">
                      {detailTx.bankAccountColor && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: detailTx.bankAccountColor }}/>}
                      <p className="text-sm font-medium text-gray-900">{detailTx.bankAccountName}</p>
                      <span className="text-xs text-gray-500">({detailTx.bankAccountCurrency})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              {detailTx.note && (
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-gray-400 mt-0.5"/>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Note</p>
                    <p className="text-sm text-gray-700">{detailTx.note}</p>
                  </div>
                </div>
              )}

              {/* CO2 */}
              {detailTx.co2Kg != null && Number(detailTx.co2Kg) > 0 && (
                <div className="flex items-start gap-2">
                  <Leaf size={14} className="text-green-500 mt-0.5"/>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Carbon Footprint</p>
                    <p className="text-sm font-medium text-gray-900">{Number(detailTx.co2Kg).toFixed(2)} kg CO₂</p>
                  </div>
                </div>
              )}

              {/* Recurring */}
              {detailTx.isRecurring && (
                <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2">
                  <RefreshCw size={14} className="text-indigo-600"/>
                  <p className="text-xs font-medium text-indigo-700">Recurring transaction</p>
                </div>
              )}

              {/* Created at */}
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">Created on {new Date(detailTx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => openEdit(detailTx.id)} className="btn-primary flex-1 justify-center"><Pencil size={14}/> Edit</button>
                <button onClick={() => setDeleteTx(detailTx)} className="btn-secondary flex-1 justify-center text-red-600 hover:bg-red-50 border-red-200"><Trash2 size={14}/> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTx} title="Delete Transaction" message={`Delete "${deleteTx?.description}"? This action cannot be undone and will revert the bank balance.`} onConfirm={handleDeleteTx} onCancel={() => setDeleteTx(null)} />
    </div>
  );
};

export default TransactionsPage;

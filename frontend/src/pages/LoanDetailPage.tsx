import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Pencil, Table2, TrendingDown, X, Save } from "lucide-react";
import { Loan, AmortizationRow, BankAccount } from "../types";
import { loanService } from "../services/loan.service";
import { bankAccountService } from "../services/bankAccount.service";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LOAN_TYPES = [
  { value: "PERSONAL", label: "Personal", icon: "👤" },
  { value: "EDUCATIONAL", label: "Educational", icon: "🎓" },
  { value: "MORTGAGE", label: "Mortgage", icon: "🏠" },
  { value: "AUTO", label: "Auto", icon: "🚗" },
  { value: "MEDICAL", label: "Medical", icon: "🏥" },
  { value: "BUSINESS", label: "Business", icon: "💼" },
  { value: "OTHER", label: "Other", icon: "📋" },
];

const paySchema = z.object({ amount: z.string().min(1).transform(Number).refine(v => !isNaN(v) && v > 0, "Must be positive") });
type PF = z.infer<typeof paySchema>;

const editSchema = z.object({
  interestRate: z.string().optional().transform(v => v && v.trim() ? Number(v) : undefined),
  monthlyInstallment: z.string().optional().transform(v => v && v.trim() ? Number(v) : undefined),
  lender: z.string().optional(),
  lenderBankAccountId: z.string().optional().transform(v => v && v.trim() ? Number(v) : undefined),
  endDate: z.string().optional(),
});
type EF = z.infer<typeof editSchema>;

const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tab, setTab] = useState<"overview" | "amortization">("overview");

  const payForm = useForm<PF>({ resolver: zodResolver(paySchema) });
  const editForm = useForm<EF>({ resolver: zodResolver(editSchema) });

  const loan = useMemo(() => loans.find(l => l.id === Number(id)) || null, [loans, id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loansRes, accRes] = await Promise.all([loanService.getAll(), bankAccountService.getAll()]);
      setLoans(Array.isArray(loansRes.data) ? loansRes.data : []);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
        try { 
          const sched = await loanService.getAmortization(Number(id)); 
          setSchedule(Array.isArray(sched.data) ? sched.data : []); 
        } catch { 
          setSchedule([]); 
          toast.error("Failed to load amortization schedule");
        }
    } catch { toast.error("Failed to load loan"); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [id]);

  const handlePayment = async (data: PF) => {
    try { await loanService.makePayment(Number(id), data.amount); toast.success("Payment recorded!"); payForm.reset(); setShowPay(false); loadData(); }
    catch { toast.error("Payment failed"); }
  };

  const handleEdit = async (data: EF) => {
    try { await loanService.update(Number(id), data); toast.success("Loan updated!"); setShowEdit(false); loadData(); }
    catch { toast.error("Update failed"); }
  };

  const openEdit = () => {
    if (!loan) return;
    editForm.reset({ interestRate: loan.interestRate, monthlyInstallment: loan.monthlyInstallment, lender: loan.lender || "", lenderBankAccountId: loan.lenderBankAccountId, endDate: loan.endDate || "" });
    setShowEdit(true);
  };

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;
  if (!loan) return <div className="text-center py-16 text-gray-500 dark:text-gray-400">Loan not found.</div>;

  const typeInfo = LOAN_TYPES.find(t => t.value === loan.loanType);
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/loans")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><ArrowLeft size={18}/></button>
        <PageHeader title={`${typeInfo?.icon} ${loan.name}`} subtitle={`${typeInfo?.label} Loan${loan.lender ? ` · ${loan.lender}` : ""}${loan.lenderBankAccountName ? ` (${loan.lenderBankAccountName})` : ""}`} actions={
          <div className="flex gap-2">
            <button onClick={openEdit} className="btn-secondary text-xs"><Pencil size={13}/> Edit</button>
            <button onClick={() => { setShowPay(true); payForm.reset(); }} className="btn-primary text-xs"><DollarSign size={13}/> Make Payment</button>
          </div>
        } />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${Number(loan.totalAmount).toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Paid</p>
          <p className="text-xl font-bold text-green-600">${Number(loan.amountPaid).toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Remaining</p>
          <p className="text-xl font-bold text-red-600">${Number(loan.remainingAmount).toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Interest Rate</p>
          <p className="text-xl font-bold text-blue-600">{loan.interestRate ? `${loan.interestRate}%` : "N/A"}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repayment Progress</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{loan.progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all" style={{ width: `${loan.progressPercentage}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{loan.startDate || "—"}</span>
          <span>{loan.monthlyInstallment ? `$${Number(loan.monthlyInstallment).toFixed(2)}/mo` : ""}</span>
          <span>{loan.endDate || "—"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("overview")} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === "overview" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}><TrendingDown size={14} className="inline mr-1.5"/> Overview</button>
        <button onClick={() => setTab("amortization")} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === "amortization" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}><Table2 size={14} className="inline mr-1.5"/> Amortization Table</button>
      </div>

      {tab === "overview" && schedule.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Balance Over Time</h3>
          <p className="text-xs text-gray-400 mb-4">Total interest to be paid: <span className="font-semibold text-red-600">${totalInterest.toFixed(2)}</span></p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={schedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={Math.max(Math.floor(schedule.length / 12), 1)}/>
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8"/>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }}/>
                <Line type="monotone" dataKey="endingBalance" stroke="#EF4444" strokeWidth={2} dot={false} name="Balance"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "amortization" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Amortization Schedule ({schedule.length} payments)</h3>
            <span className="text-xs text-gray-400">Total Interest: <span className="font-semibold text-red-600">${totalInterest.toFixed(2)}</span></span>
          </div>
          {schedule.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">No schedule available. Ensure monthly installment and interest rate are set.</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin max-h-[500px]">
              <table className="table-basic text-xs">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <tr>
                    <th>#</th>
                    <th>Payment Date</th>
                    <th className="text-right">Beginning Balance</th>
                    <th className="text-right">Payment</th>
                    <th className="text-right">Principal</th>
                    <th className="text-right">Interest</th>
                    <th className="text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(row => (
                    <tr key={row.number} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/60">
                      <td className="text-gray-400">{row.number}</td>
                      <td>{row.date}</td>
                      <td className="text-right">${Number(row.beginningBalance).toFixed(2)}</td>
                      <td className="text-right font-medium">${Number(row.payment).toFixed(2)}</td>
                      <td className="text-right text-green-600">${Number(row.principal).toFixed(2)}</td>
                      <td className="text-right text-red-600">${Number(row.interest).toFixed(2)}</td>
                      <td className="text-right font-medium">${Number(row.endingBalance).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPay(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Make Payment</h2>
              <button onClick={() => setShowPay(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={payForm.handleSubmit(handlePayment)} className="p-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: <span className="font-semibold text-red-600">${Number(loan.remainingAmount).toFixed(2)}</span></p>
              <p className="text-xs text-gray-400">You can make an extra payment above your monthly installment ({loan.monthlyInstallment ? `$${loan.monthlyInstallment}` : "N/A"}).</p>
              <div><label className="label">Amount *</label><input {...payForm.register("amount")} className="input" placeholder="e.g. 500"/></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPay(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={payForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">{payForm.formState.isSubmitting ? <LoadingSpinner size="sm"/> : "Pay"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Loan</h2>
              <button onClick={() => setShowEdit(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="p-5 space-y-4">
              <div><label className="label">Interest Rate (%)</label><input {...editForm.register("interestRate")} className="input" placeholder="e.g. 5.5"/></div>
              <div><label className="label">Monthly Installment</label><input {...editForm.register("monthlyInstallment")} className="input" placeholder="e.g. 500"/></div>
              <div><label className="label">Lender</label><input {...editForm.register("lender")} className="input" placeholder="e.g. Bank of Ireland"/></div>
              <div><label className="label">Lender Bank Account</label>
                <select {...editForm.register("lenderBankAccountId")} className="input">
                  <option value="">None</option>
                  {accounts.filter(a => !a.isCreditCard).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({a.currencyCode})</option>)}
                </select>
              </div>
              <div><label className="label">End Date</label><input type="date" {...editForm.register("endDate")} className="input"/></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={editForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">{editForm.formState.isSubmitting ? <LoadingSpinner size="sm"/> : <><Save size={14}/> Save</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetailPage;

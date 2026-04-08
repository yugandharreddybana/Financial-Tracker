import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Plus, Trash2, X, DollarSign } from "lucide-react";
import { Loan, BankAccount } from "../types";
import { loanService } from "../services/loan.service";
import { bankAccountService } from "../services/bankAccount.service";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const LOAN_TYPES = [
  { value: "PERSONAL", label: "Personal", icon: "👤" },
  { value: "EDUCATIONAL", label: "Educational", icon: "🎓" },
  { value: "MORTGAGE", label: "Mortgage", icon: "🏠" },
  { value: "AUTO", label: "Auto", icon: "🚗" },
  { value: "MEDICAL", label: "Medical", icon: "🏥" },
  { value: "BUSINESS", label: "Business", icon: "💼" },
  { value: "OTHER", label: "Other", icon: "📋" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  loanType: z.string().min(1, "Required"),
  totalAmount: z.string().min(1, "Required").transform(Number).refine(v => !isNaN(v) && v > 0, "Must be positive"),
  amountPaid: z.string().optional().transform(v => (v && v.trim() ? Number(v) : 0)).refine(v => !isNaN(v), "Must be a number"),
  monthlyInstallment: z.string().optional().transform(v => (v && v.trim() ? Number(v) : undefined)),
  interestRate: z.string().optional().transform(v => (v && v.trim() ? Number(v) : undefined)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  lender: z.string().optional(),
  note: z.string().optional(),
});
type F = z.infer<typeof schema>;

const paymentSchema = z.object({
  amount: z.string().min(1, "Required").transform(Number).refine(v => !isNaN(v) && v > 0, "Must be positive"),
});
type PF = z.infer<typeof paymentSchema>;

const LoansPage: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoan, setDeleteLoan] = useState<Loan | null>(null);
  const [payLoan, setPayLoan] = useState<Loan | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { loanType: "PERSONAL", amountPaid: 0 },
  });

  const payForm = useForm<PF>({ resolver: zodResolver(paymentSchema) });

  const load = async () => {
    setLoading(true);
    try {
      const [loanRes, accRes] = await Promise.all([loanService.getAll(), bankAccountService.getAll()]);
      setLoans(Array.isArray(loanRes.data) ? loanRes.data : []);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
    } catch { setLoans([]); toast.error("Failed to load loans"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: F) => {
    try {
      await loanService.create(data);
      toast.success("Loan added!");
      reset();
      setShowModal(false);
      load();
    } catch { toast.error("Failed to add loan"); }
  };

  const handleDelete = async () => {
    if (!deleteLoan) return;
    try { await loanService.delete(deleteLoan.id); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
    setDeleteLoan(null);
    load();
  };

  const handlePayment = async (data: PF) => {
    if (!payLoan) return;
    try {
      await loanService.makePayment(payLoan.id, data.amount);
      toast.success("Payment recorded!");
      payForm.reset();
      setPayLoan(null);
      load();
    } catch { toast.error("Failed to record payment"); }
  };

  const safeLoans = Array.isArray(loans) ? loans : [];
  const activeLoans = safeLoans.filter(l => l.active);
  const paidLoans = safeLoans.filter(l => !l.active);
  const totalDebt = activeLoans.reduce((s, l) => s + (l.remainingAmount || 0), 0);
  const totalPaid = safeLoans.reduce((s, l) => s + (l.amountPaid || 0), 0);

  const getLoanIcon = (type: string) => LOAN_TYPES.find(t => t.value === type)?.icon || "📋";

  return (
    <div>
      <PageHeader title="Loans" subtitle="Track all your loans, payments, and progress." actions={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15}/> Add Loan</button>} />

      {/* Summary Cards */}
      {safeLoans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Active Loans</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeLoans.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Remaining</p>
            <p className="text-2xl font-bold text-red-600">${totalDebt.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner size="lg" className="py-32" /> : safeLoans.length === 0 ? (
        <EmptyState icon={Banknote} title="No loans" description="Add your first loan to start tracking payments." action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15}/> Add Loan</button>} />
      ) : (
        <>
          {/* Active Loans */}
          {activeLoans.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Loans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activeLoans.map(loan => (
                  <div key={loan.id} onClick={() => navigate(`/loans/${loan.id}`)} className="card p-5 relative group cursor-pointer hover:shadow-md transition-shadow">
                    <button onClick={(e) => { e.stopPropagation(); setDeleteLoan(loan); }} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-blue-50 dark:bg-blue-950">{getLoanIcon(loan.loanType)}</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{loan.name}</p>
                        <p className="text-xs text-gray-400">{LOAN_TYPES.find(t => t.value === loan.loanType)?.label || loan.loanType}{loan.lender ? ` · ${loan.lender}` : ""}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div><p className="text-[11px] text-gray-400 uppercase">Total</p><p className="font-semibold text-gray-900 dark:text-white">${Number(loan.totalAmount).toFixed(2)}</p></div>
                      <div className="text-right"><p className="text-[11px] text-gray-400 uppercase">Remaining</p><p className="font-semibold text-red-600">${Number(loan.remainingAmount).toFixed(2)}</p></div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${loan.progressPercentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-gray-400">{loan.progressPercentage.toFixed(1)}% paid</span>
                      {loan.monthlyInstallment && <span className="text-[11px] text-gray-400">${Number(loan.monthlyInstallment).toFixed(2)}/mo</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setPayLoan(loan); payForm.reset(); }} className="w-full mt-1 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors flex items-center justify-center gap-1"><DollarSign size={13}/> Make Payment</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Paid Off Loans */}
          {paidLoans.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Paid Off</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidLoans.map(loan => (
                  <div key={loan.id} className="card p-5 relative group opacity-70">
                    <button onClick={(e) => { e.stopPropagation(); setDeleteLoan(loan); }} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-green-50 dark:bg-green-950">{getLoanIcon(loan.loanType)}</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{loan.name}</p>
                        <p className="text-xs text-green-600 font-medium">Fully Paid</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">${Number(loan.totalAmount).toFixed(2)}</p>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-2"><div className="h-2 rounded-full bg-green-500 w-full" /></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Add Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Loan</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div><label className="label">Loan Name *</label><input {...register("name")} className="input" placeholder="e.g. Student Loan"/>{errors.name && <p className="text-xs text-red-500 mt-1">Required</p>}</div>
              <div><label className="label">Loan Type *</label>
                <select {...register("loanType")} className="input">
                  {LOAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Total Amount *</label><input {...register("totalAmount")} className="input" placeholder="50000"/>{errors.totalAmount && <p className="text-xs text-red-500 mt-1">{String(errors.totalAmount.message)}</p>}</div>
                <div><label className="label">Amount Paid</label><input {...register("amountPaid")} className="input" placeholder="0"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Monthly Installment</label><input {...register("monthlyInstallment")} className="input" placeholder="500"/></div>
                <div><label className="label">Interest Rate (%)</label><input {...register("interestRate")} className="input" placeholder="5.5"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Start Date</label><input type="date" {...register("startDate")} className="input"/></div>
                <div><label className="label">End Date</label><input type="date" {...register("endDate")} className="input"/></div>
              </div>
              <div><label className="label">Lender</label><input {...register("lender")} className="input" placeholder="e.g. Bank of Ireland"/></div>
              <div><label className="label">Lender Bank Account</label>
                <select {...register("lenderBankAccountId" as any)} className="input">
                  <option value="">None</option>
                  {accounts.filter(a => !a.isCreditCard).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({a.currencyCode})</option>)}
                </select>
              </div>
              <div><label className="label">Notes</label><textarea {...register("note")} className="input" rows={2} placeholder="Any additional notes..."/></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">{isSubmitting ? <LoadingSpinner size="sm"/> : "Add Loan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPayLoan(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Payment for {payLoan.name}</h2>
              <button onClick={() => setPayLoan(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={payForm.handleSubmit(handlePayment)} className="p-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: <span className="font-semibold text-red-600">${Number(payLoan.remainingAmount).toFixed(2)}</span></p>
              <div><label className="label">Payment Amount *</label><input {...payForm.register("amount")} className="input" placeholder="e.g. 500"/>{payForm.formState.errors.amount && <p className="text-xs text-red-500 mt-1">{String(payForm.formState.errors.amount.message)}</p>}</div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPayLoan(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={payForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">{payForm.formState.isSubmitting ? <LoadingSpinner size="sm"/> : "Pay"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteLoan} title="Delete Loan" message={`Delete "${deleteLoan?.name}"? This action cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteLoan(null)} />
    </div>
  );
};
export default LoansPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Landmark, Plus, Trash2, X, DollarSign, Search } from "lucide-react";
import { BankAccount, CurrencyEntry } from "../types";
import { bankAccountService } from "../services/bankAccount.service";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const COLORS = ["#3B82F6","#10B981","#8B5CF6","#F97316","#EF4444","#EC4899","#14B8A6","#F59E0B","#6366F1","#84CC16"];
const ICONS  = ["🏦","💳","💰","🏧","💵","🏛️","💼","🌍","🏠","⭐"];

const schema = z.object({
  name: z.string().min(1,"Required"),
  currencyId: z.number().min(1, "Select a currency"),
  icon: z.string(),
  color: z.string(),
  currentBalance: z.coerce.number().default(0),
  isCreditCard: z.boolean().optional().default(false),
  creditLimit: z.coerce.number().default(0),
});
type F = z.infer<typeof schema>;

const BankAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts]       = useState<BankAccount[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [deleteAcc, setDeleteAcc]     = useState<BankAccount | null>(null);
  const [currSearch, setCurrSearch]   = useState("");
  const [payingCardId, setPayingCardId] = useState<number | null>(null);
  const [payAmount, setPayAmount]     = useState("");
  const [currencies, setCurrencies]   = useState<CurrencyEntry[]>([]);
  const [currLoading, setCurrLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { icon:"🏦", color:"#3B82F6", currencyId: 0, isCreditCard: false },  // no 0 default for amounts — inputs start blank
  });
  const selectedCurrId = watch("currencyId");
  const selectedCurr = currencies.find(c => c.id === selectedCurrId) ?? null;
  const selectedColor = watch("color");
  const selectedIcon  = watch("icon");
  const isCreditCard  = watch("isCreditCard");

  const load = async () => {
    setLoading(true);
    try { const { data } = await bankAccountService.getAll(); setAccounts(Array.isArray(data) ? data : []); }
    catch { setAccounts([]); toast.error("Failed to load bank accounts"); }
    finally { setLoading(false); }
  };
  const loadCurrencies = async () => {
    setCurrLoading(true);
    try { const data = await bankAccountService.getCurrencies(); setCurrencies(data); }
    catch { toast.error("Failed to load currencies"); }
    finally { setCurrLoading(false); }
  };
  useEffect(() => { load(); loadCurrencies(); }, []);

  const filteredCurrs = currencies.filter(c => {
    if (!currSearch) return true;
    const q = currSearch.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
  });

  const onSubmit = async (data: F) => {
    try { await bankAccountService.create({ name:data.name, icon:data.isCreditCard?"💳":data.icon, color:data.color, currencyId:data.currencyId, currentBalance:data.currentBalance, isCreditCard:data.isCreditCard, creditLimit:data.isCreditCard?data.creditLimit:0 }); toast.success(data.isCreditCard?"Credit card added!":"Account added!"); reset(); setShowModal(false); setCurrSearch(""); load(); }
    catch { toast.error("Failed to add account"); }
  };
  const handleDelete = async () => {
    if (!deleteAcc) return;
    try { await bankAccountService.delete(deleteAcc.id); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
    setDeleteAcc(null); load();
  };

  const handlePayBill = async (card: BankAccount) => {
    const amount = parseFloat(payAmount);
    if (!payAmount || isNaN(amount) || amount <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await bankAccountService.payBill(card.id, amount);
      toast.success(`Payment of ${card.currencySymbol}${amount.toFixed(2)} applied`);
      setPayingCardId(null);
      setPayAmount("");
      load();
    } catch { toast.error("Payment failed"); }
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const bankAccounts = safeAccounts.filter(a => !a.isCreditCard);
  const creditCards  = safeAccounts.filter(a => a.isCreditCard);

  // Group bank totals by currency code
  const bankTotalsByCurrency = bankAccounts.reduce<Record<string, { symbol: string; total: number }>>((acc, a) => {
    const code = a.currencyCode;
    if (!acc[code]) acc[code] = { symbol: a.currencySymbol, total: 0 };
    acc[code].total += Number(a.currentBalance) || 0;
    return acc;
  }, {});

  // Group credit card totals by currency code
  const ccTotalsByCurrency = creditCards.reduce<Record<string, { symbol: string; totalUsed: number; totalLimit: number }>>((acc, a) => {
    const code = a.currencyCode;
    if (!acc[code]) acc[code] = { symbol: a.currencySymbol, totalUsed: 0, totalLimit: 0 };
    acc[code].totalUsed += Number(a.creditUsed) || 0;
    acc[code].totalLimit += Number(a.creditLimit) || 0;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Bank Accounts & Cards" subtitle="Manage your accounts, credit cards, and balances." actions={<button onClick={() => { setShowModal(true); if (currencies.length === 0) loadCurrencies(); }} className="btn-primary"><Plus size={15}/> Add Account</button>} />

      {/* Bank Accounts Section */}
      {bankAccounts.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Landmark size={16} className="text-blue-500"/> Bank Accounts <span className="text-xs font-normal text-gray-400 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{bankAccounts.length}</span></span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(bankTotalsByCurrency).map(([code, { symbol, total }]) => (
                <span key={code} className="bg-blue-50 dark:bg-blue-950 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {symbol}{total.toFixed(2)} <span className="text-blue-400 font-normal">{code}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {bankAccounts.map(acc => (
              <div key={acc.id} onClick={() => navigate(`/bank-accounts/${acc.id}`)} className="card p-5 relative group cursor-pointer hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: acc.color }}>
                <button onClick={(e) => { e.stopPropagation(); if (!loading) setDeleteAcc(acc); }} disabled={loading} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:pointer-events-none"><Trash2 size={14}/></button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: acc.color+"20" }}>{acc.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{acc.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">{acc.flag && <span>{acc.flag}</span>}{acc.country||"Global"}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">Bank</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Currency</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.currencySymbol} <span className="text-gray-500 dark:text-gray-400 text-xs">{acc.currencyCode}</span></p></div>
                  <div className="text-right"><p className="text-[11px] text-gray-400 uppercase tracking-wide">Balance</p><p className="text-sm font-bold text-gray-900 dark:text-white">{Number(acc.currentBalance||0) === 0 ? "0" : `${acc.currencySymbol}${Number(acc.currentBalance||0).toFixed(2)}`}</p></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Added {new Date(acc.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Credit Cards Section */}
      {creditCards.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><CreditCard size={16} className="text-purple-500"/> Credit Cards <span className="text-xs font-normal text-gray-400 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">{creditCards.length}</span></span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ccTotalsByCurrency).map(([code, { symbol, totalUsed, totalLimit }]) => (
                <span key={code} className="bg-purple-50 dark:bg-purple-950 rounded-lg px-2 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400">
                  {totalUsed === 0 ? "0" : `${symbol}${totalUsed.toFixed(2)}`} / {totalLimit === 0 ? "0" : `${symbol}${totalLimit.toFixed(2)}`} <span className="text-purple-400 font-normal">{code}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {creditCards.map(acc => {
              const limit = Number(acc.creditLimit) || 0;
              const used = Number(acc.creditUsed) || 0;
              const available = limit - used;
              const usedPct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              const isPaying = payingCardId === acc.id;
              const barColor = usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={acc.id} onClick={() => !isPaying && navigate(`/bank-accounts/${acc.id}`)} className={`card p-5 relative group border-l-4 transition-shadow ${isPaying ? "" : "cursor-pointer hover:shadow-md"}`} style={{ borderLeftColor: acc.color }}>
                  {/* Delete button */}
                  <button onClick={(e) => { e.stopPropagation(); if (!loading) setDeleteAcc(acc); }} disabled={loading} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:pointer-events-none"><Trash2 size={14}/></button>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: acc.color+"20" }}>💳</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{acc.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">{acc.flag && <span>{acc.flag}</span>}{acc.country||acc.currencyCode}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">Credit</span>
                  </div>

                  {/* Balance display */}
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Used</p>
                        <p className="text-xl font-bold text-red-500">{used === 0 ? "0" : `${acc.currencySymbol}${used.toFixed(2)}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Available</p>
                        <p className="text-xl font-bold text-emerald-500">{available === 0 ? "0" : `${acc.currencySymbol}${available.toFixed(2)}`}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1.5">
                      <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${usedPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{usedPct.toFixed(0)}% used</span>
                      <span>Limit: {limit === 0 ? "0" : `${acc.currencySymbol}${limit.toFixed(2)}`}</span>
                    </div>
                  </div>

                  {/* Pay Bill */}
                  {isPaying ? (
                    <div onClick={e => e.stopPropagation()} className="flex gap-2">
                      <input
                        autoFocus
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handlePayBill(acc); if (e.key === "Escape") { setPayingCardId(null); setPayAmount(""); } }}
                        placeholder="Amount"
                        className="input text-sm flex-1 min-w-0"
                      />
                      <button onClick={() => handlePayBill(acc)} className="btn-primary text-xs px-3">Pay</button>
                      <button onClick={() => { setPayingCardId(null); setPayAmount(""); }} className="btn-secondary text-xs px-2"><X size={14}/></button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setPayingCardId(acc.id); setPayAmount(""); }}
                      disabled={loading || used === 0}
                      className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <DollarSign size={13}/> Pay Bill
                    </button>
                  )}

                  <p className="text-[11px] text-gray-400 mt-2">Added {new Date(acc.createdAt).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && safeAccounts.length === 0 && (
        <EmptyState icon={Landmark} title="No bank accounts" description="Add your first account to start tracking." action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15}/> Add Account</button>} />
      )}
      {loading && <LoadingSpinner size="lg" className="py-32" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setCurrSearch(""); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{isCreditCard?"Add Credit Card":"Add Bank Account"}</h2>
              <button onClick={() => { setShowModal(false); setCurrSearch(""); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please select a currency and fill in all required fields"))} className="p-5 space-y-4">
              <div><label className="label">Account Name *</label><input {...register("name")} className="input" placeholder={isCreditCard?"e.g. Visa Gold":"e.g. AIB Current Account"}/>{errors.name&&<p className="text-xs text-red-500 mt-1">Required</p>}</div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <input type="checkbox" id="isCreditCard" {...register("isCreditCard")} className="w-4 h-4 text-primary-600 rounded" onChange={(e) => { setValue("isCreditCard", e.target.checked); if(e.target.checked) setValue("icon","💳"); else setValue("icon","🏦"); }}/>
                <label htmlFor="isCreditCard" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard size={16}/> This is a credit card</label>
              </div>
              <div>
                <label className="label">Currency *</label>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  <input value={currSearch} onChange={e=>setCurrSearch(e.target.value)} className="input pl-8" placeholder="Search by country, currency or code…"/>
                </div>
                {/* Selected currency preview */}
                {selectedCurr && (() => { const sel = selectedCurr; return sel ? (
                  <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-xs">
                    <span className="text-lg">{sel.flag}</span>
                    <span className="font-semibold text-primary-700 dark:text-primary-300">{sel.country}</span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-600 dark:text-gray-300">{sel.name}</span>
                    <span className="ml-auto font-bold text-primary-600 dark:text-primary-400">{sel.symbol} <span className="font-normal text-gray-400">{sel.code}</span></span>
                  </div>
                ) : null; })()}
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
                  {currLoading && currencies.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Loading currencies…</p>
                  )}
                  {!currLoading && currencies.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-red-500 mb-2">Failed to load currencies.</p>
                      <button type="button" onClick={loadCurrencies} className="text-xs text-primary-600 underline">Try again</button>
                    </div>
                  )}
                  {!currLoading && currencies.length > 0 && filteredCurrs.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No currencies found</p>
                  )}
                  {filteredCurrs.map(c=>(
                    <button type="button" key={`${c.code}-${c.country}`} onClick={() => { setValue("currencyId", c.id, { shouldValidate: true }); setCurrSearch(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors ${selectedCurrId===c.id?"bg-primary-50 dark:bg-primary-950":""}`}>
                      <span className="text-lg flex-shrink-0">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.country}</p>
                        <p className="text-[11px] text-gray-400 truncate">{c.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{c.symbol}</span>
                        <span className="text-[11px] text-gray-400 ml-1">{c.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.currencyId && <p className="text-xs text-red-500 mt-1">Please select a currency</p>}
              </div>
              <div><label className="label">{isCreditCard?"Current Balance Owed":"Current Balance"}</label>
                <div className="relative"><input {...register("currentBalance" as const)} className="input pr-10" placeholder="e.g. 1250.00"/><span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">{selectedCurr?.code||"EUR"}</span></div>
                {errors.currentBalance&&<p className="text-xs text-red-500 mt-1">{String(errors.currentBalance.message)}</p>}
              </div>
              {isCreditCard && (
                <div><label className="label">Credit Limit *</label>
                  <div className="relative"><input {...register("creditLimit" as const)} className="input pr-10" placeholder="e.g. 5000.00"/><span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">{selectedCurr?.code||"EUR"}</span></div>
                  {errors.creditLimit&&<p className="text-xs text-red-500 mt-1">{String(errors.creditLimit.message)}</p>}
                </div>
              )}
              {!isCreditCard && <div><label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(i=><button type="button" key={i} onClick={() => setValue("icon",i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${selectedIcon===i?"ring-2 ring-primary-500 bg-primary-50":"hover:bg-gray-100"}`}>{i}</button>)}
                </div>
              </div>}
              <div><label className="label">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c=><button type="button" key={c} onClick={() => setValue("color",c)} className={`w-8 h-8 rounded-lg transition-all ${selectedColor===c?"ring-2 ring-offset-2 ring-gray-400 scale-110":""}`} style={{ backgroundColor: c }}/>)}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setCurrSearch(""); }} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">{isSubmitting?<LoadingSpinner size="sm"/>:"Add Account"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!deleteAcc} title="Delete Account" message={`Delete "${deleteAcc?.name}"? All transactions linked to this account will also be permanently deleted. This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteAcc(null)} />
    </div>
  );
};
export default BankAccountsPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Landmark, Plus, Trash2, X } from "lucide-react";
import { BankAccount } from "../types";
import { bankAccountService } from "../services/bankAccount.service";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const CURRENCIES = [
  { code:"EUR",symbol:"€",name:"Euro",flag:"🇪🇺" },
  { code:"GBP",symbol:"£",name:"British Pound",flag:"🇬🇧" },
  { code:"USD",symbol:"$",name:"US Dollar",flag:"🇺🇸" },
  { code:"INR",symbol:"₹",name:"Indian Rupee",flag:"🇮🇳" },
  { code:"JPY",symbol:"¥",name:"Japanese Yen",flag:"🇯🇵" },
  { code:"CAD",symbol:"C$",name:"Canadian Dollar",flag:"🇨🇦" },
  { code:"AUD",symbol:"A$",name:"Australian Dollar",flag:"🇦🇺" },
  { code:"CHF",symbol:"Fr",name:"Swiss Franc",flag:"🇨🇭" },
  { code:"CNY",symbol:"¥",name:"Chinese Yuan",flag:"🇨🇳" },
  { code:"AED",symbol:"د.إ",name:"UAE Dirham",flag:"🇦🇪" },
  { code:"NGN",symbol:"₦",name:"Nigerian Naira",flag:"🇳🇬" },
  { code:"BRL",symbol:"R$",name:"Brazilian Real",flag:"🇧🇷" },
  { code:"SGD",symbol:"S$",name:"Singapore Dollar",flag:"🇸🇬" },
  { code:"SEK",symbol:"kr",name:"Swedish Krona",flag:"🇸🇪" },
  { code:"PLN",symbol:"zł",name:"Polish Zloty",flag:"🇵🇱" },
  { code:"TRY",symbol:"₺",name:"Turkish Lira",flag:"🇹🇷" },
];
const COLORS = ["#3B82F6","#10B981","#8B5CF6","#F97316","#EF4444","#EC4899","#14B8A6","#F59E0B","#6366F1","#84CC16"];
const ICONS  = ["🏦","💳","💰","🏧","💵","🏛️","💼","🌍","🏠","⭐"];

const schema = z.object({
  name: z.string().min(1,"Required"),
  currencyCode: z.string().min(3),
  icon: z.string(),
  color: z.string(),
  currentBalance: z.string().optional().transform((v) => (v&&v.trim().length ? Number(v) : 0)).refine((v) => !Number.isNaN(v),{message:"Must be a number"}),
  isCreditCard: z.boolean().optional().default(false),
  creditLimit: z.string().optional().transform((v) => (v&&v.trim().length ? Number(v) : 0)).refine((v) => !Number.isNaN(v),{message:"Must be a number"}),
});
type F = z.infer<typeof schema>;

const BankAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts]     = useState<BankAccount[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [deleteAcc, setDeleteAcc]   = useState<BankAccount | null>(null);
  const [currSearch, setCurrSearch] = useState("");

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { icon:"🏦", color:"#3B82F6", currencyCode:"EUR", currentBalance: 0, isCreditCard: false, creditLimit: 0 },
  });
  const selectedCurr  = watch("currencyCode");
  const selectedColor = watch("color");
  const selectedIcon  = watch("icon");
  const isCreditCard  = watch("isCreditCard");

  const load = async () => {
    setLoading(true);
    try { const { data } = await bankAccountService.getAll(); setAccounts(Array.isArray(data) ? data : []); }
    catch { setAccounts([]); toast.error("Failed to load bank accounts"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filteredCurrs = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currSearch.toLowerCase()) || c.name.toLowerCase().includes(currSearch.toLowerCase())
  );

  const onSubmit = async (data: F) => {
    try { await bankAccountService.create({ name:data.name, icon:data.isCreditCard?"💳":data.icon, color:data.color, currencyCode:data.currencyCode, currentBalance:data.currentBalance, isCreditCard:data.isCreditCard, creditLimit:data.isCreditCard?data.creditLimit:0 }); toast.success(data.isCreditCard?"Credit card added!":"Account added!"); reset(); setShowModal(false); setCurrSearch(""); load(); }
    catch { toast.error("Failed to add account"); }
  };
  const handleDelete = async () => {
    if (!deleteAcc) return;
    try { await bankAccountService.delete(deleteAcc.id); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
    setDeleteAcc(null); load();
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
      <PageHeader title="Bank Accounts & Cards" subtitle="Manage your accounts, credit cards, and balances." actions={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15}/> Add Account</button>} />

      {/* Bank Accounts Section */}
      {bankAccounts.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Landmark size={16}/> Bank Accounts ({bankAccounts.length})</span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(bankTotalsByCurrency).map(([code, { symbol, total }]) => (
                <span key={code} className="bg-green-50 dark:bg-green-950 rounded-lg px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                  {symbol}{total.toFixed(2)} <span className="text-green-400 font-normal">{code}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {bankAccounts.map(acc => (
              <div key={acc.id} onClick={() => navigate(`/bank-accounts/${acc.id}`)} className="card p-5 relative group cursor-pointer hover:shadow-md transition-shadow">
                <button onClick={() => setDeleteAcc(acc)} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: acc.color+"20" }}>{acc.icon}</div>
                  <div><p className="font-semibold text-gray-900 dark:text-white text-sm">{acc.name}</p><p className="text-xs text-gray-400">{acc.country||"Global"}</p></div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Currency</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.currencySymbol} <span className="text-gray-500 dark:text-gray-400 text-xs">{acc.currencyCode}</span></p></div>
                  <div className="text-right"><p className="text-[11px] text-gray-400 uppercase tracking-wide">Balance</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.currencySymbol}{Number(acc.currentBalance||0).toFixed(2)}</p></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Added on {new Date(acc.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Credit Cards Section */}
      {creditCards.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><CreditCard size={16}/> Credit Cards ({creditCards.length})</span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ccTotalsByCurrency).map(([code, { symbol, totalUsed, totalLimit }]) => (
                <span key={code} className="bg-red-50 dark:bg-red-950 rounded-lg px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                  {symbol}{totalUsed.toFixed(2)} / {symbol}{totalLimit.toFixed(2)} <span className="text-red-400 font-normal">{code}</span>
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
              return (
                <div key={acc.id} onClick={() => navigate(`/bank-accounts/${acc.id}`)} className="card p-5 relative group cursor-pointer hover:shadow-md transition-shadow">
                  <button onClick={() => setDeleteAcc(acc)} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: acc.color+"20" }}>💳</div>
                    <div><p className="font-semibold text-gray-900 dark:text-white text-sm">{acc.name}</p><p className="text-xs text-gray-400">{acc.currencySymbol} {acc.currencyCode}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Limit</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{acc.currencySymbol}{limit.toFixed(2)}</p></div>
                    <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Used</p><p className="text-sm font-semibold text-red-600">{acc.currencySymbol}{used.toFixed(2)}</p></div>
                    <div className="text-right"><p className="text-[11px] text-gray-400 uppercase tracking-wide">Available</p><p className="text-sm font-semibold text-green-600">{acc.currencySymbol}{available.toFixed(2)}</p></div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full transition-all ${usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${usedPct}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-400">Added on {new Date(acc.createdAt).toLocaleDateString()}</p>
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
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div><label className="label">Account Name *</label><input {...register("name")} className="input" placeholder={isCreditCard?"e.g. Visa Gold":"e.g. AIB Current Account"}/>{errors.name&&<p className="text-xs text-red-500 mt-1">Required</p>}</div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <input type="checkbox" id="isCreditCard" {...register("isCreditCard")} className="w-4 h-4 text-primary-600 rounded" onChange={(e) => { setValue("isCreditCard", e.target.checked); if(e.target.checked) setValue("icon","💳"); else setValue("icon","🏦"); }}/>
                <label htmlFor="isCreditCard" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard size={16}/> This is a credit card</label>
              </div>
              <div>
                <label className="label">Currency *</label>
                <input value={currSearch} onChange={e=>setCurrSearch(e.target.value)} className="input mb-2" placeholder="Search currency..."/>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCurrs.map(c=>(
                    <button type="button" key={c.code} onClick={() => { setValue("currencyCode",c.code); setCurrSearch(c.code); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors ${selectedCurr===c.code?"bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400":""}`}>
                      <span className="text-xl">{c.flag}</span><span className="font-semibold">{c.code}</span><span className="text-gray-500 text-xs">{c.name}</span><span className="ml-auto text-gray-400">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">{isCreditCard?"Current Balance Owed":"Current Balance"}</label>
                <div className="relative"><input {...register("currentBalance" as const)} className="input pr-10" placeholder="e.g. 1250.00"/><span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">{selectedCurr||"EUR"}</span></div>
                {errors.currentBalance&&<p className="text-xs text-red-500 mt-1">{String(errors.currentBalance.message)}</p>}
              </div>
              {isCreditCard && (
                <div><label className="label">Credit Limit *</label>
                  <div className="relative"><input {...register("creditLimit" as const)} className="input pr-10" placeholder="e.g. 5000.00"/><span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">{selectedCurr||"EUR"}</span></div>
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
      <ConfirmDialog isOpen={!!deleteAcc} title="Delete Account" message={`Delete "${deleteAcc?.name}"? This won't delete existing transactions.`} onConfirm={handleDelete} onCancel={() => setDeleteAcc(null)} />
    </div>
  );
};
export default BankAccountsPage;

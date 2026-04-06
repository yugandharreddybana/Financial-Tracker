import React, { useEffect, useState } from "react";
import { Sparkles, Lightbulb, TrendingUp, Target } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/useAppDispatch";
import { fetchTransactions } from "../store/slices/transactionSlice";
import { aiService } from "../services/ai.service";
import PageHeader from "../components/ui/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface AIResponse { insights?:string[]; tips?:string[]; advice?:string[]; source?:string; }

const AIInsightsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector(s => s.transactions);
  const [insights, setInsights] = useState<AIResponse|null>(null);
  const [savings, setSavings] = useState<AIResponse|null>(null);
  const [loading, setLoading] = useState<string|null>(null);

  useEffect(()=>{ dispatch(fetchTransactions()); },[dispatch]);

  const getBuildPayload = () => {
    const expenses = transactions.filter(t=>t.type==="EXPENSE").slice(0,30);
    const income = transactions.filter(t=>t.type==="INCOME").slice(0,10);
    return { expenses: expenses.map(t=>({category:t.categoryName,amount:t.amount,description:t.description,date:t.date})), totalExpense: expenses.reduce((s,t)=>s+t.amount,0), totalIncome: income.reduce((s,t)=>s+t.amount,0) };
  };

  const handleGetInsights = async () => {
    setLoading("insights");
    try { const r = await aiService.getInsights(getBuildPayload()); setInsights(r.data); }
    catch { toast.error("AI service unavailable. Make sure middleware is running."); }
    finally { setLoading(null); }
  };

  const handleGetTips = async () => {
    setLoading("tips");
    try { const r = await aiService.getSavingsTips(getBuildPayload()); setSavings(r.data); }
    catch { toast.error("AI service unavailable. Make sure middleware is running."); }
    finally { setLoading(null); }
  };

  const aiSource = (s?:string) => s==="openai"?"✨ Powered by GPT-4o Mini":"🤖 Demo mode (add OPENAI_API_KEY for real AI)";

  return (
    <div>
      <PageHeader title="AI Financial Insights" subtitle="Personalised analysis powered by GPT-4o Mini"/>
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl border border-primary-100 p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0"><Sparkles size={18} className="text-primary-600"/></div>
          <div><h3 className="font-semibold text-gray-900 text-sm mb-1">How it works</h3><p className="text-sm text-gray-600">Your anonymised transaction patterns are sent to GPT-4o Mini for intelligent analysis. No personal data is ever stored by OpenAI. Each analysis is fresh and context-aware.</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><TrendingUp size={18} className="text-blue-600"/><h3 className="text-sm font-semibold text-gray-900">Spending Insights</h3></div>
            <button onClick={handleGetInsights} disabled={loading==="insights"||transactions.length===0} className="btn-primary text-xs">{loading==="insights"?<><LoadingSpinner size="sm"/>Analysing...</>:<><Sparkles size={13}/>Analyse</>}</button>
          </div>
          {insights?(
            <div>
              {insights.source&&<p className="text-xs text-gray-400 mb-3">{aiSource(insights.source)}</p>}
              <div className="space-y-2">{(insights.insights||[]).map((insight,i)=><div key={i} className="flex gap-3 bg-blue-50 rounded-xl px-4 py-3"><span className="text-blue-500 flex-shrink-0 mt-0.5">💡</span><p className="text-sm text-blue-800">{insight}</p></div>)}</div>
            </div>
          ):<div className="text-center py-8"><TrendingUp size={32} className="text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">{transactions.length===0?"Add transactions first":"Click Analyse for spending patterns"}</p></div>}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Lightbulb size={18} className="text-yellow-500"/><h3 className="text-sm font-semibold text-gray-900">Savings Tips</h3></div>
            <button onClick={handleGetTips} disabled={loading==="tips"||transactions.length===0} className="btn-primary text-xs">{loading==="tips"?<><LoadingSpinner size="sm"/>Generating...</>:<><Sparkles size={13}/>Get Tips</>}</button>
          </div>
          {savings?(
            <div>
              {savings.source&&<p className="text-xs text-gray-400 mb-3">{aiSource(savings.source)}</p>}
              <div className="space-y-2">{(savings.tips||[]).map((tip,i)=><div key={i} className="flex gap-3 bg-yellow-50 rounded-xl px-4 py-3"><span className="text-yellow-500 flex-shrink-0 mt-0.5"><Target size={14}/></span><p className="text-sm text-yellow-800">{tip}</p></div>)}</div>
            </div>
          ):<div className="text-center py-8"><Lightbulb size={32} className="text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">{transactions.length===0?"Add transactions first":"Click Get Tips for personalised savings advice"}</p></div>}
        </div>
      </div>
    </div>
  );
};
export default AIInsightsPage;

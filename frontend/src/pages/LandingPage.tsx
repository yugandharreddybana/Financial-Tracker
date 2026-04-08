import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Wallet, PieChart, Bot, ShieldCheck, ArrowRight,
  BarChart3, CreditCard, Target, Repeat, Banknote, Leaf,
} from "lucide-react";

const features = [
  { icon: Wallet, title: "Multi-Currency Accounts", desc: "Track unlimited bank accounts and credit cards across 25+ currencies in one place." },
  { icon: PieChart, title: "Smart Budgets", desc: "Set spending limits by category and get real-time alerts before you overspend." },
  { icon: Bot, title: "AI Financial Advisor", desc: "Get honest, data-driven insights about your finances — no sugar-coating." },
  { icon: Target, title: "Savings Goals", desc: "Set financial targets and watch your progress with visual milestones." },
  { icon: Banknote, title: "Loan Tracker", desc: "Amortization tables, interest tracking, and extra payment simulation." },
  { icon: Repeat, title: "Recurring Payments", desc: "Never miss a subscription or bill with automatic recurring tracking." },
  { icon: BarChart3, title: "Income Analytics", desc: "Understand your income patterns with monthly breakdowns and trends." },
  { icon: CreditCard, title: "Credit Card Management", desc: "Monitor credit utilization, available limits, and payment history." },
  { icon: Leaf, title: "Carbon Footprint", desc: "Track the environmental impact of your spending habits." },
  { icon: ShieldCheck, title: "Net Worth Tracking", desc: "See your complete financial picture — assets vs. liabilities over time." },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">FinanceTracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Bot size={14}/> AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Take control of your<br /><span className="text-primary-600">financial future</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track every dollar across all your accounts. Get brutally honest AI insights.
            Build real wealth with data-driven decisions — not guesswork.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2">
              Start Free <ArrowRight size={18}/>
            </Link>
            <Link to="/login?demo=true" className="px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "25+", label: "Currencies" },
            { value: "∞", label: "Accounts" },
            { value: "AI", label: "Insights" },
            { value: "Free", label: "To Use" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Everything you need to manage money</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">From daily tracking to long-term planning — one unified platform for your entire financial life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:shadow-primary-50 dark:hover:shadow-primary-950 transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                  <f.icon size={20} className="text-primary-600"/>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Bot size={14}/> Powered by AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your AI financial advisor that tells the truth</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            No motivation fluff. No empty praise. Just direct, actionable analysis of your financial habits,
            spending patterns, and what you actually need to change.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { title: "Spending Insights", desc: "Understand where your money really goes with categorized breakdowns and anomaly detection." },
              { title: "Savings Strategy", desc: "Get a personalized savings plan based on your actual income and expense patterns." },
              { title: "Health Score", desc: "A real-time score reflecting your financial health — savings rate, debt ratio, and more." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to take control?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Create your free account in 30 seconds. No credit card required.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">
            Create Free Account <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-600"/>
            <span>FinanceTracker</span>
          </div>
          <p>Built with purpose. © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;

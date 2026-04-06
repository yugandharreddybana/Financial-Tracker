import React, { useEffect, useState } from "react";
import { Moon, SunMedium, Bell, User2 } from "lucide-react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import toast from "react-hot-toast";

const Topbar: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (localStorage.getItem("ft-theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("ft-theme", theme);
  }, [theme]);

  const handleSoon = () => {
    toast("Notifications coming soon ✨", { icon: "🔔" });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
          Personal Finance Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Stay on top of your money, savings and carbon footprint.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSoon}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-50 dark:ring-slate-950" />
        </button>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 text-xs font-medium transition-colors"
        >
          {theme === "light" ? <Moon size={14} /> : <SunMedium size={14} />}
          <span className="hidden sm:inline">
            {theme === "light" ? "Dark" : "Light"} mode
          </span>
        </button>
        <div className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium shadow-sm">
          <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
            <User2 size={14} />
          </div>
          <span className="max-w-[120px] truncate">
            Hi, {user?.firstName || "Guest"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

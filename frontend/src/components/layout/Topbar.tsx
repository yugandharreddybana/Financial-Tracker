import React from "react";
import { Bell, Menu, User2, Moon, Sun } from "lucide-react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { useTheme } from "../../hooks/useTheme";
import toast from "react-hot-toast";

interface TopbarProps { onMenuToggle?: () => void; }

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const user = useAppSelector((s) => s.auth.user);
  const { isDark, toggle: toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            className="lg:hidden p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onMenuToggle}
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
            Personal Finance Tracker
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Stay on top of your money, savings and carbon footprint.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => toast("Notifications coming soon", { icon: "🔔" })}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
        </button>
        <div className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 text-white text-xs font-medium shadow-sm">
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

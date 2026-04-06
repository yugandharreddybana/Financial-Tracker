import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppDispatch";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout: React.FC = () => {
  const { token } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col max-h-screen">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIChatWidget from "../chat/AIChatWidget";
import { useIdleLogout } from "../../hooks/useIdleLogout";

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useIdleLogout();

  return (
    // h-screen + overflow-hidden on the root ensures neither the sidebar nor
    // the main area can ever grow taller than the viewport
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* Sidebar — always rendered; visibility controlled internally */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column: topbar + scrollable page content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Widget — floating on all pages */}
      <AIChatWidget />
    </div>
  );
};

export default AppLayout;

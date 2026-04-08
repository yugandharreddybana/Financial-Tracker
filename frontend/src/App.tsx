import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./hooks/useAppDispatch";
import { useTheme } from "./hooks/useTheme";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import IncomeAnalyticsPage from "./pages/IncomeAnalyticsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import TransactionsPage from "./pages/TransactionsPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import BudgetsPage from "./pages/BudgetsPage";
import GoalsPage from "./pages/GoalsPage";
import RecurringPage from "./pages/RecurringPage";
import CategoriesPage from "./pages/CategoriesPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import HealthScorePage from "./pages/HealthScorePage";
import NetWorthPage from "./pages/NetWorthPage";
import CarbonPage from "./pages/CarbonPage";
import MonthlyReviewPage from "./pages/MonthlyReviewPage";
import LoansPage from "./pages/LoansPage";
import BankAccountDetailPage from "./pages/BankAccountDetailPage";
import LandingPage from "./pages/LandingPage";
import LoanDetailPage from "./pages/LoanDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const App: React.FC = () => {
  useTheme(); // Ensure saved theme is applied on all pages (login, register, etc.)
  const { token } = useAppSelector(s => s.auth);
  return (
    <Routes>
      <Route path="/" element={!token ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!token ? <ForgotPasswordPage /> : <Navigate to="/dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/income" element={<IncomeAnalyticsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/bank-accounts" element={<BankAccountsPage />} />
        <Route path="/bank-accounts/:id" element={<BankAccountDetailPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/recurring" element={<RecurringPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/health-score" element={<HealthScorePage />} />
        <Route path="/net-worth" element={<NetWorthPage />} />
        <Route path="/carbon" element={<CarbonPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/review" element={<MonthlyReviewPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
};
export default App;

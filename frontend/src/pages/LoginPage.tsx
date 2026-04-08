import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TrendingUp, Play } from "lucide-react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { login } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type F = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });
  const [demoLoading, setDemoLoading] = React.useState(false);

  const onSubmit = async (data: F) => {
    try { await dispatch(login(data)).unwrap(); toast.success("Welcome back!"); navigate("/dashboard"); }
    catch (e: any) { toast.error(e || "Invalid credentials"); }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await dispatch(login({ email: "demo@financetracker.com", password: "Demo@1234" })).unwrap();
      toast.success("Welcome to the demo!");
      navigate("/dashboard");
    } catch (e: any) { toast.error("Demo login failed. Please try again."); }
    finally { setDemoLoading(false); }
  };

  // Auto-trigger demo login if coming from landing page
  React.useEffect(() => {
    if (searchParams.get("demo") === "true") handleDemoLogin();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your FinanceTracker</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" className="input" placeholder="you@example.com" autoFocus />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input {...register("password")} type="password" className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link></p>
          <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"/></div><div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-gray-900 px-3 text-gray-400">or</span></div></div>
          <button type="button" onClick={handleDemoLogin} disabled={demoLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {demoLoading ? <LoadingSpinner size="sm" /> : <><Play size={14}/> Try Demo Account</>}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;

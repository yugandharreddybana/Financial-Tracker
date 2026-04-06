import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { login } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type F = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    try { await dispatch(login(data)).unwrap(); navigate("/dashboard"); }
    catch (e: any) { toast.error(e || "Invalid credentials"); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your FinanceTracker</p>
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
        </div>
      </div>
    </div>
  );
};
export default LoginPage;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TrendingUp, ArrowLeft, Copy, Check } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });
const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Min 8 chars").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use upper, lower, number, and special char"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [resetToken, setResetToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const handleRequestToken = async (data: EmailForm) => {
    try {
      const res = await api.post("/auth/forgot-password", data);
      setResetToken(res.data.resetToken);
      setStep(2);
      toast.success("Reset token generated!");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to generate reset token");
    }
  };

  const handleResetPassword = async (data: ResetForm) => {
    try {
      await api.post("/auth/reset-password", { token: data.token, newPassword: data.newPassword });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to reset password");
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {success ? "Password Reset!" : step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {success ? "You can now sign in with your new password." : step === 1 ? "Enter your email to get a reset token" : "Enter the token and your new password"}
          </p>
        </div>

        <div className="card p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your password has been updated successfully.</p>
              <Link to="/login" className="btn-primary w-full justify-center inline-flex">Back to Sign In</Link>
            </div>
          ) : step === 1 ? (
            <form onSubmit={emailForm.handleSubmit(handleRequestToken)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input {...emailForm.register("email")} type="email" className="input" placeholder="you@example.com" autoFocus />
                {emailForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.email.message}</p>}
              </div>
              <button type="submit" disabled={emailForm.formState.isSubmitting} className="btn-primary w-full justify-center">
                {emailForm.formState.isSubmitting ? <LoadingSpinner size="sm" /> : "Get Reset Token"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">Your Reset Token</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white dark:bg-gray-800 rounded-lg px-3 py-2 font-mono text-gray-900 dark:text-white break-all">{resetToken}</code>
                  <button type="button" onClick={handleCopyToken} className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition-colors shrink-0">
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-amber-700" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">This token expires in 1 hour. Do not share it.</p>
              </div>

              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <div>
                  <label className="label">Reset Token</label>
                  <input {...resetForm.register("token")} className="input font-mono text-xs" placeholder="Paste your token here" />
                  {resetForm.formState.errors.token && <p className="text-xs text-red-500 mt-1">{resetForm.formState.errors.token.message}</p>}
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input {...resetForm.register("newPassword")} type="password" className="input" placeholder="••••••••" />
                  {resetForm.formState.errors.newPassword && <p className="text-xs text-red-500 mt-1">{resetForm.formState.errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input {...resetForm.register("confirmPassword")} type="password" className="input" placeholder="••••••••" />
                  {resetForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={resetForm.formState.isSubmitting} className="btn-primary w-full justify-center">
                  {resetForm.formState.isSubmitting ? <LoadingSpinner size="sm" /> : "Reset Password"}
                </button>
              </form>
            </div>
          )}

          {!success && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

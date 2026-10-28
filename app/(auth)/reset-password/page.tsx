"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth-api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reset password. The link may have expired.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4 flex flex-col gap-3">
        <p className="text-xs text-rose-600 font-semibold">
          Invalid or expired password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div>
      {success ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md text-center flex flex-col gap-2">
          <p className="font-bold">Password Reset Successful!</p>
          <p>Redirecting you to the sign in page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-[#171514] text-white font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 font-sans text-[#151413]">
      <div className="w-full max-w-md bg-white border border-[#EAE8E4] rounded-lg p-8 shadow-xs">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Set New Password
          </h1>
          <p className="text-xs text-[#76726E] mt-1">
            Enter your new secure password below to regain access.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-xs text-[#76726E]">Loading...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

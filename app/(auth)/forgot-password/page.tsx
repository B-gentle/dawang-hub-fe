"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to request password reset. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 font-sans text-[#151413]">
      <div className="w-full max-w-md bg-white border border-[#EAE8E4] rounded-lg p-8 shadow-xs">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Reset Password
          </h1>
          <p className="text-xs text-[#76726E] mt-1">
            Enter your account email address and we&apos;ll send you a recovery
            link.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md leading-relaxed">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-[#171514] text-white font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#76726E]">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#C4956A] underline uppercase tracking-wider"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

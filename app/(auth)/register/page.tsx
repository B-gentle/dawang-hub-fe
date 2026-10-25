"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield } from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { RegisterInput } from "@/lib/api/auth-api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const [formData, setFormData] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await apiClient.register(formData);
      toast.success("Account created successfully!");
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Dawang Stores
          </span>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#151413]">
            Create An Account
          </h1>
          <p className="text-xs text-[#76726E]">
            Join us for express checkout, order tracking, and exclusive updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#76726E] pt-1">
            <FiShield className="w-3.5 h-3.5 text-[#C4956A] shrink-0" />
            <span>
              Your personal data is protected under encryption guidelines.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register Now"}{" "}
            <FiArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EAE8E4] flex justify-center text-xs text-[#76726E]">
          <span>Already registered?</span>
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="ml-1.5 font-bold text-[#151413] hover:text-[#C4956A] underline uppercase tracking-wider"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

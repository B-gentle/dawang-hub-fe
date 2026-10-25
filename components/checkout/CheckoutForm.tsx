"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiLogIn,
} from "react-icons/fi";

export interface ShippingAddressData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  orderNotes?: string;
}

interface UserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: ShippingAddressData) => void;
  isProcessing: boolean;
  isLoggedIn: boolean;
  user?: UserProfileData | null;
}

export default function CheckoutForm({
  onSubmit,
  isProcessing,
  isLoggedIn,
  user,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<ShippingAddressData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "Port Harcourt",
    state: "Rivers",
    orderNotes: "",
  });

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || prev.firstName,
          lastName: user.lastName || prev.lastName,
          email: user.email || prev.email,
          phoneNumber: user.phoneNumber || prev.phone,
          streetAddress: user.streetAddress || prev.streetAddress,
          city: user.city || prev.city,
          state: user.state || prev.state,
        }));
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 font-sans text-[#151413]"
    >
      {!isLoggedIn && (
        <div className="p-4 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex items-center justify-between text-xs text-[#76726E]">
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4 text-[#C4956A]" />
            <span>Already have an account with us?</span>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="font-bold text-[#151413] hover:text-[#C4956A] uppercase tracking-wider underline flex items-center gap-1"
          >
            <FiLogIn className="w-3.5 h-3.5" /> Log In
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#EAE8E4]">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
            <FiUser className="w-4 h-4 text-[#C4956A]" /> 1. Contact Information
          </h2>
          {isLoggedIn && (
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-xs">
              Logged In
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Dawang"
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Stores"
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="customer@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2 pb-2 border-b border-[#EAE8E4]">
          <FiMapPin className="w-4 h-4 text-[#C4956A]" /> 2. Delivery Address
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
            Street Address *
          </label>
          <input
            type="text"
            name="streetAddress"
            required
            value={formData.streetAddress}
            onChange={handleChange}
            placeholder="House Number, Street Name, Estate/Area"
            className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              City *
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="Port Harcourt"
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              State *
            </label>
            <select
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
            >
              <option value="Rivers">Rivers State</option>
              <option value="Lagos">Lagos State</option>
              <option value="Abuja">Abuja (FCT)</option>
              <option value="Delta">Delta State</option>
              <option value="Akwa Ibom">Akwa Ibom State</option>
              <option value="Edo">Edo State</option>
              <option value="Enugu">Enugu State</option>
              <option value="Other">Other States (Nationwide Delivery)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
            Delivery Notes (Optional)
          </label>
          <textarea
            name="orderNotes"
            rows={2}
            value={formData.orderNotes}
            onChange={handleChange}
            placeholder="Special instructions for the dispatch agent..."
            className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2 pb-2 border-b border-[#EAE8E4]">
          <FiCreditCard className="w-4 h-4 text-[#C4956A]" /> 3. Payment Method
        </h2>

        <div className="p-4 border border-[#C4956A] bg-[#C4956A]/5 rounded-md flex items-center gap-3">
          <FiCreditCard className="w-5 h-5 text-[#C4956A] shrink-0" />
          <div className="flex flex-col text-xs">
            <span className="font-bold text-[#151413]">
              Paystack Online Gateway
            </span>
            <span className="text-[11px] text-[#76726E]">
              Pay securely via Debit Card, Bank Transfer, or USSD
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="mt-4 w-full py-4 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
      >
        {isProcessing ? "Preparing Gateway..." : "Proceed to Secure Payment"}
      </button>
    </form>
  );
}

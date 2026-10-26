"use client";

import { useState } from "react";
import {
  LuSearch,
  LuTruck,
  LuRefreshCcw,
  LuShieldCheck,
  LuCircle,
  LuChevronDown,
  LuMail,
} from "react-icons/lu";

interface FAQItem {
  question: string;
  answer: string;
  category: "shipping" | "returns" | "orders" | "payments";
}

const FAQS: FAQItem[] = [
  {
    category: "shipping",
    question: "What are your delivery timelines across Nigeria?",
    answer:
      "Standard doorstep delivery within Lagos takes 1–2 business days. Express Nationwide shipping to major cities (Abuja, Port Harcourt, Kano, etc.) takes 3–5 business days.",
  },
  {
    category: "shipping",
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship globally via DHL Express. International transit times range between 5 and 7 business days depending on customs processing.",
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer:
      "We accept returns within 7 days of delivery for unworn, unused items with all original security tags intact. Refunds are processed to your original payment method.",
  },
  {
    category: "orders",
    question: "How do I track my order status?",
    answer:
      "Once your order is dispatched, you will receive an SMS and email with a live tracking link and courier waybill number.",
  },
  {
    category: "payments",
    question: "Which payment options are accepted?",
    answer:
      "We accept all major debit/credit cards (Visa, Mastercard, Verve), Paystack instant bank transfers, and Apple Pay.",
  },
];

export default function PublicHelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    if (activeCategory !== "all" && faq.category !== activeCategory)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Hero Search Section */}
      <section className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-12 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            CUSTOMER CARE
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#151413]">
            How Can We Assist You?
          </h1>
          <p className="text-xs text-[#76726E] max-w-md">
            Find quick answers regarding shipping timelines, returns, sizing,
            and order tracking.
          </p>

          <div className="relative w-full max-w-md mt-4">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            <input
              type="text"
              placeholder="Search help articles, orders, returns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] shadow-xs placeholder-[#A39E98]"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-10">
        {/* Quick Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveCategory("shipping")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory === "shipping"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuTruck className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Shipping & Delivery
            </h3>
            <p className="text-[10px] opacity-75">Timelines & tracking</p>
          </button>

          <button
            onClick={() => setActiveCategory("returns")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory === "returns"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuRefreshCcw className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Returns & Exchange
            </h3>
            <p className="text-[10px] opacity-75">7-day return policy</p>
          </button>

          <button
            onClick={() => setActiveCategory("orders")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory === "orders"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuCircle className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Order Support
            </h3>
            <p className="text-[10px] opacity-75">Status & cancellations</p>
          </button>

          <button
            onClick={() => setActiveCategory("payments")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory === "payments"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuShieldCheck className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Secure Payment
            </h3>
            <p className="text-[10px] opacity-75">Cards & bank transfers</p>
          </button>
        </div>

        {/* FAQ Accordions */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#EAE8E4]">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
            {activeCategory !== "all" && (
              <button
                onClick={() => setActiveCategory("all")}
                className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#76726E] bg-[#FAF9F6] rounded-md">
              No matching help topics found. Contact our support team directly.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#EAE8E4] rounded-lg overflow-hidden transition-colors bg-white"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full text-left p-4 font-bold text-xs text-[#151413] flex justify-between items-center cursor-pointer hover:bg-[#FAF9F6]"
                    >
                      <span>{faq.question}</span>
                      <LuChevronDown
                        className={`w-4 h-4 text-[#C4956A] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-[#76726E] leading-relaxed border-t border-[#EAE8E4]/50 bg-[#FAF9F6]/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Support Banner */}
        <div className="p-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#171514] text-white rounded-md">
              <LuMail className="w-5 h-5 text-[#C4956A]" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Still Need Assistance?
              </h4>
              <p className="text-[11px] text-[#76726E]">
                Our concierge team is available Monday to Saturday, 9am – 6pm.
              </p>
            </div>
          </div>
          <a
            href="mailto:support@dawanghub.com"
            className="px-5 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

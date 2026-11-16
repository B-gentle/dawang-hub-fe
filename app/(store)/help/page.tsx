"use client";

import { useEffect, useState } from "react";
import {
  LuSearch,
  LuTruck,
  LuRefreshCcw,
  LuShieldCheck,
  LuCircle,
  LuChevronDown,
  LuMail,
  LuRefreshCw,
} from "react-icons/lu";
import { helpCenterApi, HelpArticle } from "@/lib/api/help-center-api";
import { systemConfigApi } from "@/lib/api/system-config-api";

export default function PublicHelpCenterPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [whatsappContact, setWhatsappContact] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      helpCenterApi.getPublishedArticles().catch(() => [] as HelpArticle[]),
      systemConfigApi.getPublicConfig().catch(() => null),
    ])
      .then(([data, config]) => {
        if (!isMounted) return;
        setArticles(Array.isArray(data) ? data : []);
        if (config?.whatsappContact) {
          setWhatsappContact(config.whatsappContact);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles = articles.filter((art) => {
    if (
      activeCategory !== "all" &&
      art.category.toLowerCase() !== activeCategory.toLowerCase()
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleCategory = (cat: string) => {
    setActiveCategory((prev) =>
      prev.toLowerCase() === cat.toLowerCase() ? "all" : cat,
    );
    setOpenIndex(0);
  };

  const whatsappDigits = whatsappContact.replace(/\D/g, "");
  const supportHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : "mailto:support@dawanghub.com";

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
            Find quick answers regarding shipping timelines, returns, escrow
            protection, and order tracking.
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
            type="button"
            onClick={() => toggleCategory("Shipping")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory.toLowerCase() === "shipping"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuTruck className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Shipping &amp; Delivery
            </h3>
            <p className="text-[10px] opacity-75">Timelines &amp; tracking</p>
          </button>

          <button
            type="button"
            onClick={() => toggleCategory("Returns")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory.toLowerCase() === "returns"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuRefreshCcw className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Returns &amp; Escrow
            </h3>
            <p className="text-[10px] opacity-75">Buyer protection policy</p>
          </button>

          <button
            type="button"
            onClick={() => toggleCategory("Orders")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory.toLowerCase() === "orders"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuCircle className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Order Support
            </h3>
            <p className="text-[10px] opacity-75">Status &amp; confirmations</p>
          </button>

          <button
            type="button"
            onClick={() => toggleCategory("Payments")}
            className={`p-5 rounded-lg border text-left flex flex-col gap-2 transition-all cursor-pointer ${
              activeCategory.toLowerCase() === "payments"
                ? "bg-[#171514] text-white border-[#171514]"
                : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
            }`}
          >
            <LuShieldCheck className="w-5 h-5 text-[#C4956A]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Secure Payment
            </h3>
            <p className="text-[10px] opacity-75">Cards &amp; bank transfers</p>
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
                type="button"
                onClick={() => setActiveCategory("all")}
                className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E] bg-[#FAF9F6] rounded-md">
              <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
              Loading help center articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#76726E] bg-[#FAF9F6] rounded-md">
              No matching help topics found. Contact our support team directly.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredArticles.map((article, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={article.id}
                    className="border border-[#EAE8E4] rounded-lg overflow-hidden transition-colors bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full text-left p-4 font-bold text-xs text-[#151413] flex justify-between items-center gap-3 cursor-pointer hover:bg-[#FAF9F6]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#C4956A] shrink-0">
                          {article.category}
                        </span>
                        <span>{article.title}</span>
                      </div>
                      <LuChevronDown
                        className={`w-4 h-4 text-[#C4956A] shrink-0 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-3 text-xs text-[#76726E] leading-relaxed border-t border-[#EAE8E4]/50 bg-[#FAF9F6]/50 whitespace-pre-line">
                        {article.content}
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
            href={supportHref}
            target={whatsappDigits ? "_blank" : undefined}
            rel={whatsappDigits ? "noopener noreferrer" : undefined}
            className="px-5 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

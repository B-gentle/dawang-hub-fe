"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiRefreshCw, FiShield } from "react-icons/fi";
import { systemConfigApi, SystemConfig } from "@/lib/api/system-config-api";

interface LegalDocumentViewProps {
  badge: string;
  title: string;
  field: "termsAndConditions" | "privacyPolicy";
  defaultHtml: string;
  alternateLink: { href: string; label: string };
}

export default function LegalDocumentView({
  badge,
  title,
  field,
  defaultHtml,
  alternateLink,
}: LegalDocumentViewProps) {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    systemConfigApi
      .getPublicConfig()
      .then((res) => {
        if (active) setConfig(res);
      })
      .catch(() => null)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const htmlContent = config?.[field]?.trim() || defaultHtml;
  const lastUpdated = config?.updatedAt
    ? new Date(config.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "November 2026";

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Banner */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#76726E] hover:text-[#151413]"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <Link
              href={alternateLink.href}
              className="text-[11px] font-bold uppercase tracking-wider text-[#C4956A] hover:underline"
            >
              {alternateLink.label} →
            </Link>
          </div>

          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em] mt-2">
            {badge}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-[#76726E] flex items-center gap-1.5">
            <FiShield className="w-3.5 h-3.5 text-[#C4956A]" />
            Last Updated:{" "}
            <strong className="text-[#151413]">{lastUpdated}</strong>
          </p>
        </div>
      </div>

      {/* Document Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
            <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
            Loading document...
          </div>
        ) : (
          <article
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="text-sm leading-relaxed text-[#2D2B2A] [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-[#151413] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[#EAE8E4] [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#151413] [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:pl-1 [&_strong]:text-[#151413] [&_a]:text-[#C4956A] [&_a]:underline"
          />
        )}
      </div>
    </div>
  );
}

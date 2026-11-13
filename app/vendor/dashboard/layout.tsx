"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LuLayoutDashboard,
  LuPackage,
  LuShoppingBag,
  LuStore,
  LuExternalLink,
  LuClock,
  LuMenu,
  LuX,
} from "react-icons/lu";
import { vendorApi, VendorProfile } from "@/lib/api/vendor-api";

const NAV_ITEMS = [
  { label: "Overview", href: "/vendor/dashboard", icon: LuLayoutDashboard },
  { label: "Products", href: "/vendor/dashboard/products", icon: LuPackage },
  { label: "Orders", href: "/vendor/dashboard/orders", icon: LuShoppingBag },
  { label: "Storefront", href: "/vendor/dashboard/settings", icon: LuStore },
];

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    vendorApi
      .getMyStore()
      .then((data) => {
        if (active) setVendor(data);
      })
      .catch(() => {
        // User has no vendor profile yet -> send to builder
        if (active) router.replace("/vendor/setup");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-[#76726E]">
        Loading Storefront Workspace...
      </div>
    );
  }

  if (!vendor) return null;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "dawang.com";
  const storeUrl =
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost")
      ? `http://${vendor.slug}.localhost:3000`
      : `https://${vendor.slug}.${rootDomain}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#151413] font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#EAE8E4] transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-6 border-b border-[#EAE8E4] flex items-center justify-between">
          <div className="truncate">
            <p className="font-heading text-xs font-bold uppercase tracking-widest truncate">
              {vendor.storeName}
            </p>
            <p className="text-[10px] font-mono text-[#C4956A] truncate">
              {vendor.slug}.{rootDomain}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#76726E]"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[#151413] text-white"
                    : "text-[#76726E] hover:bg-[#FAF9F6] hover:text-[#151413]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#C4956A]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Top Header */}
      <header className="lg:pl-64 fixed top-0 inset-x-0 z-30 h-16 bg-white border-b border-[#EAE8E4] px-4 sm:px-8 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md border border-[#EAE8E4]"
        >
          <LuMenu className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-4">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              vendor.status === "APPROVED"
                ? "bg-emerald-50 text-emerald-700"
                : vendor.status === "SUSPENDED"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {vendor.status}
          </span>

          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:border-[#C4956A]"
          >
            Visit Store{" "}
            <LuExternalLink className="w-3.5 h-3.5 text-[#C4956A]" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
          {vendor.status === "PENDING" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <LuClock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider">
                  Storefront Pending Verification
                </p>
                <p className="mt-0.5 text-amber-800">
                  Your Monnify subaccount ({vendor.accountName} •{" "}
                  {vendor.bankName}) is linked. Once an admin approves your
                  store, your public subdomain will go live and you can publish
                  products.
                </p>
              </div>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}

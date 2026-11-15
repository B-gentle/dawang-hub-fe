"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LuLayoutDashboard,
  LuPackage,
  LuShoppingBag,
  LuWallet,
  LuStore,
  LuExternalLink,
  LuClock,
  LuMenu,
  LuX,
  LuLogOut,
  LuUser,
  LuCrown,
  LuFolderTree,
} from "react-icons/lu";
import { toast } from "sonner";
import { vendorApi, VendorProfile } from "@/lib/api/vendor-api";
import { authApi, UserProfile } from "@/lib/api/auth-api";

const NAV_ITEMS = [
  { label: "Overview", href: "/vendor/dashboard", icon: LuLayoutDashboard },
  { label: "Products", href: "/vendor/dashboard/products", icon: LuPackage },
  {
    label: "Categories",
    href: "/vendor/dashboard/categories",
    icon: LuFolderTree,
  },
  { label: "Orders", href: "/vendor/dashboard/orders", icon: LuShoppingBag },
  {
    label: "Wallet & Payouts",
    href: "/vendor/dashboard/wallet",
    icon: LuWallet,
  },
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([vendorApi.getMyStore(), authApi.getMe().catch(() => null)])
      .then(([vendorData, userData]) => {
        if (active) {
          setVendor(vendorData);
          setUser(userData);
        }
      })
      .catch(() => {
        if (active) router.replace("/vendor/setup");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = () => {
    authApi.logout();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-[#76726E]">
        Loading Storefront Workspace...
      </div>
    );
  }

  if (!vendor) return null;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com";
  const storeUrl =
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost")
      ? `http://${vendor.slug}.localhost:3000`
      : `https://${vendor.slug}.${rootDomain}`;

  const planLabel =
    vendor.planName || vendor.subscriptionPlan || "Standard Plan";
  const rawExpiry =
    vendor.planExpiresAt || vendor.subscriptionExpiresAt || vendor.expiresAt;
  const formattedExpiry = rawExpiry
    ? new Date(rawExpiry).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const isExpired = rawExpiry ? new Date(rawExpiry) < new Date() : false;

  const userDisplayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : vendor.accountName || "Vendor Account";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#151413] font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#EAE8E4] flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-6 border-b border-[#EAE8E4] flex items-center justify-between shrink-0">
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

        <nav className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto">
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

        {/* Bottom Profile & Logout Section */}
        <div className="p-4 border-t border-[#EAE8E4] bg-[#FAF9F6]/60 flex flex-col gap-2 shrink-0">
          <Link
            href="/account"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white border border-[#EAE8E4] hover:border-[#C4956A] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#151413] text-white flex items-center justify-center shrink-0 group-hover:bg-[#C4956A] transition-colors">
              <LuUser className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#151413] truncate">
                {userDisplayName}
              </p>
              <p className="text-[10px] text-[#76726E] truncate">
                {user?.email || "Manage Profile"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer"
          >
            <LuLogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="lg:pl-64 fixed top-0 inset-x-0 z-30 h-16 bg-white border-b border-[#EAE8E4] px-4 sm:px-8 flex items-center justify-between gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md border border-[#EAE8E4]"
        >
          <LuMenu className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] ${
              isExpired
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-[#FAF9F6] border-[#EAE8E4] text-[#151413]"
            }`}
          >
            <LuCrown className="w-3.5 h-3.5 text-[#C4956A] shrink-0" />
            <span className="font-bold uppercase tracking-wider">
              {planLabel}
            </span>
            {formattedExpiry && (
              <>
                <span className="text-[#EAE8E4]">|</span>
                <span className="text-[10px] text-[#76726E]">
                  {isExpired ? "Expired:" : "Expires:"}{" "}
                  <strong className="text-[#151413]">{formattedExpiry}</strong>
                </span>
              </>
            )}
          </div>

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
                  Your payout account ({vendor.accountName} • {vendor.bankName})
                  is linked. Once an admin approves your store, your public
                  subdomain will go live and you can publish products.
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

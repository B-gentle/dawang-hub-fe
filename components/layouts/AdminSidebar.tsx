"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LuLayoutGrid,
  LuShoppingBag,
  LuPackage,
  LuUsers,
  LuChartBar,
  LuSettings,
  LuCircle,
  LuX,
  LuLogOut,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const fetchAdminOrdersCount = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) return;

      try {
        const orders = await apiClient.getAllOrdersAdmin();
        if (active) {
          setOrderCount(orders.total);
        }
      } catch (err) {
        console.warn("Could not fetch admin system orders count:", err);
      }
    };

    fetchAdminOrdersCount();

    return () => {
      active = false;
    };
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    apiClient.logout();
    toast.info("Logged out from studio");
    router.push("/login");
    router.refresh();
  };

  const workspaceLinks = [
    { label: "Overview", href: "/admin", icon: LuLayoutGrid },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: LuShoppingBag,
      badge: orderCount !== null && orderCount > 0 ? orderCount : undefined,
    },
    { label: "Products", href: "/admin/products", icon: LuPackage },
    { label: "Customers", href: "/admin/customers", icon: LuUsers },
    { label: "Analytics", href: "/admin/analytics", icon: LuChartBar },
  ];

  const settingsLinks = [
    { label: "Store settings", href: "/admin/settings", icon: LuSettings },
    { label: "Help center", href: "/admin/help", icon: LuCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1E1C1A] text-[#A39E98] border-r border-[#2A2725] flex flex-col justify-between z-50 overflow-y-auto transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 justify-between">
          <div>
            {/* Brand Header */}
            <div className="p-6 border-b border-[#2A2725] bg-[#171514] flex items-center justify-between">
              <Link
                href="/admin"
                onClick={onClose}
                className="flex flex-col items-center text-center w-full"
              >
                <span className="font-heading text-2xl font-bold tracking-[0.25em] text-white leading-none">
                  DAWANGHUB
                </span>
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C4956A] mt-1">
                  ADMIN STUDIO
                </span>
              </Link>
              <button
                onClick={onClose}
                className="lg:hidden text-[#A39E98] hover:text-white p-1 cursor-pointer"
                aria-label="Close menu"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* WORKSPACE Links */}
            <div className="p-4 flex flex-col gap-1">
              <span className="px-3 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#6B655F]">
                WORKSPACE
              </span>
              {workspaceLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#C4956A] text-white"
                        : "hover:bg-[#2A2725] hover:text-white text-[#A39E98]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-white text-[#1E1C1A]"
                            : "bg-[#2A2725] text-[#A39E98]"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* SETTINGS Links */}
            <div className="p-4 flex flex-col gap-1 border-t border-[#2A2725] mt-2">
              <span className="px-3 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#6B655F]">
                SETTINGS
              </span>
              {settingsLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#C4956A] text-white"
                        : "hover:bg-[#2A2725] hover:text-white text-[#A39E98]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer / Logout */}
          <div className="p-4 border-t border-[#2A2725]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium text-[#A39E98] hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LuLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutGrid,
  LuShoppingBag,
  LuPackage,
  LuUsers,
  LuChartBar,
  LuSettings,
  LuCircle,
  LuX,
} from "react-icons/lu";

const WORKSPACE_LINKS = [
  { label: "Overview", href: "/admin", icon: LuLayoutGrid },
  { label: "Orders", href: "/admin/orders", icon: LuShoppingBag, badge: 12 },
  { label: "Products", href: "/admin/products", icon: LuPackage },
  { label: "Customers", href: "/admin/customers", icon: LuUsers },
  { label: "Analytics", href: "/admin/analytics", icon: LuChartBar },
];

const SETTINGS_LINKS = [
  { label: "Store settings", href: "/admin/settings", icon: LuSettings },
  { label: "Help center", href: "/admin/help", icon: LuCircle },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

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
              className="lg:hidden text-[#A39E98] hover:text-white p-1"
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
            {WORKSPACE_LINKS.map((link) => {
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
                  {link.badge && (
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
            {SETTINGS_LINKS.map((link) => {
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
      </aside>
    </>
  );
}

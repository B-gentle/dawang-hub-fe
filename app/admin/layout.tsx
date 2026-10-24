"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminHeader } from "@/components/layouts/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Dynamic left margin based on desktop breakpoint */}
      <main className="lg:pl-64 pt-16 min-h-screen transition-all">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

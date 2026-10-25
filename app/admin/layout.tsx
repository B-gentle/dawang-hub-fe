"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminProfile = async () => {
      try {
        const user = (await apiClient.getMe()) as UserProfile;
        if (isMounted && user) {
          setAdminUser(user);
        }
      } catch (err) {
        console.warn("Could not fetch admin profile for header:", err);
      }
    };

    fetchAdminProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <AdminHeader
        onMenuClick={() => setIsSidebarOpen(true)}
        user={adminUser}
      />

      <main className="lg:pl-64 pt-16 min-h-screen transition-all">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

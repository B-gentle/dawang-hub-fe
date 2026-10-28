"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { NotificationsDrawer } from "@/components/admin/NotificationsDrawer";
import { apiClient } from "@/lib/api-client";
import { notificationsApi } from "@/lib/api/notifications-api";
import { UserProfile } from "@/lib/api/auth-api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getMyNotifications(1, 1);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.warn("Could not fetch unread notifications count:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const [user, notifs] = await Promise.allSettled([
          apiClient.getMe() as Promise<UserProfile>,
          notificationsApi.getMyNotifications(1, 1),
        ]);

        if (!isMounted) return;

        if (user.status === "fulfilled" && user.value) {
          setAdminUser(user.value);
        }

        if (notifs.status === "fulfilled" && notifs.value) {
          setUnreadCount(notifs.value.unreadCount || 0);
        }
      } catch (err) {
        console.warn("Could not initialize layout data:", err);
      }
    };

    initData();

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
        unreadCount={unreadCount}
        onNotificationClick={() => setIsNotificationsOpen(true)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationChange={fetchUnreadCount}
      />

      <main className="lg:pl-64 pt-16 min-h-screen transition-all">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  LuX,
  LuCheckCheck,
  LuBell,
  LuInfo,
  LuShoppingBag,
  LuShieldAlert,
  LuTag,
} from "react-icons/lu";
import {
  notificationsApi,
  NotificationItem,
} from "@/lib/api/notifications-api";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationChange?: () => void;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  onNotificationChange,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationsApi.getMyNotifications(1, 20);
        if (isMounted) {
          setNotifications(res.items || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      onNotificationChange?.();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setActionLoading(true);
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
      onNotificationChange?.();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "ORDER_STATUS":
        return <LuShoppingBag className="w-4 h-4 text-emerald-600" />;
      case "SECURITY":
        return <LuShieldAlert className="w-4 h-4 text-rose-600" />;
      case "PROMOTION":
        return <LuTag className="w-4 h-4 text-[#C4956A]" />;
      default:
        return <LuInfo className="w-4 h-4 text-blue-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#EAE8E4] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#EAE8E4] flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-2">
              <LuBell className="w-5 h-5 text-[#1A1A1A]" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C4956A] text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#76726E] hover:text-[#1A1A1A] hover:bg-[#EAE8E4] rounded-md transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          {unreadCount > 0 && (
            <div className="px-6 py-2.5 bg-[#FAF9F6] border-b border-[#EAE8E4] flex justify-end">
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
                className="text-xs font-semibold text-[#C4956A] hover:text-[#1A1A1A] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LuCheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE8E4]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#76726E]">
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <LuBell className="w-8 h-8 text-[#A39E98]" />
                <p className="text-xs font-semibold text-[#1A1A1A]">
                  No notifications yet
                </p>
                <p className="text-[11px] text-[#76726E]">
                  Important system alerts and order updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.isRead)}
                  className={`p-4 transition-colors flex gap-3 cursor-pointer ${
                    !item.isRead
                      ? "bg-[#FAF9F6] hover:bg-[#F2EFF9]"
                      : "bg-white hover:bg-[#FAF9F6]"
                  }`}
                >
                  <div className="p-2 bg-white border border-[#EAE8E4] rounded-md h-fit shrink-0">
                    {renderIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3
                        className={`text-xs truncate ${
                          !item.isRead
                            ? "font-bold text-[#1A1A1A]"
                            : "font-semibold text-[#524F4C]"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-[#76726E] shrink-0">
                        {new Date(item.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-[#76726E] leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <div className="flex items-center shrink-0">
                      <span
                        className="w-2 h-2 bg-[#C4956A] rounded-full"
                        title="Unread"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

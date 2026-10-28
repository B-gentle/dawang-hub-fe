import { fetcher } from "./fetcher";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "ORDER_STATUS" | "PROMOTION" | "SECURITY";
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  unreadCount: number;
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const notificationsApi = {
  getMyNotifications: (page = 1, limit = 10) =>
    fetcher<NotificationsResponse>(
      `/notifications/me?page=${page}&limit=${limit}`,
    ),

  markAsRead: (id: string) =>
    fetcher<NotificationItem>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    fetcher<{ success: boolean }>("/notifications/read-all", {
      method: "PATCH",
    }),
};

"use client";

import { useEffect, useState, useMemo } from "react";
import { LuSearch, LuX, LuRefreshCw } from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UserAccount } from "@/lib/api/users-api";
import CustomersTable from "@/components/admin/CustomersTable";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch user accounts";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        loadUsers();
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = async (
    userId: string,
    currentRole: "admin" | "customer",
  ) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (
      !confirm(
        `Are you sure you want to change this user's role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
      )
    )
      return;

    toast.promise(apiClient.updateUserRole(userId, newRole), {
      loading: "Updating user role...",
      success: (updated) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: updated.role || newRole } : u,
          ),
        );
        return `Role changed to ${newRole}`;
      },
      error: (err) =>
        err instanceof Error ? err.message : "Failed to update role",
    });
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "activate" : "suspend";

    if (!confirm(`Are you sure you want to ${actionText} this user account?`))
      return;

    toast.promise(apiClient.toggleUserStatus(userId, newStatus), {
      loading: `${newStatus ? "Activating" : "Suspending"} account...`,
      success: (updated) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isActive:
                    updated.isActive !== undefined
                      ? updated.isActive
                      : newStatus,
                }
              : u,
          ),
        );
        return `Account ${newStatus ? "activated" : "suspended"} successfully`;
      },
      error: (err) =>
        err instanceof Error ? err.message : "Failed to update status",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      // Status Filter
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "suspended" && u.isActive) return false;

      // Search Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const fullName =
          `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        const emailMatches = u.email?.toLowerCase().includes(query);
        const nameMatches = fullName.includes(query);
        if (!emailMatches && !nameMatches) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6 font-sans pb-12 text-[#1A1A1A]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            Customers & Users ({users.length})
          </h1>
          <p className="text-xs text-[#76726E]">
            Manage customer accounts, roles, and security access permissions
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-[#FAF9F6] border border-[#EAE8E4] text-xs font-bold text-[#1A1A1A] rounded-md hover:border-[#C4956A] transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <LuRefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#1A1A1A]"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | "admin" | "customer")
            }
            className="p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-[#C4956A] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "suspended")
            }
            className="p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-[#C4956A] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Directory Table Component */}
      <CustomersTable
        loading={loading}
        error={error}
        users={filteredUsers}
        onRetry={loadUsers}
        onResetFilters={handleResetFilters}
        onRoleChange={handleRoleChange}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}

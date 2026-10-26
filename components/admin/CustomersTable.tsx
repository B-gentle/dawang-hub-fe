"use client";

import {
  LuRefreshCw,
  LuTriangle,
  LuUsers,
  LuMail,
  LuShieldAlert,
  LuShieldCheck,
  LuUserX,
  LuUserCheck,
} from "react-icons/lu";
import { UserAccount } from "@/lib/api/users-api";

interface CustomersTableProps {
  loading: boolean;
  error: string | null;
  users: UserAccount[];
  onRetry: () => void;
  onResetFilters: () => void;
  onRoleChange: (userId: string, currentRole: "admin" | "customer") => void;
  onStatusToggle: (userId: string, currentStatus: boolean) => void;
}

export default function CustomersTable({
  loading,
  error,
  users,
  onRetry,
  onResetFilters,
  onRoleChange,
  onStatusToggle,
}: CustomersTableProps) {
  return (
    <div className="bg-white rounded-lg border border-[#EAE8E4] overflow-hidden shadow-xs">
      {loading ? (
        <div className="p-12 text-center text-xs text-[#76726E] flex flex-col items-center gap-2">
          <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
          Fetching user directory...
        </div>
      ) : error ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <LuTriangle className="w-8 h-8 text-rose-500" />
          <p className="text-xs font-medium text-rose-600">{error}</p>
          <button
            onClick={onRetry}
            className="text-xs font-bold text-[#1A1A1A] underline uppercase tracking-wider hover:text-[#C4956A]"
          >
            Try Again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <LuUsers className="w-8 h-8 text-[#A39E98]" />
          <p className="text-xs text-[#76726E]">
            No users found matching your criteria.
          </p>
          <button
            onClick={onResetFilters}
            className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE8E4] text-xs">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#FAF9F6] transition-colors"
                >
                  {/* User Name */}
                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Unnamed Customer"}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 font-mono text-[#76726E]">
                    <span className="flex items-center gap-1.5">
                      <LuMail className="w-3.5 h-3.5 text-[#A39E98]" />
                      {user.email}
                    </span>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-[#171514] text-white"
                          : "bg-[#FAF5EF] text-[#C4956A] border border-[#EAE8E4]"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <LuShieldCheck className="w-3 h-3 text-[#C4956A]" />
                      ) : (
                        <LuUsers className="w-3 h-3 text-[#76726E]" />
                      )}
                      {user.role}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-4 text-[#76726E]">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* Role Change Toggle */}
                      <button
                        onClick={() => onRoleChange(user.id, user.role)}
                        className="px-2.5 py-1 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] hover:border-[#C4956A] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {user.role === "admin" ? (
                          <>
                            <LuShieldAlert className="w-3 h-3 text-amber-600" />{" "}
                            Demote
                          </>
                        ) : (
                          <>
                            <LuShieldCheck className="w-3 h-3 text-[#C4956A]" />{" "}
                            Promote
                          </>
                        )}
                      </button>

                      {/* Status Toggle */}
                      <button
                        onClick={() => onStatusToggle(user.id, user.isActive)}
                        className={`px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          user.isActive
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <LuUserX className="w-3 h-3" /> Suspend
                          </>
                        ) : (
                          <>
                            <LuUserCheck className="w-3 h-3" /> Activate
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

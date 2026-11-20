"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiSearch,
  FiRefreshCw,
  FiX,
  FiCheckCircle,
  FiClock,
  FiSlash,
  FiExternalLink,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiHardDrive,
  FiShield,
  FiLock,
  FiEye,
} from "react-icons/fi";
import { toast } from "sonner";
import {
  vendorApi,
  AdminVendorSummary,
  AdminRevealedKycResponse,
} from "@/lib/api/vendor-api";
import { formatBytes } from "@/lib/utils/format-bytes";

const STATUS_TABS = ["ALL", "APPROVED", "PENDING", "SUSPENDED"] as const;
type SortOption = "newest" | "storage_desc" | "storage_asc";

function AdminVendorsContent() {
  const searchParams = useSearchParams();
  const initialSortParam = searchParams.get("sort");
  const urlSort: SortOption =
    initialSortParam === "storage_desc" || initialSortParam === "storage_asc"
      ? initialSortParam
      : "newest";
  const initialVendorId = searchParams.get("vendorId");

  const [vendors, setVendors] = useState<AdminVendorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOverride, setSortOverride] = useState<SortOption | null>(null);
  const [selectedVendor, setSelectedVendor] =
    useState<AdminVendorSummary | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Admin Master-Key KYC Vault State
  const [masterKeyInput, setMasterKeyInput] = useState("");
  const [auditReasonInput, setAuditReasonInput] = useState("");
  const [revealingKyc, setRevealingKyc] = useState(false);
  const [revealedKyc, setRevealedKyc] =
    useState<AdminRevealedKycResponse | null>(null);

  const sortBy: SortOption = sortOverride ?? urlSort;

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getAllVendorsAdmin();
      const list = Array.isArray(data) ? data : [];
      setVendors(list);

      if (initialVendorId) {
        const match = list.find((v) => v.id === initialVendorId);
        if (match) setSelectedVendor(match);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load vendors",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadVendors();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVendorDrawer = (vendor: AdminVendorSummary) => {
    setSelectedVendor(vendor);
    setRevealedKyc(null);
    setMasterKeyInput("");
    setAuditReasonInput("");
  };

  const handleRevealKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    if (!masterKeyInput.trim()) {
      toast.error("Enter the Admin KYC Master Key to decrypt identity records");
      return;
    }

    try {
      setRevealingKyc(true);
      const res = await vendorApi.revealVendorKycAdmin(
        selectedVendor.id,
        masterKeyInput.trim(),
        auditReasonInput.trim() || "Compliance & Settlement Audit",
      );
      setRevealedKyc(res);
      setMasterKeyInput("");
      toast.success("KYC records decrypted and logged to NDPA audit trail");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to decrypt KYC records",
      );
    } finally {
      setRevealingKyc(false);
    }
  };

  const handleStatusChange = async (
    vendor: AdminVendorSummary,
    newStatus: "APPROVED" | "SUSPENDED",
  ) => {
    const action = newStatus === "APPROVED" ? "approve" : "suspend";
    if (!confirm(`Are you sure you want to ${action} "${vendor.storeName}"?`)) {
      return;
    }

    try {
      setUpdatingId(vendor.id);
      const updated = await vendorApi.updateVendorStatusAdmin(
        vendor.id,
        newStatus,
      );
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id
            ? { ...v, status: updated.status || newStatus }
            : v,
        ),
      );
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor((prev) =>
          prev ? { ...prev, status: updated.status || newStatus } : null,
        );
      }
      toast.success(`${vendor.storeName} is now ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update vendor status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVendors = useMemo(() => {
    const filtered = vendors.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const storeMatch = v.storeName?.toLowerCase().includes(q);
        const slugMatch = v.slug?.toLowerCase().includes(q);
        const ownerMatch =
          `${v.owner?.firstName || ""} ${v.owner?.lastName || ""} ${v.owner?.email || ""}`
            .toLowerCase()
            .includes(q);
        if (!storeMatch && !slugMatch && !ownerMatch) return false;
      }
      return true;
    });

    if (sortBy === "storage_desc") {
      return [...filtered].sort(
        (a, b) =>
          Number(b.storageUsedBytes || 0) - Number(a.storageUsedBytes || 0),
      );
    }
    if (sortBy === "storage_asc") {
      return [...filtered].sort(
        (a, b) =>
          Number(a.storageUsedBytes || 0) - Number(b.storageUsedBytes || 0),
      );
    }
    return filtered;
  }, [vendors, statusFilter, searchQuery, sortBy]);

  const totalVendorStorage = useMemo(
    () => vendors.reduce((acc, v) => acc + Number(v.storageUsedBytes || 0), 0),
    [vendors],
  );

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com";

  const getStatusBadge = (status: AdminVendorSummary["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <FiCheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <FiSlash className="w-3 h-3" /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <FiClock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            MARKETPLACE GOVERNANCE
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Vendors ({vendors.length})
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Approve or suspend vendor storefronts, inspect KYC & escrow
            balances, and monitor media storage (
            {formatBytes(totalVendorStorage)} across all stores).
          </p>
        </div>

        <button
          onClick={loadVendors}
          className="px-4 py-2.5 bg-white border border-[#EAE8E4] text-xs font-bold uppercase tracking-wider rounded-md hover:border-[#C4956A] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search, Sort & Status Tabs */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            <input
              type="text"
              placeholder="Search by store name, slug, or owner email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#151413]"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="vendor-sort"
              className="text-[10px] font-bold uppercase tracking-wider text-[#76726E] whitespace-nowrap"
            >
              Sort By:
            </label>
            <select
              id="vendor-sort"
              value={sortBy}
              onChange={(e) => setSortOverride(e.target.value as SortOption)}
              className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#151413] focus:outline-hidden focus:border-[#C4956A] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="storage_desc">Storage: Highest to Lowest</option>
              <option value="storage_asc">Storage: Lowest to Highest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#EAE8E4]">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#151413] text-white"
                  : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4] hover:text-[#151413]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
            <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
            Loading registered vendors...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="py-20 bg-[#FAF9F6] flex flex-col items-center justify-center gap-3 text-center p-6">
            <FiUsers className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs font-semibold text-[#151413]">
              No vendors found
            </p>
            <p className="text-[11px] text-[#76726E]">
              Adjust your search or status filter to view storefronts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-235">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                  <th className="py-3.5 px-4 font-bold">STOREFRONT</th>
                  <th className="py-3.5 px-4 font-bold">OWNER</th>
                  <th className="py-3.5 px-4 font-bold">KYC TIER</th>
                  <th className="py-3.5 px-4 font-bold">CATALOG / ORDERS</th>
                  <th className="py-3.5 px-4 font-bold">STORAGE</th>
                  <th className="py-3.5 px-4 font-bold">ESCROW / AVAILABLE</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6] text-xs">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-[#FAF9F6]/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#151413]">
                          {vendor.storeName}
                        </span>
                        <a
                          href={`https://${vendor.slug}.${rootDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-[#C4956A] hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          {vendor.slug}.{rootDomain}{" "}
                          <FiExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#151413]">
                          {vendor.owner?.firstName} {vendor.owner?.lastName}
                        </span>
                        <span className="text-[10px] text-[#76726E]">
                          {vendor.owner?.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vendor.bvnVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-stone-100 text-[#76726E]"
                          }`}
                        >
                          BVN{" "}
                          {vendor.bvnVerified ? `••••${vendor.bvnLast4}` : "—"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vendor.ninVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-stone-100 text-[#76726E]"
                          }`}
                        >
                          NIN{" "}
                          {vendor.ninVerified ? `••••${vendor.ninLast4}` : "—"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#76726E]">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products?vendorId=${vendor.id}`}
                          className="inline-flex items-center gap-1 hover:text-[#151413] font-semibold"
                        >
                          <FiPackage className="w-3.5 h-3.5 text-[#C4956A]" />
                          {vendor.productCount ?? 0}
                        </Link>
                        <Link
                          href={`/admin/orders?vendorId=${vendor.id}`}
                          className="inline-flex items-center gap-1 hover:text-[#151413] font-semibold"
                        >
                          <FiShoppingBag className="w-3.5 h-3.5 text-[#C4956A]" />
                          {vendor.orderCount ?? 0}
                        </Link>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#151413] bg-[#FAF9F6] border border-[#EAE8E4] px-2.5 py-1 rounded-md text-[11px]">
                        <FiHardDrive className="w-3 h-3 text-[#C4956A]" />
                        {formatBytes(vendor.storageUsedBytes)}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-emerald-700">
                          ₦
                          {Number(
                            vendor.withdrawableBalance || 0,
                          ).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#76726E]">
                          Escrow: ₦
                          {Number(vendor.pendingBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(vendor.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/vendors/${vendor.id}/transactions`}
                          className="px-3 py-1.5 bg-white border border-[#EAE8E4] rounded-md text-[11px] font-bold uppercase tracking-wider text-[#76726E] hover:border-[#C4956A] hover:text-[#151413] transition-colors"
                        >
                          Ledger
                        </Link>
                        <button
                          onClick={() => openVendorDrawer(vendor)}
                          className="px-3 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[11px] font-bold uppercase tracking-wider text-[#151413] hover:bg-[#151413] hover:text-white transition-colors cursor-pointer"
                        >
                          Inspect
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

      {/* Vendor Details Slide-over Drawer */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setSelectedVendor(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE8E4]">
                <div>
                  <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider">
                    VENDOR ACCOUNT
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#151413]">
                    {selectedVendor.storeName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#FAF9F6] p-3.5 rounded-md border border-[#EAE8E4]">
                <span className="text-xs font-bold text-[#76726E]">
                  Current Status
                </span>
                {getStatusBadge(selectedVendor.status)}
              </div>

              {/* Media Storage Usage */}
              <div className="flex items-center justify-between bg-[#FAF9F6] p-3.5 rounded-md border border-[#EAE8E4]">
                <span className="text-xs font-bold text-[#76726E] flex items-center gap-1.5">
                  <FiHardDrive className="w-3.5 h-3.5 text-[#C4956A]" /> Media
                  Storage Used
                </span>
                <span className="font-mono text-xs font-bold text-[#151413]">
                  {formatBytes(selectedVendor.storageUsedBytes)}
                </span>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#FAF9F6] p-3 rounded-md border border-[#EAE8E4]">
                  <span className="text-[10px] font-bold uppercase text-[#76726E]">
                    Escrow
                  </span>
                  <p className="font-bold text-[#151413] mt-0.5">
                    ₦
                    {Number(
                      selectedVendor.pendingBalance || 0,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#FAF9F6] p-3 rounded-md border border-[#EAE8E4]">
                  <span className="text-[10px] font-bold uppercase text-[#76726E]">
                    Available
                  </span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    ₦
                    {Number(
                      selectedVendor.withdrawableBalance || 0,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#FAF9F6] p-3 rounded-md border border-[#EAE8E4]">
                  <span className="text-[10px] font-bold uppercase text-[#76726E]">
                    Withdrawn
                  </span>
                  <p className="font-bold text-[#151413] mt-0.5">
                    ₦
                    {Number(
                      selectedVendor.totalWithdrawn || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Settlement Bank Details */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Settlement Bank Account
                </span>
                <span className="font-bold text-[#151413]">
                  {selectedVendor.accountName || "Not configured"}
                </span>
                <span className="text-[#76726E]">
                  {selectedVendor.bankName} • {selectedVendor.accountNumber}
                </span>
              </div>

              {/* NDPA Encrypted KYC Vault (Master Key Gated) */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5 text-[#C4956A]" /> NDPA KYC
                    Identity Vault
                  </span>
                  <span className="text-[10px] font-mono text-[#76726E]">
                    AES-256-GCM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded border border-[#EAE8E4]">
                    <span className="text-[10px] font-bold uppercase text-[#76726E]">
                      Tier 1 BVN
                    </span>
                    <p className="font-mono font-bold text-[#151413] mt-0.5">
                      {revealedKyc?.bvn
                        ? revealedKyc.bvn
                        : selectedVendor.bvnVerified
                          ? `•••••••${selectedVendor.bvnLast4}`
                          : "Unverified"}
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded border border-[#EAE8E4]">
                    <span className="text-[10px] font-bold uppercase text-[#76726E]">
                      Tier 2 NIN
                    </span>
                    <p className="font-mono font-bold text-[#151413] mt-0.5">
                      {revealedKyc?.nin
                        ? revealedKyc.nin
                        : selectedVendor.ninVerified
                          ? `•••••••${selectedVendor.ninLast4}`
                          : "Unverified"}
                    </p>
                  </div>
                </div>

                {(selectedVendor.bvnVerified || selectedVendor.ninVerified) &&
                  !revealedKyc && (
                    <form
                      onSubmit={handleRevealKyc}
                      className="flex flex-col gap-2 pt-2 border-t border-[#EAE8E4]"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <FiLock className="w-3 h-3 text-[#C4956A]" /> Admin KYC
                        Master Key (Audit Logged)
                      </label>
                      <input
                        type="password"
                        placeholder="Enter ADMIN_KYC_MASTER_KEY"
                        value={masterKeyInput}
                        onChange={(e) => setMasterKeyInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#EAE8E4] rounded text-xs font-mono focus:outline-hidden focus:border-[#C4956A]"
                      />
                      <input
                        type="text"
                        placeholder="Audit reason (e.g. Compliance review)"
                        value={auditReasonInput}
                        onChange={(e) => setAuditReasonInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#EAE8E4] rounded text-xs focus:outline-hidden focus:border-[#C4956A]"
                      />
                      <button
                        type="submit"
                        disabled={revealingKyc || !masterKeyInput.trim()}
                        className="w-full py-2 bg-[#151413] text-white text-[11px] font-bold uppercase tracking-wider rounded hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#A39E98]"
                      >
                        <FiEye className="w-3.5 h-3.5 text-[#C4956A]" />
                        {revealingKyc
                          ? "Decrypting Vault..."
                          : "Decrypt BVN / NIN"}
                      </button>
                    </form>
                  )}

                {revealedKyc?.auditTrail &&
                  revealedKyc.auditTrail.length > 0 && (
                    <div className="pt-2 border-t border-[#EAE8E4] flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#76726E]">
                        Recent NDPA Vault Access Log
                      </span>
                      <div className="max-h-28 overflow-y-auto divide-y divide-[#EAE8E4] bg-white rounded border border-[#EAE8E4] px-2.5">
                        {revealedKyc.auditTrail.map((log) => (
                          <div key={log.id} className="py-1.5 text-[10px]">
                            <p className="font-bold text-[#151413]">
                              {log.adminEmail}
                            </p>
                            <p className="text-[#76726E]">
                              {log.reason} •{" "}
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Quick Navigation to Filtered Catalog & Orders */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/products?vendorId=${selectedVendor.id}`}
                  className="py-2.5 px-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-bold text-center hover:border-[#C4956A]"
                >
                  View Products ({selectedVendor.productCount ?? 0})
                </Link>
                <Link
                  href={`/admin/orders?vendorId=${selectedVendor.id}`}
                  className="py-2.5 px-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-bold text-center hover:border-[#C4956A]"
                >
                  View Orders ({selectedVendor.orderCount ?? 0})
                </Link>
              </div>

              <Link
                href={`/admin/vendors/${selectedVendor.id}/transactions`}
                className="py-2.5 px-3 bg-[#151413] text-white rounded-md text-xs font-bold uppercase tracking-wider text-center hover:bg-[#2A2725] transition-colors"
              >
                View Vendor Ledger &amp; Payout History
              </Link>
            </div>

            {/* Approve / Suspend Actions */}
            <div className="pt-4 border-t border-[#EAE8E4] flex flex-col gap-2.5 mt-6">
              {selectedVendor.status !== "APPROVED" && (
                <button
                  disabled={updatingId === selectedVendor.id}
                  onClick={() => handleStatusChange(selectedVendor, "APPROVED")}
                  className="w-full py-3 bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Approve Storefront
                </button>
              )}

              {selectedVendor.status !== "SUSPENDED" && (
                <button
                  disabled={updatingId === selectedVendor.id}
                  onClick={() =>
                    handleStatusChange(selectedVendor, "SUSPENDED")
                  }
                  className="w-full py-3 bg-rose-600 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Suspend Storefront
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVendorsContent />
    </Suspense>
  );
}

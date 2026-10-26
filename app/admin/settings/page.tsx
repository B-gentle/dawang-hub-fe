"use client";

import { useEffect, useState } from "react";
import {
  LuStore,
  LuTruck,
  LuSlice,
  LuSave,
  LuRefreshCw,
  LuDollarSign,
  LuPercent,
  LuShieldAlert,
  LuCheck,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { StoreSettings } from "@/lib/api/settings-api";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "shipping" | "controls"
  >("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "DAWANGHUB Studio",
    supportEmail: "support@dawanghub.com",
    supportPhone: "+234 800 000 0000",
    currency: "NGN",
    currencySymbol: "₦",
    taxRate: 7.5,
    defaultShippingFee: 2500,
    freeShippingThreshold: 50000,
    maintenanceMode: false,
    allowGuestCheckout: true,
    autoApproveOrders: true,
    address: {
      street: "123 Luxury Way, Victoria Island",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
    },
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getStoreSettings().catch(() => null);
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to fetch store settings:", err);
      toast.error("Could not load latest store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        loadSettings();
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.updateStoreSettings(settings);
      toast.success("Store configuration updated successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            PREFERENCES
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Store Settings
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Configure general store profile, currency rates, delivery
            parameters, and system maintenance.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="px-5 py-2.5 bg-[#171514] text-white text-xs font-bold tracking-wider uppercase rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
          ) : (
            <LuSave className="w-4 h-4" />
          )}
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Loading store preferences...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "general"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuStore className="w-4 h-4 text-[#C4956A]" /> General Profile
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "shipping"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuTruck className="w-4 h-4 text-[#C4956A]" /> Shipping & Tax
              Rates
            </button>

            <button
              onClick={() => setActiveTab("controls")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "controls"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuSlice className="w-4 h-4 text-[#C4956A]" /> System Controls
            </button>
          </aside>

          {/* Settings Form Container */}
          <div className="flex-1 bg-white rounded-lg border border-[#EAE8E4] p-6 shadow-xs">
            <form
              onSubmit={handleSaveSettings}
              className="flex flex-col gap-6 text-xs text-[#151413]"
            >
              {/* TAB 1: GENERAL PROFILE */}
              {activeTab === "general" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      General Store Information
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Identifiable details displayed on customer receipts and
                      emails.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.storeName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            storeName: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Support Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={settings.supportEmail}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            supportEmail: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Support Phone Number
                      </label>
                      <input
                        type="text"
                        value={settings.supportPhone || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            supportPhone: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Store Base Country
                      </label>
                      <input
                        type="text"
                        value={settings.address?.country || "Nigeria"}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            address: {
                              ...settings.address,
                              country: e.target.value,
                            } as StoreSettings["address"],
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#76726E]">
                      Store Physical Headquarters
                    </label>
                    <input
                      type="text"
                      placeholder="Street address..."
                      value={settings.address?.street || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          address: {
                            ...settings.address,
                            street: e.target.value,
                          } as StoreSettings["address"],
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SHIPPING & TAX RATES */}
              {activeTab === "shipping" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Currency, Shipping & Tax Defaults
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Configure checkout calculations, logistics rates, and
                      active taxes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Store Currency Code
                      </label>
                      <input
                        type="text"
                        value={settings.currency}
                        onChange={(e) =>
                          setSettings({ ...settings, currency: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md uppercase font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={settings.currencySymbol}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            currencySymbol: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuPercent className="w-3.5 h-3.5 text-[#C4956A]" /> Tax
                        / VAT Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={settings.taxRate}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxRate: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuDollarSign className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Default Delivery Fee (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.defaultShippingFee}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            defaultShippingFee: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuTruck className="w-3.5 h-3.5 text-[#C4956A]" /> Free
                        Shipping Threshold (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.freeShippingThreshold || 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            freeShippingThreshold: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM CONTROLS & MAINTENANCE */}
              {activeTab === "controls" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Platform Operations & Mode
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Control storefront availability, checkout restrictions,
                      and order processing behavior.
                    </p>
                  </div>

                  {/* Maintenance Mode Alert Box */}
                  <div
                    className={`p-4 rounded-md border flex items-start gap-3 ${
                      settings.maintenanceMode
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-[#FAF9F6] border-[#EAE8E4] text-[#151413]"
                    }`}
                  >
                    <LuShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-xs">
                        Store Maintenance Mode
                      </h4>
                      <p className="text-[11px] text-[#76726E] mt-0.5">
                        Enabling maintenance mode temporarily locks public
                        customer checkout and displays a service status notice.
                      </p>
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              maintenanceMode: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-rose-600 rounded-xs cursor-pointer"
                        />
                        <span className="font-bold text-xs text-rose-700">
                          Activate Maintenance Mode
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-2">
                    <label className="flex items-center justify-between p-3.5 bg-[#FAF9F6] rounded-md border border-[#EAE8E4] cursor-pointer">
                      <div>
                        <span className="font-bold text-xs text-[#151413]">
                          Allow Guest Checkout
                        </span>
                        <p className="text-[11px] text-[#76726E]">
                          Permit customers to place orders without forcing
                          account registration
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.allowGuestCheckout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            allowGuestCheckout: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#C4956A] rounded-xs cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 bg-[#FAF9F6] rounded-md border border-[#EAE8E4] cursor-pointer">
                      <div>
                        <span className="font-bold text-xs text-[#151413]">
                          Auto-Approve Orders
                        </span>
                        <p className="text-[11px] text-[#76726E]">
                          Automatically transition paid orders to processing
                          without manual admin confirmation
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApproveOrders}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            autoApproveOrders: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#C4956A] rounded-xs cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#EAE8E4] flex justify-end">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-6 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LuCheck className="w-4 h-4 text-[#C4956A]" /> Save Store
                  Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

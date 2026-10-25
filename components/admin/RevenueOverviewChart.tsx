"use client";

import { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { apiClient } from "@/lib/api-client";
import { RevenueOverviewResponse } from "@/lib/api/admin-api";

export default function RevenueOverviewChart() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const [data, setData] = useState<RevenueOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getRevenueOverview(period);
        if (active && res) {
          setData(res);
        }
      } catch (err) {
        console.error("Failed to load revenue overview analytics:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRevenue();

    return () => {
      active = false;
    };
  }, [period]);

  const chartItems = data?.data || [];
  const maxRevenue = Math.max(...chartItems.map((item) => item.revenue), 1);
  const comparison = data?.comparedToPreviousPeriodPercentage ?? 0;
  const isPositiveComparison = comparison >= 0;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#EAE8E4] flex flex-col gap-6 font-sans shadow-xs">
      {/* Header & Period Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#151413]">
            Revenue overview
          </h2>
          <p className="text-xs text-[#76726E] mt-0.5">
            Sales performance across your store
          </p>
        </div>

        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "weekly" | "monthly" | "yearly")
          }
          className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#151413] focus:outline-hidden focus:border-[#C4956A] cursor-pointer self-start sm:self-auto"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">Last 12 months</option>
          <option value="yearly">This Year</option>
        </select>
      </div>

      {/* Chart Visualizer Area */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
          <span>Updating revenue chart...</span>
        </div>
      ) : chartItems.length === 0 ? (
        <div className="h-64 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex items-center justify-center text-xs text-[#76726E]">
          No revenue recorded for this period.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Bars Container */}
          <div className="h-64 pt-6 border-b border-[#EAE8E4] flex items-end justify-between gap-2 sm:gap-4 px-2">
            {chartItems.map((item, index) => {
              const heightPercent = Math.max(
                (item.revenue / maxRevenue) * 100,
                4,
              );

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#151413] text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                    ₦{Number(item.revenue).toLocaleString()}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-[#C4956A] rounded-t-md hover:bg-[#B38358] transition-all duration-300"
                  />
                </div>
              );
            })}
          </div>

          {/* Labels Row */}
          <div className="flex justify-between gap-2 sm:gap-4 px-2 text-[11px] text-[#76726E] font-medium">
            {chartItems.map((item, index) => (
              <span key={index} className="flex-1 text-center truncate">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Comparison Percentage */}
      <div className="pt-3 border-t border-[#EAE8E4] flex justify-between items-center text-xs text-[#76726E]">
        <span>Compared to previous period</span>
        <span
          className={`font-bold text-sm ${
            isPositiveComparison ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositiveComparison ? "+" : ""}
          {comparison}%
        </span>
      </div>
    </div>
  );
}

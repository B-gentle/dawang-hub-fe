"use client";

import { useState, useEffect } from "react";
import { LuSearch, LuBell, LuMenu } from "react-icons/lu";
import { UserProfile } from "@/lib/api/auth-api";
import { getTimeGreeting, formatFormattedDate } from "@/lib/utils/date";
import { Avatar } from "@/components/ui/Avatar";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  user?: UserProfile | null;
}

export function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const [currentDateString, setCurrentDateString] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Good day");

  useEffect(() => {
    const now = new Date();
    queueMicrotask(() => {
      setCurrentDateString(formatFormattedDate(now));
      setGreeting(getTimeGreeting(now));
    });
  }, []);

  const adminName = user?.firstName || "Admin";

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-[#EAE8E4] px-4 sm:px-8 flex items-center justify-between z-30 font-sans transition-all">
      {/* Left: Mobile Toggle & Dynamic Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#1A1A1A] hover:bg-[#FAF9F6] rounded-md"
          aria-label="Open Navigation Menu"
        >
          <LuMenu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#76726E]">
          <span>{currentDateString || "Today"}</span>
          <span>•</span>
          <span className="font-medium text-[#1A1A1A]">
            {greeting}, {adminName}
          </span>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search */}
        <div className="relative flex items-center">
          <LuSearch className="w-4 h-4 text-[#76726E] absolute left-3" />
          <input
            type="text"
            placeholder="Search dashboard"
            className="pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[#1A1A1A] placeholder-[#9E9A95] focus:outline-hidden focus:border-[#C4956A] w-36 sm:w-60"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-[#76726E] hover:text-[#1A1A1A] transition-colors cursor-pointer">
          <LuBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#C4956A] rounded-full" />
        </button>

        {/* Dynamic User Avatar Component */}
        <Avatar firstName={user?.firstName} lastName={user?.lastName} />
      </div>
    </header>
  );
}

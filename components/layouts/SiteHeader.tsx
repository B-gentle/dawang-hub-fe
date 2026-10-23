"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX,
} from "react-icons/fi";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Shoes", href: "/shoes" },
  { label: "Clothes", href: "/clothes" },
  { label: "Bags", href: "/bags" },
];

const SiteHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md font-sans">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#151413] text-white text-[10px] font-bold tracking-[0.2em] py-2.5 text-center flex items-center justify-center gap-2 px-4">
        <span>FREE DELIVERY ON ORDERS OVER ₦150,000</span>
        <span className="text-white/40">•</span>
        <Link
          href="/shop"
          className="underline hover:text-gray-200 transition-colors"
        >
          SHOP NOW
        </Link>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center gap-6">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#151413] focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-1">
            {/* Logo Image from Public Directory */}
            <div className="relative w-10 h-32 overflow-hidden">
              <Image
                src="/logo-nobg.png"
                alt="Dawang Stores Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-[0.18em] text-[#151413] leading-none">
                DAWANG
              </span>
              <span className="text-[7.5px] font-bold tracking-[0.25em] uppercase text-[#C4956A] mt-0.5">
                STORES
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation Links (Mapped) */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#151413]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-[#C4956A] group"
            >
              {link.label}
              <motion.span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C4956A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </Link>
          ))}
        </nav>

        {/* Right Section: Utility Icons */}
        <div className="flex items-center gap-3 sm:gap-6 text-[#151413]">
          <button
            className="p-1 hover:text-[#C4956A] transition-colors cursor-pointer"
            aria-label="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>
          <Link
            href="/account"
            className="hidden sm:block p-1 hover:text-[#C4956A] transition-colors"
            aria-label="User Account"
          >
            <FiUser className="w-5 h-5" />
          </Link>
          <Link
            href="/wishlist"
            className="p-1 hover:text-[#C4956A] transition-colors"
            aria-label="Wishlist"
          >
            <FiHeart className="w-5 h-5" />
          </Link>
          <Link
            href="/cart"
            className="p-1 hover:text-[#C4956A] transition-colors"
            aria-label="Shopping Bag"
          >
            <FiShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Animated Mobile Dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
          >
            <nav className="flex flex-col px-6 py-6 gap-5 text-sm font-medium tracking-[0.15em] uppercase text-[#151413]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-[#C4956A] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/60 flex gap-4 text-xs font-normal lowercase text-muted-foreground">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;

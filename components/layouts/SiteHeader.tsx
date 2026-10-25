"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiLogIn,
} from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Clothes", href: "/shop" },
  { label: "Bags", href: "/shop" },
];

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

const SiteHeader = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const { wishlist, isMounted } = useWishlist();
  const { totalItems, openCart } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Safely set auth status after hydration microtask tick
  useEffect(() => {
    queueMicrotask(() => {
      setIsLoggedIn(Boolean(Cookies.get(TOKEN_COOKIE_NAME)));
    });
  }, []);

  // Use hydration-safe flags
  const userHref = isMounted && isLoggedIn ? "/account" : "/login";
  const userAriaLabel = isMounted && isLoggedIn ? "My Account" : "Sign In";

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAE8E4] bg-white/95 backdrop-blur-md font-sans">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#151413] text-white text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] py-2 text-center flex items-center justify-center gap-1.5 px-3">
        <span className="truncate">FREE DELIVERY ON ORDERS OVER ₦150,000</span>
        <span className="text-white/40 hidden sm:inline">•</span>
        <Link
          href="/shop"
          className="underline hover:text-[#C4956A] transition-colors shrink-0 hidden sm:inline"
        >
          SHOP NOW
        </Link>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex justify-between items-center gap-2 sm:gap-4">
        {/* Mobile Left / Desktop Left */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-[#151413] hover:text-[#C4956A] transition-colors focus:outline-hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Logo */}
          <Link href="/" className="hidden sm:flex items-center gap-2">
            <div className="relative w-14 h-14 overflow-hidden flex-shrink-0">
              <Image
                src="/logo-nobg.png"
                alt="Dawang Stores Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-[0.18em] text-[#151413] leading-none">
                DAWANG
              </span>
              <span className="text-[7.5px] font-bold tracking-[0.25em] uppercase text-[#C4956A] mt-0.5">
                STORES
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#151413]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-[#C4956A] group flex items-center gap-1.5"
            >
              <span>{link.label}</span>
              {isMounted &&
                link.href === "/wishlist" &&
                wishlist.length > 0 && (
                  <span className="bg-[#C4956A] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              <motion.span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C4956A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden sm:flex items-center gap-4 text-[#151413]">
          <Link
            href="/shop"
            className="p-1.5 hover:text-[#C4956A] transition-colors cursor-pointer"
            aria-label="Search catalog"
          >
            <FiSearch className="w-5 h-5" />
          </Link>

          <Link
            href={userHref}
            className="p-1.5 hover:text-[#C4956A] transition-colors"
            aria-label={userAriaLabel}
          >
            <FiUser className="w-5 h-5" />
          </Link>

          <button
            onClick={openCart}
            className="p-1.5 hover:text-[#C4956A] transition-colors relative cursor-pointer"
            aria-label="Shopping Bag"
          >
            <FiShoppingBag className="w-5 h-5" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#151413] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Right Section */}
        <div className="flex sm:hidden items-center gap-[2px]">
          <Link href="/" className="flex items-center">
            <div className="relative w-14 h-14 overflow-hidden flex-shrink-0">
              <Image
                src="/logo-nobg.png"
                alt="Dawang Stores Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <button
            onClick={openCart}
            className="p-1 text-[#151413] hover:text-[#C4956A] transition-colors relative cursor-pointer"
            aria-label="Shopping Bag"
          >
            <FiShoppingBag className="w-5 h-5" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#151413] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer & Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-white border-b border-[#EAE8E4] shadow-xl z-50 md:hidden"
            >
              <nav className="flex flex-col px-6 py-5 gap-4 text-xs font-bold tracking-[0.18em] uppercase text-[#151413]">
                {/* 1. Shop Link */}
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 hover:text-[#C4956A] transition-colors border-b border-[#FAF9F6] flex items-center justify-between"
                >
                  <span>Shop</span>
                </Link>

                {/* 2. Wishlist Link with Badge */}
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 hover:text-[#C4956A] transition-colors border-b border-[#FAF9F6] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FiHeart className="w-4 h-4 text-[#C4956A]" /> Wishlist
                  </span>
                  {isMounted && wishlist.length > 0 && (
                    <span className="bg-[#C4956A] text-white text-[9px] font-bold rounded-full px-2 py-0.5">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* 3. Account / Login Link */}
                <Link
                  href={userHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 hover:text-[#C4956A] transition-colors border-b border-[#FAF9F6] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {isMounted && isLoggedIn ? (
                      <>
                        <FiUser className="w-4 h-4 text-[#C4956A]" /> My Account
                      </>
                    ) : (
                      <>
                        <FiLogIn className="w-4 h-4 text-[#C4956A]" /> Login
                      </>
                    )}
                  </span>
                </Link>

                {/* 4. Search Bar */}
                <form onSubmit={handleMobileSearch} className="pt-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search store..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98] tracking-normal font-normal normal-case"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
                  </div>
                </form>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;

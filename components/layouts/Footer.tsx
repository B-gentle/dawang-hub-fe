"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { BsChat } from "react-icons/bs";

// Helpers for useSyncExternalStore (both snapshot functions return type 'number')
const emptySubscribe = () => () => {};
const getYearSnapshot = () => new Date().getFullYear();
const getServerYearSnapshot = () => 2026;

const Footer = () => {
  const currentYear = useSyncExternalStore(
    emptySubscribe,
    getYearSnapshot,
    getServerYearSnapshot,
  );

  return (
    <footer className="w-full bg-[#FAF9F6] text-[#2D2B2A] border-t border-border mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-heading text-2xl font-bold tracking-[0.15em] text-[#1A1A1A]">
            DAWANGHUB
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Modern fashion and beauty essentials for the woman becoming
            everything she imagined.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="https://instagram.com"
              className="p-2.5 rounded-full border border-border bg-white text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="p-2.5 rounded-full border border-border bg-white text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200"
              aria-label="Chat with Us"
            >
              <BsChat className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* SHOP Links */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">
            SHOP
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <Link
                href="/new-arrivals"
                className="hover:text-foreground transition-colors duration-200"
              >
                New arrivals
              </Link>
            </li>
            <li>
              <Link
                href="/best-sellers"
                className="hover:text-foreground transition-colors duration-200"
              >
                Best sellers
              </Link>
            </li>
            <li>
              <Link
                href="/shoes"
                className="hover:text-foreground transition-colors duration-200"
              >
                Shoes
              </Link>
            </li>
            <li>
              <Link
                href="/bags"
                className="hover:text-foreground transition-colors duration-200"
              >
                Bags
              </Link>
            </li>
            <li>
              <Link
                href="/clothes"
                className="hover:text-foreground transition-colors duration-200"
              >
                Clothes
              </Link>
            </li>
          </ul>
        </div>

        {/* HELP Links */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">
            HELP
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <Link
                href="/contact"
                className="hover:text-foreground transition-colors duration-200"
              >
                Contact us
              </Link>
            </li>
            <li>
              <Link
                href="/delivery-returns"
                className="hover:text-foreground transition-colors duration-200"
              >
                Delivery & returns
              </Link>
            </li>
            <li>
              <Link
                href="/faqs"
                className="hover:text-foreground transition-colors duration-200"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/size-guide"
                className="hover:text-foreground transition-colors duration-200"
              >
                Size guide
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT Info */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">
            CONTACT
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="text-muted-foreground">Port Harcourt, Nigeria</li>
            <li>
              <Link
                href="mailto:essangrebecca876@gmail.com"
                className="hover:text-foreground transition-colors duration-200"
              >
                essangrebecca876@gmail.com
              </Link>
            </li>
            <li className="text-muted-foreground">Mon — Sat, 9am — 6pm</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="w-full border-t border-[#EAE8E4]/60 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-widest text-[#76726E] uppercase">
          <div>
            © {currentYear} DAWANGHUB OFFICIAL STORE. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </Link>
            <span>·</span>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors duration-200"
            >
              Terms
            </Link>
            <span>·</span>
            <span className="text-muted-foreground/80">Payments Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

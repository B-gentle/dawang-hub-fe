"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { BsChat } from "react-icons/bs";
import { systemConfigApi, SystemConfig } from "@/lib/api/system-config-api";
import { NavCategoryItem } from "./SiteHeader";

interface FooterProps {
  vendorId?: string;
  initialConfig?: Partial<SystemConfig>;
  categoryLinks?: NavCategoryItem[];
}

const DEFAULT_FOOTER_CATEGORIES: NavCategoryItem[] = [
  { label: "Shoes", href: "/shop?category=shoe" },
  { label: "Clothes", href: "/shop?category=clothes" },
];

const emptySubscribe = () => () => {};
const getYearSnapshot = () => new Date().getFullYear();
const getServerYearSnapshot = () => 2026;

const Footer = ({ vendorId, initialConfig, categoryLinks }: FooterProps) => {
  const currentYear = useSyncExternalStore(
    emptySubscribe,
    getYearSnapshot,
    getServerYearSnapshot,
  );

  const [fetchedConfig, setFetchedConfig] = useState<
    Pick<
      SystemConfig,
      | "siteName"
      | "logoUrl"
      | "description"
      | "contactAddress"
      | "location"
      | "businessHours"
      | "whatsappContact"
      | "themeConfig"
    >
  >({
    siteName: "Bee Technologies",
    logoUrl: "",
    description: "",
    contactAddress: "",
    location: "Port Harcourt, Nigeria",
    businessHours: "Mon — Sat, 9am — 6pm",
    whatsappContact: "",
  });

  useEffect(() => {
    if (initialConfig) return;

    let isMounted = true;
    systemConfigApi
      .getPublicConfig(vendorId)
      .then((config) => {
        if (isMounted && config) {
          setFetchedConfig({
            siteName: config.siteName || "Bee Technologies",
            logoUrl: config.logoUrl || "",
            description: config.description || "",
            contactAddress: config.contactAddress || "",
            location: config.location || "Port Harcourt, Nigeria",
            businessHours: config.businessHours || "Mon — Sat, 9am — 6pm",
            whatsappContact: config.whatsappContact || "",
            themeConfig: config.themeConfig,
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch system config for footer:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [initialConfig, vendorId]);

  const sysConfig = initialConfig
    ? {
        siteName: initialConfig.siteName || "Storefront",
        logoUrl: initialConfig.logoUrl || "",
        description: initialConfig.description || "",
        contactAddress: initialConfig.contactAddress || "",
        location: initialConfig.location || "",
        businessHours: initialConfig.businessHours || "",
        whatsappContact: initialConfig.whatsappContact || "",
        themeConfig: initialConfig.themeConfig,
      }
    : fetchedConfig;

  const resolvedCategories = vendorId
    ? (categoryLinks || []).slice(0, 2)
    : categoryLinks && categoryLinks.length > 0
      ? categoryLinks.slice(0, 2)
      : DEFAULT_FOOTER_CATEGORIES;

  const whatsappLink = sysConfig.whatsappContact
    ? `https://wa.me/${sysConfig.whatsappContact.replace(/\D/g, "")}`
    : "#contact-info";

  const backgroundColor = sysConfig.themeConfig?.backgroundColor || "#FAF9F6";

  return (
    <footer
      className="w-full text-[#2D2B2A] border-t border-border mt-auto font-sans"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          {sysConfig.logoUrl ? (
            <div className="relative w-36 h-12">
              <Image
                src={sysConfig.logoUrl}
                alt={sysConfig.siteName}
                fill
                className="object-contain object-left"
                unoptimized
              />
            </div>
          ) : (
            <h2 className="font-heading text-2xl font-bold tracking-[0.15em] text-[#1A1A1A] uppercase">
              {sysConfig.siteName}
            </h2>
          )}

          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {sysConfig.description ||
              "Modern fashion and beauty essentials for the woman becoming everything she imagined."}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-border bg-white text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </Link>
            <Link
              href={whatsappLink}
              target={sysConfig.whatsappContact ? "_blank" : "_self"}
              rel="noopener noreferrer"
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
                href="/#new-arrivals"
                className="hover:text-foreground transition-colors duration-200"
              >
                New arrivals
              </Link>
            </li>
            <li>
              <Link
                href="/#popular-products"
                className="hover:text-foreground transition-colors duration-200"
              >
                Best sellers
              </Link>
            </li>
            {resolvedCategories.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  className="hover:text-foreground transition-colors duration-200"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
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
                href="#contact-info"
                className="hover:text-foreground transition-colors duration-200"
              >
                Contact us
              </Link>
            </li>
            <li>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors duration-200"
              >
                Delivery & returns
              </Link>
            </li>
            <li>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors duration-200"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors duration-200"
              >
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT Info Anchor Section */}
        <div id="contact-info" className="flex flex-col gap-5 scroll-mt-20">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">
            CONTACT
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {sysConfig.contactAddress && (
              <li className="text-muted-foreground">
                {sysConfig.contactAddress}
              </li>
            )}
            {sysConfig.location && (
              <li className="text-muted-foreground">{sysConfig.location}</li>
            )}
            {sysConfig.whatsappContact && (
              <li>
                <a
                  href={`https://wa.me/${sysConfig.whatsappContact.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  {sysConfig.whatsappContact}
                </a>
              </li>
            )}
            {sysConfig.businessHours && (
              <li className="text-muted-foreground">
                {sysConfig.businessHours}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div
        className="w-full border-t border-[#EAE8E4]/60"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-widest text-[#76726E] uppercase">
          <div>
            © {currentYear} {sysConfig.siteName}. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            <Link
              href="/#privacy"
              className="hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </Link>
            <span>·</span>
            <Link
              href="/#terms"
              className="hover:text-foreground transition-colors duration-200"
            >
              Terms
            </Link>
            <span>·</span>
            <span className="text-muted-foreground/80">
              {vendorId ? "Powered by GlobexMall" : "Payments Secured"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

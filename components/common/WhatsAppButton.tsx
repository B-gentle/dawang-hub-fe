"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { systemConfigApi, SystemConfig } from "@/lib/api/system-config-api";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({
  phoneNumber: propPhoneNumber = "2349030657610",
  message: customMessage,
}: WhatsAppButtonProps) {
  const [config, setConfig] = useState<
    Pick<SystemConfig, "siteName" | "whatsappContact">
  >({
    siteName: "Bee Technologies",
    whatsappContact: propPhoneNumber,
  });

  useEffect(() => {
    let isMounted = true;
    systemConfigApi
      .getPublicConfig()
      .then((data) => {
        if (isMounted && data) {
          setConfig({
            siteName: data.siteName || "Bee Technologies",
            whatsappContact: data.whatsappContact || propPhoneNumber,
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch WhatsApp config:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [propPhoneNumber]);

  // Clean phone number (strip spaces, dashes, or '+' signs)
  const phone = config.whatsappContact.replace(/\D/g, "") || propPhoneNumber;

  // Use custom message if explicitly passed, otherwise dynamically insert siteName
  const message =
    customMessage ||
    `Hello ${config.siteName}, I have an inquiry regarding a product.`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 20, top: -500, bottom: 20 }}
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing select-none touch-none"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:bg-[#20ba5a] transition-colors focus:outline-hidden group"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7 drop-shadow-xs" />

        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-[#151413] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          Chat with Admin
        </span>
      </a>
    </motion.div>
  );
}

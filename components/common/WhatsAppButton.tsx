"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({
  phoneNumber = "2349030657610",
  message = "Hello DawangHub, I have an inquiry regarding a product.",
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
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
        // Prevent drag events from triggering accidental link navigation
        onClick={(e) => {
          // Allow normal click navigation
        }}
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

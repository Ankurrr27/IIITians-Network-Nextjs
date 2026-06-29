"use client";

import { motion } from "framer-motion";

export default function LogoLoader({ size = "h-12 w-48 sm:h-16 sm:w-64", text = "Loading..." }: { size?: string, text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${size}`}>
        {/* Base Black Logo */}
        <img
          src="/IIITians-Network-Logo-Blue.png"
          alt="Loading base"
          className="absolute inset-0 h-full w-full object-contain grayscale brightness-0 opacity-30"
        />
        {/* Animated Colored Logo (fills from bottom to top) */}
        <motion.img
          src="/IIITians-Network-Logo-Blue.png"
          alt="Loading color"
          className="absolute inset-0 h-full w-full object-contain drop-shadow-md"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      {text && (
        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          {text}
        </p>
      )}
    </div>
  );
}

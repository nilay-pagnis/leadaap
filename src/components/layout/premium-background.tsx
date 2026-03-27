"use client";

import { motion } from "framer-motion";

/**
 * Subtle animated mesh + grid for premium dark layouts (pointer-events none).
 */
export function PremiumBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#0B0F19]" />
      <motion.div
        className="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-[#4F46E5]/25 blur-[120px]"
        animate={{
          x: [0, 40, 0],
          y: [0, 24, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[60vh] w-[60vw] rounded-full bg-violet-600/20 blur-[100px]"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(79,70,229,0.4) 0%, transparent 55%)`,
        }}
        animate={{ opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

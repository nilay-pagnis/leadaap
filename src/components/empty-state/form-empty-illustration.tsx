import { motion } from "framer-motion";

/** Minimal line illustration — premium, not clipart */
export function FormEmptyIllustration({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 160"
        fill="none"
        className="mx-auto h-40 w-full max-w-[220px] text-indigo-500/90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fe" x1="40" y1="20" x2="170" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="ac" x1="100" y1="0" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect
          x="24"
          y="16"
          width="152"
          height="128"
          rx="16"
          stroke="url(#ac)"
          strokeWidth="1.5"
          fill="url(#fe)"
          className="text-indigo-400"
        />
        <rect x="44" y="40" width="88" height="8" rx="4" fill="currentColor" className="opacity-30" />
        <rect x="44" y="58" width="112" height="8" rx="4" fill="currentColor" className="opacity-15" />
        <rect x="44" y="76" width="96" height="8" rx="4" fill="currentColor" className="opacity-15" />
        <rect x="44" y="102" width="72" height="28" rx="8" fill="currentColor" className="opacity-20" />
        <circle cx="156" cy="44" r="6" fill="#6366f1" opacity="0.5" />
        <circle cx="172" cy="44" r="4" fill="#a855f7" opacity="0.45" />
      </svg>
    </motion.div>
  );
}

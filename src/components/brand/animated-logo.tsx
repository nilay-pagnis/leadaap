"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const VIEW = 72;
const CX = VIEW / 2;
const ROT = 22;
const BAR_H = 5;
const RX = 1.85;

const LAYERS = [
  { y: 24, w: 46 },
  { y: 36, w: 36 },
  { y: 48, w: 25 },
] as const;

const easeOut = [0, 0, 0.2, 1] as const;
const LAYER_DURATION = 0.62;
const STAGGER = 0.12;

type Props = {
  className?: string;
  /** Size in px (square viewBox). */
  size?: number;
  /** Play entrance on mount. */
  animate?: boolean;
  /** Hover scale + glow. */
  hover?: boolean;
  /** Accessible name when used without visible text. */
  "aria-label"?: string;
  /** Hide from assistive tech when paired with a wordmark / parent label. */
  decorative?: boolean;
};

/**
 * Enquireo mark with staggered slide-in: top → middle → bottom.
 * Blur → sharp, opacity, slide from left (subtle SaaS motion).
 */
export function AnimatedLogo({
  className,
  size = 72,
  animate = true,
  hover = true,
  "aria-label": ariaLabel = "Enquireo",
  decorative = false,
}: Props) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;
  const uid = useId().replace(/:/g, "");
  const gidTop = `alog-top-${uid}`;
  const gidMid = `alog-mid-${uid}`;
  const gidBot = `alog-bot-${uid}`;
  const fid = `alog-glow-${uid}`;

  return (
    <motion.div
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      className={cn(
        "inline-flex shrink-0 select-none",
        hover && "cursor-default",
        className
      )}
      initial={false}
      whileHover={
        hover
          ? {
              scale: 1.05,
              filter: "drop-shadow(0 10px 28px rgba(99, 102, 241, 0.45))",
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 26,
      }}
      style={{ willChange: "transform, filter" }}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        shapeRendering="geometricPrecision"
        width={size}
        height={size}
        aria-hidden
        className="block overflow-visible"
      >
        <defs>
          <linearGradient id={gidTop} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id={gidMid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={gidBot} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter
            id={fid}
            x="-45%"
            y="-45%"
            width="190%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="rgb(99,102,241)"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        <g filter={`url(#${fid})`}>
          {LAYERS.map((layer, i) => (
            <motion.g
              key={i}
              initial={
                shouldAnimate
                  ? { x: -20, opacity: 0, filter: "blur(7px)" }
                  : { x: 0, opacity: 1, filter: "blur(0px)" }
              }
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: LAYER_DURATION,
                delay: shouldAnimate ? i * STAGGER : 0,
                ease: easeOut,
              }}
            >
              <g transform={`translate(${CX} ${layer.y}) rotate(${ROT})`}>
                <rect
                  x={-layer.w / 2}
                  y={-BAR_H / 2}
                  width={layer.w}
                  height={BAR_H}
                  rx={RX}
                  fill={
                    i === 0
                      ? `url(#${gidTop})`
                      : i === 1
                        ? `url(#${gidMid})`
                        : `url(#${gidBot})`
                  }
                />
              </g>
            </motion.g>
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

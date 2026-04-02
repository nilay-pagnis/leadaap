"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Refined 3-layer mark: equal gaps, shared tilt, consistent radii (design system). */
const ROT = 22;
const BAR_H = 5.5;
const RX = BAR_H / 2;

const LAYERS = [
  { y: 17, w: 48 },
  { y: 28.5, w: 37 },
  { y: 40, w: 26 },
] as const;

export type EnquireoMarkTone = "color" | "monoBlack" | "monoWhite";

type Props = {
  className?: string;
  tone?: EnquireoMarkTone;
  /** Indigo drop-shadow (color tone only). */
  glow?: boolean;
  title?: string;
};

export function EnquireoMark({
  className,
  tone = "color",
  glow = true,
  title = "Enquireo",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const gidTop = `egt-${uid}`;
  const gidMid = `egm-${uid}`;
  const gidBot = `egb-${uid}`;
  const fid = `egf-${uid}`;

  const mono =
    tone === "monoBlack"
      ? "#0f172a"
      : tone === "monoWhite"
        ? "#ffffff"
        : null;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      shapeRendering="geometricPrecision"
      className={cn("shrink-0", className)}
    >
      <title>{title}</title>
      {mono ? (
        <g>
          {LAYERS.map((layer, i) => (
            <g
              key={i}
              transform={`translate(32 ${layer.y}) rotate(${ROT})`}
            >
              <rect
                x={-layer.w / 2}
                y={-BAR_H / 2}
                width={layer.w}
                height={BAR_H}
                rx={RX}
                fill={mono}
              />
            </g>
          ))}
        </g>
      ) : (
        <g filter={glow ? `url(#${fid})` : undefined}>
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
          {LAYERS.map((layer, i) => (
            <g
              key={i}
              transform={`translate(32 ${layer.y}) rotate(${ROT})`}
            >
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
          ))}
        </g>
      )}
    </svg>
  );
}

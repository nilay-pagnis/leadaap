"use client";

import { cn } from "@/lib/utils";

export type Audience = "businesses" | "creators";

export function AudienceToggle({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (next: Audience) => void;
}) {
  return (
    <div
      className="inline-flex w-full flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm sm:w-auto sm:flex-row"
      role="tablist"
      aria-label="Audience selector"
    >
      {[
        { id: "businesses" as const, label: "Businesses" },
        { id: "creators" as const, label: "Creators" },
      ].map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

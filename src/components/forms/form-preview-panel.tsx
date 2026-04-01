"use client";

import type { FieldRow } from "@/types";
import { SiteLogo } from "@/components/brand/site-logo";

type Props = {
  formName: string;
  fields: FieldRow[];
};

/** Read-only wireframe preview — mirrors public form structure */
export function FormPreviewPanel({ formName, fields }: Props) {
  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_-4px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
        <SiteLogo size="xs" className="rounded-xl shadow-md" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Preview
          </p>
          <h3 className="truncate text-lg font-semibold text-zinc-900">{formName}</h3>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 py-10 text-center text-sm text-zinc-500">
            Fields appear here as you add them
          </p>
        ) : (
          sorted.map((f) => (
            <div key={f.id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-zinc-800">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </span>
                <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {f.type}
                </span>
              </div>
              {f.type === "textarea" ? (
                <div className="h-20 rounded-xl border border-zinc-200 bg-zinc-50/80" />
              ) : f.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded border border-zinc-300 bg-white" />
                  <span className="text-xs text-zinc-400">Checkbox</span>
                </div>
              ) : f.type === "select" ? (
                <div className="space-y-1.5">
                  <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-500">
                    {(f.options?.length ?? 0) > 0
                      ? "Choose an option…"
                      : "Add options in the builder"}
                  </div>
                  {f.options && f.options.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
                      {f.options.slice(0, 5).map((o) => (
                        <li
                          key={o}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600"
                        >
                          {o}
                        </li>
                      ))}
                      {f.options.length > 5 && (
                        <li className="text-zinc-400">+{f.options.length - 5} more</li>
                      )}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="h-11 rounded-xl border border-zinc-200 bg-zinc-50/80" />
              )}
            </div>
          ))
        )}
        <div className="pt-2">
          <div className="h-11 rounded-xl bg-zinc-200/80" style={{ width: "40%" }} />
        </div>
      </div>
    </div>
  );
}

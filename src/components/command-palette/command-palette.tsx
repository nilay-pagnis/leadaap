"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FilePlus,
  FileText,
  LayoutDashboard,
  Search,
  Users,
  CornerDownLeft,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDashboardSearch } from "@/hooks/use-dashboard-search";
import { formatLeadPreview } from "@/lib/lead-preview";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    return { open: false, setOpen: () => {} };
  }
  return ctx;
}

export function CommandPaletteProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteDialog open={open} onOpenChange={setOpen} userId={userId} />
    </CommandPaletteContext.Provider>
  );
}

function CommandPaletteDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { forms, leads, loading } = useDashboardSearch(
    userId,
    search,
    open
  );

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg overflow-hidden gap-0 border-slate-200 p-0 shadow-2xl dark:border-slate-800"
      >
        <Command
          className="rounded-2xl bg-white dark:bg-slate-950"
          label="Command palette"
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 dark:border-slate-800">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search forms & leads, or run an action…"
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-500">
              {search.trim().length >= 1 && !loading
                ? "No matches."
                : search.trim().length >= 1 && loading
                  ? "Searching…"
                  : "No results."}
            </Command.Empty>

            {search.trim().length >= 1 && loading ? (
              <div className="space-y-2 px-2 py-3">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ) : null}

            {forms.length > 0 ? (
              <Command.Group
                heading="Forms"
                className="mb-2 overflow-hidden px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-500"
              >
                {forms.map((f) => (
                  <Command.Item
                    key={f.id}
                    value={`form-${f.id}-${f.form_name}`}
                    onSelect={() =>
                      run(() => {
                        router.push(`/forms/${f.id}`);
                      })
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-900"
                  >
                    <FileText className="size-4 shrink-0 text-slate-500" />
                    <span className="truncate">{f.form_name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {leads.length > 0 ? (
              <Command.Group
                heading="Leads"
                className="mb-2 overflow-hidden px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-500"
              >
                {leads.map((l) => (
                  <Command.Item
                    key={l.id}
                    value={`lead-${l.id}-${formatLeadPreview(l.data as Record<string, unknown>)}`}
                    onSelect={() =>
                      run(() => {
                        router.push(`/leads?lead=${l.id}`);
                      })
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-900"
                  >
                    <Users className="size-4 shrink-0 text-slate-500" />
                    <span className="truncate">
                      {formatLeadPreview(l.data as Record<string, unknown>)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            <Command.Group
              heading="Actions"
              className="overflow-hidden px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-500"
            >
              <Command.Item
                value="action-dashboard"
                onSelect={() =>
                  run(() => {
                    router.push("/dashboard");
                  })
                }
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-900"
              >
                <LayoutDashboard className="size-4 text-slate-500" />
                Open Dashboard
              </Command.Item>
              <Command.Item
                value="action-leads"
                onSelect={() =>
                  run(() => {
                    router.push("/leads");
                  })
                }
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-900"
              >
                <Users className="size-4 text-slate-500" />
                Go to Leads
              </Command.Item>
              <Command.Item
                value="action-form-new"
                onSelect={() =>
                  run(() => {
                    router.push("/forms");
                  })
                }
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-900"
              >
                <FilePlus className="size-4 text-slate-500" />
                Create form (opens Forms)
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800"
            )}
          >
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">
                Esc
              </kbd>
              close
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">
                ⌘K
              </kbd>
              <CornerDownLeft className="size-3.5 opacity-70" aria-hidden />
              open
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

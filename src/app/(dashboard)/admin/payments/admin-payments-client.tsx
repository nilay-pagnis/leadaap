"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  approvePaymentAction,
  rejectPaymentAction,
} from "@/app/actions/payments";
import type { PaymentRow, PaymentStatus } from "@/types/payments";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Filter = "all" | PaymentStatus;

type Props = {
  initialPayments: PaymentRow[];
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "pending" &&
          "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
        status === "approved" &&
          "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
        status === "rejected" &&
          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200"
      )}
    >
      {status === "pending" && "Pending"}
      {status === "approved" && "Approved"}
      {status === "rejected" && "Rejected"}
    </span>
  );
}

export function AdminPaymentsClient({ initialPayments }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [, startListTransition] = useTransition();
  const [rowId, setRowId] = useState<string | null>(null);
  const processing = rowId !== null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list =
      filter === "all"
        ? initialPayments
        : initialPayments.filter((p) => p.status === filter);
    if (q) {
      list = list.filter((p) => {
        const blob = [
          p.email,
          p.payment_id,
          p.plan,
          p.user_id,
          String(p.amount_inr),
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    return list;
  }, [initialPayments, filter, search]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: initialPayments.length };
    for (const p of initialPayments) {
      if (p.status === "pending") c.pending++;
      else if (p.status === "approved") c.approved++;
      else if (p.status === "rejected") c.rejected++;
    }
    return c;
  }, [initialPayments]);

  function runAction(
    id: string,
    action: "approve" | "reject",
    fn: (id: string) => ReturnType<typeof approvePaymentAction>
  ) {
    setRowId(id);
    startListTransition(async () => {
      try {
        const r = await fn(id);
        if (r.ok) {
          toast.success(
            action === "approve"
              ? "Approved — user plan updated"
              : "Payment rejected"
          );
          router.refresh();
        } else {
          toast.error(r.error ?? "Action failed");
        }
      } finally {
        setRowId(null);
      }
    });
  }

  const filterTabs: { id: Filter; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "rejected", label: "Rejected", count: counts.rejected },
    { id: "all", label: "All", count: counts.all },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Payments
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review Razorpay payment IDs, then approve to apply the plan and credits,
          or reject if the payment doesn’t match.
        </p>
      </div>

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="payment-search">Search</Label>
        <Input
          id="payment-search"
          placeholder="Email, payment ID, plan, amount…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={processing}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={filter === t.id ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setFilter(t.id)}
            disabled={processing}
          >
            {t.label}
            <span className="tabular-nums text-xs opacity-80">({t.count})</span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-zinc-950">
          No payments in this view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="tabular-nums">Amount (₹)</TableHead>
                <TableHead className="font-mono text-xs">Payment ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const rowBusy = rowId === p.id;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap text-sm text-gray-600">
                      {new Date(p.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {p.email || p.user_id.slice(0, 8) + "…"}
                    </TableCell>
                    <TableCell className="capitalize">{p.plan}</TableCell>
                    <TableCell className="tabular-nums">{p.amount_inr}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                      {p.payment_id}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processing}
                            onClick={() =>
                              runAction(p.id, "reject", rejectPaymentAction)
                            }
                          >
                            {rowBusy ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            disabled={processing}
                            onClick={() =>
                              runAction(p.id, "approve", approvePaymentAction)
                            }
                          >
                            {rowBusy ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

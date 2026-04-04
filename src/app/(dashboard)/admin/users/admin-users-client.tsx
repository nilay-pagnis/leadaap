"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminIncrementCreditsAction, adminSetPlanAction } from "@/app/actions/admin";
import type { AdminUserRow } from "@/lib/admin/admin-queries";
import type { PlanId } from "@/types/billing";
import {
  isUnlimitedCredits,
  normalizePlanId,
  planLabel,
} from "@/lib/monetization/plans";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Coins, ChevronDown, ChevronUp } from "lucide-react";

const PLANS: PlanId[] = [
  "free",
  "starter",
  "growth",
  "premium",
];

const PLAN_LADDER: PlanId[] = [
  "free",
  "starter",
  "growth",
  "premium",
];

function ladderIndex(plan: PlanId): number {
  const i = PLAN_LADDER.indexOf(plan);
  return i >= 0 ? i : 0;
}

function upgradeTarget(plan: PlanId): PlanId | null {
  const i = ladderIndex(plan);
  return i < PLAN_LADDER.length - 1 ? PLAN_LADDER[i + 1]! : null;
}

function downgradeTarget(plan: PlanId): PlanId | null {
  const i = ladderIndex(plan);
  return i > 0 ? PLAN_LADDER[i - 1]! : null;
}

type Props = { initialUsers: AdminUserRow[] };

export function AdminUsersClient({ initialUsers }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanId | "all">("all");
  const [pending, start] = useTransition();

  const [creditsOpen, setCreditsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<AdminUserRow | null>(null);
  const [creditDelta, setCreditDelta] = useState("100");
  const [planChoice, setPlanChoice] = useState<PlanId>("starter");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialUsers.filter((u) => {
      const plan = normalizePlanId(u.plan);
      if (planFilter !== "all" && plan !== planFilter) return false;
      if (!q) return true;
      const blob = [u.email, u.full_name, u.id, u.company_name, u.plan]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [initialUsers, query, planFilter]);

  function runCredits() {
    if (!activeUser) return;
    const n = Number.parseInt(creditDelta, 10);
    if (!Number.isFinite(n) || n === 0) {
      toast.error("Enter a non-zero integer amount.");
      return;
    }
    start(async () => {
      const r = await adminIncrementCreditsAction(activeUser.id, n);
      if (r.ok) {
        toast.success("Credits updated");
        setCreditsOpen(false);
        setActiveUser(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  }

  function runPlan() {
    if (!activeUser) return;
    start(async () => {
      const r = await adminSetPlanAction(activeUser.id, planChoice);
      if (r.ok) {
        toast.success("Plan updated");
        setPlanOpen(false);
        setActiveUser(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  }

  function runPlanChange(user: AdminUserRow, nextPlan: PlanId) {
    start(async () => {
      const r = await adminSetPlanAction(user.id, nextPlan);
      if (r.ok) {
        toast.success(`Plan set to ${planLabel(nextPlan)}`);
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Users
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Plan comes from each user&apos;s profile (same source as billing).
          Monthly cap, used (month), and remaining match the billing page (UTC
          calendar month). Use Up / Down for one tier at a time, or Plan to set a
          tier. Admin role is still set in Supabase (
          <code className="text-xs">role</code>).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            placeholder="Email, name, user id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-48">
          <Label>Plan</Label>
          <Select
            value={planFilter}
            onValueChange={(v) => setPlanFilter(v as PlanId | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {PLANS.map((p) => (
                <SelectItem key={p} value={p}>
                  {planLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="tabular-nums" title="Monthly enquiry allocation for this plan">
                Monthly cap
              </TableHead>
              <TableHead
                className="tabular-nums"
                title="Enquiries this calendar month (UTC) on this user’s forms — same as billing"
              >
                Used (month)
              </TableHead>
              <TableHead
                className="tabular-nums"
                title="Capacity left vs monthly cap — matches billing"
              >
                Remaining
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  No users match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const plan = normalizePlanId(u.plan);
                const up = upgradeTarget(plan);
                const down = downgradeTarget(plan);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="max-w-[220px] truncate text-sm">
                      {u.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-gray-800">
                        {planLabel(plan)}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {isUnlimitedCredits(u.lead_cap)
                        ? "Unlimited"
                        : u.lead_cap.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {u.leads_used.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm font-medium text-slate-800 dark:text-slate-200">
                      {isUnlimitedCredits(u.lead_cap)
                        ? "Unlimited"
                        : u.credits_remaining.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          u.role === "admin"
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-gray-500"
                        )}
                      >
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-0.5 px-2"
                          disabled={pending || !up}
                          title={up ? `Upgrade to ${planLabel(up)}` : "Already highest"}
                          onClick={() => up && runPlanChange(u, up)}
                        >
                          <ChevronUp className="size-3.5" />
                          Up
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-0.5 px-2"
                          disabled={pending || !down}
                          title={
                            down ? `Downgrade to ${planLabel(down)}` : "Already lowest"
                          }
                          onClick={() => down && runPlanChange(u, down)}
                        >
                          <ChevronDown className="size-3.5" />
                          Down
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() => {
                            setActiveUser(u);
                            setCreditDelta("100");
                            setCreditsOpen(true);
                          }}
                        >
                          <Coins className="mr-1 size-3.5" />
                          Credits
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() => {
                            setActiveUser(u);
                            setPlanChoice(plan);
                            setPlanOpen(true);
                          }}
                        >
                          <Pencil className="mr-1 size-3.5" />
                          Plan
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={creditsOpen} onOpenChange={setCreditsOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust credits</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add or remove credits for{" "}
            <span className="font-medium text-foreground">
              {activeUser?.email ?? activeUser?.id.slice(0, 8)}
            </span>
            . Use a negative number to subtract.
          </p>
          <div className="space-y-2">
            <Label htmlFor="delta">Amount</Label>
            <Input
              id="delta"
              inputMode="numeric"
              value={creditDelta}
              onChange={(e) => setCreditDelta(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runCredits} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Resets credits to the plan&apos;s allocation.
          </p>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={planChoice}
              onValueChange={(v) => setPlanChoice(v as PlanId)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {planLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runPlan} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

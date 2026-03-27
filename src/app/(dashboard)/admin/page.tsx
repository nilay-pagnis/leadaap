import Link from "next/link";
import { fetchAdminDashboardStats } from "@/lib/admin/admin-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Users,
  BadgeCheck,
  IndianRupee,
  Inbox,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const stats = await fetchAdminDashboardStats();

  const cards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      href: "/admin/users",
      icon: Users,
      hint: "Workspace profiles",
    },
    {
      label: "Active subscriptions",
      value: stats.activeSubscriptions,
      href: "/admin/plans",
      icon: BadgeCheck,
      hint: "On Starter, Growth, Premium, or Enterprise",
    },
    {
      label: "Total revenue",
      value: stats.totalRevenueInr,
      href: "/admin/payments",
      icon: IndianRupee,
      hint: "Sum of approved payments (₹)",
    },
    {
      label: "Leads processed",
      value: stats.leadsProcessed,
      href: "/admin/users",
      icon: Inbox,
      hint: "All-time lead submissions",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Overview of users, subscriptions, revenue, and lead volume. Access is
          granted when{" "}
          <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
            profiles.role = &apos;admin&apos;
          </code>{" "}
          in Supabase.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const display =
            c.label === "Total revenue"
              ? `₹${c.value.toLocaleString("en-IN")}`
              : c.value.toLocaleString();
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {display}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
                <Link
                  href={c.href}
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "mt-3 h-auto px-0 text-primary"
                  )}
                >
                  Open
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { fetchAdminStats } from "@/lib/admin/admin-queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminAnalyticsPage() {
  const stats = await fetchAdminStats();

  let planBreakdown: { plan: string; count: number }[] = [];
  try {
    const admin = createAdminClient();
    const { data: rows } = await admin.from("profiles").select("plan");
    if (rows?.length) {
      const m = new Map<string, number>();
      for (const r of rows as { plan: string }[]) {
        m.set(r.plan, (m.get(r.plan) ?? 0) + 1);
      }
      planBreakdown = Array.from(m.entries())
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count);
    }
  } catch {
    planBreakdown = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          High-level counts across the workspace (same data as the overview).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Total users", stats.users],
            ["Total forms", stats.forms],
            ["Total leads", stats.leads],
            ["Pending payments", stats.paymentsPending],
          ] as const
        ).map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users by plan</CardTitle>
        </CardHeader>
        <CardContent>
          {planBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            <ul className="space-y-2">
              {planBreakdown.map((row) => (
                <li
                  key={row.plan}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-foreground">
                    {row.plan}
                  </span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

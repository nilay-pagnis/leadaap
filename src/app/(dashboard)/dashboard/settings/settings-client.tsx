"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  completeProfileAction,
  updateWhatsAppLeadAlertsAction,
} from "@/app/actions/profile";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  User,
  Shield,
  Loader2,
  CheckCircle2,
  PlugZap,
  MessageCircle,
  Lock,
} from "lucide-react";

type Props = {
  email: string;
  initial: {
    fullName: string;
    companyName: string;
    jobTitle: string;
    whatsappAlertsEnabled: boolean;
    whatsappAlertsTier: "hot" | "warm_hot" | "all";
    whatsappAlertPhone: string;
  };
};

const sections = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "security" as const, label: "Security", icon: Shield },
  { id: "integrations" as const, label: "Integrations", icon: PlugZap },
];

/** Set to false when WhatsApp alerts are ready to ship. */
const WHATSAPP_ALERTS_COMING_SOON = true;

export function SettingsClient({ email, initial }: Props) {
  const [pending, start] = useTransition();
  const [fullName, setFullName] = useState(initial.fullName);
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [waEnabled, setWaEnabled] = useState(initial.whatsappAlertsEnabled);
  const [waTier, setWaTier] = useState<string>(initial.whatsappAlertsTier);
  const [waPhone, setWaPhone] = useState(initial.whatsappAlertPhone);
  const [active, setActive] = useState<(typeof sections)[number]["id"]>("profile");

  function saveProfile() {
    start(async () => {
      const r = await completeProfileAction({
        fullName,
        companyName: companyName || undefined,
        jobTitle: jobTitle || undefined,
      });
      if (r.ok) {
        toast.success("Profile saved");
      } else {
        toast.error(r.error ?? "Could not save");
      }
    });
  }

  function saveWhatsAppAlerts() {
    if (WHATSAPP_ALERTS_COMING_SOON) return;
    start(async () => {
      const r = await updateWhatsAppLeadAlertsAction({
        enabled: waEnabled,
        tier: waTier,
        phone: waPhone,
      });
      if (r.ok) {
        toast.success("WhatsApp alert settings saved");
      } else {
        toast.error(r.error ?? "Could not save");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Account settings
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Profile, security, and integrations for your Enquireo workspace.
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <nav
          className="flex shrink-0 gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-950/40 lg:w-52 lg:flex-col lg:overflow-visible"
          aria-label="Settings sections"
        >
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActive(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 space-y-12">
          <motion.section
            id="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="scroll-mt-28"
          >
            <Card className="border-slate-200/90 shadow-none dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="size-5 text-slate-700 dark:text-slate-300" aria-hidden />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>Name and company shown on forms and invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="rounded-xl border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoComplete="organization"
                    className="rounded-xl border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job">Job title</Label>
                  <Input
                    id="job"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    autoComplete="organization-title"
                    className="rounded-xl border-slate-200 dark:border-slate-700"
                  />
                </div>
                <Button onClick={saveProfile} disabled={pending} className="rounded-xl">
                  {pending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-4" />
                  )}
                  Save profile
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            id="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="scroll-mt-28"
          >
            <Card className="border-slate-200/90 shadow-none dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-slate-700 dark:text-slate-300" aria-hidden />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Signed in as <span className="font-medium text-foreground">{email || "—"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/forgot-password"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-center rounded-xl border-slate-200 dark:border-slate-700"
                  )}
                >
                  Send password reset email
                </Link>
                <Link
                  href="/update-password"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "justify-center text-muted-foreground hover:text-foreground"
                  )}
                >
                  Update password (signed in)
                </Link>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            id="integrations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="scroll-mt-28 space-y-6"
          >
            <Card
              className={cn(
                "relative overflow-hidden border-slate-200/90 shadow-none dark:border-slate-800",
                WHATSAPP_ALERTS_COMING_SOON && "cursor-not-allowed"
              )}
              aria-disabled={WHATSAPP_ALERTS_COMING_SOON}
            >
              <p className="sr-only">
                WhatsApp lead alerts are coming soon. Controls are preview-only.
              </p>
              {WHATSAPP_ALERTS_COMING_SOON ? (
                <Badge
                  variant="secondary"
                  className="pointer-events-none absolute right-5 top-5 z-20 shrink-0 rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:right-6 sm:top-6"
                >
                  Coming Soon
                </Badge>
              ) : null}
              <div
                className={cn(
                  WHATSAPP_ALERTS_COMING_SOON &&
                    "pointer-events-none select-none opacity-[0.72]"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "flex items-start gap-2",
                      WHATSAPP_ALERTS_COMING_SOON && "pr-[7.5rem] sm:pr-36"
                    )}
                  >
                    <MessageCircle
                      className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-1.5">
                      <CardTitle
                        id="whatsapp-alerts-heading"
                        className="flex flex-wrap items-center gap-2 text-left"
                      >
                        Smart WhatsApp alerts
                        <Lock
                          className="size-4 shrink-0 stroke-[1.5] text-muted-foreground"
                          aria-hidden
                        />
                      </CardTitle>
                      <CardDescription>
                        Get an instant WhatsApp ping when a new enquiry matches the lead score rules below. Uses the same
                        scoring as your inbox (Hot / Warm / Cold).
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      id="wa-enabled"
                      type="checkbox"
                      checked={waEnabled}
                      disabled={WHATSAPP_ALERTS_COMING_SOON}
                      onChange={(e) => setWaEnabled(e.target.checked)}
                      className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 disabled:cursor-not-allowed"
                    />
                    <Label
                      htmlFor="wa-enabled"
                      className={cn(
                        "font-medium",
                        WHATSAPP_ALERTS_COMING_SOON ? "cursor-not-allowed" : "cursor-pointer"
                      )}
                    >
                      Enable WhatsApp alerts
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wa-phone">Your WhatsApp number</Label>
                    <Input
                      id="wa-phone"
                      value={waPhone}
                      disabled={WHATSAPP_ALERTS_COMING_SOON}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="Country code + number, e.g. 9198xxxxxxxx"
                      autoComplete="tel"
                      className="rounded-xl border-slate-200 font-mono text-sm dark:border-slate-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      We send alerts to this number via Twilio WhatsApp. Add{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
                        TWILIO_ACCOUNT_SID
                      </code>
                      ,{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
                        TWILIO_AUTH_TOKEN
                      </code>
                      , and{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
                        TWILIO_WHATSAPP_FROM
                      </code>{" "}
                      in your deployment environment.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wa-tier">Send for</Label>
                    <Select
                      value={waTier}
                      disabled={WHATSAPP_ALERTS_COMING_SOON}
                      onValueChange={(v) => {
                        if (v) setWaTier(v);
                      }}
                    >
                      <SelectTrigger
                        id="wa-tier"
                        className="max-w-md rounded-xl border-slate-200 dark:border-slate-700"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">Hot leads only</SelectItem>
                        <SelectItem value="warm_hot">Warm and Hot</SelectItem>
                        <SelectItem value="all">All new enquiries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={saveWhatsAppAlerts}
                    disabled={WHATSAPP_ALERTS_COMING_SOON || pending}
                    className={cn(
                      "rounded-xl",
                      WHATSAPP_ALERTS_COMING_SOON && "opacity-60"
                    )}
                  >
                    {WHATSAPP_ALERTS_COMING_SOON ? (
                      "Coming Soon"
                    ) : pending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Save WhatsApp settings
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 size-4" />
                        Save WhatsApp settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </div>
              {WHATSAPP_ALERTS_COMING_SOON ? (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-background/50 px-6 py-10 text-center backdrop-blur-[4px] dark:bg-background/45"
                  role="presentation"
                  aria-hidden="true"
                >
                  <p className="max-w-[18rem] text-sm font-semibold tracking-tight text-foreground">
                    🚀 WhatsApp alerts launching soon
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Get instant notifications for hot leads
                  </p>
                </div>
              ) : null}
            </Card>

            <Card className="border-dashed border-slate-200/90 bg-slate-50/40 shadow-none dark:border-slate-800 dark:bg-slate-900/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PlugZap className="size-5 text-slate-700 dark:text-slate-300" aria-hidden />
                  <CardTitle>More integrations</CardTitle>
                </div>
                <CardDescription>Slack, webhooks, and CRM sync — coming soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We’re building one-click integrations so enquiries sync where your team already works. See also{" "}
                  <Link href="/docs" className="font-medium text-primary hover:underline">
                    Developer docs
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

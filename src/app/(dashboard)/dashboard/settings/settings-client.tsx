"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { completeProfileAction } from "@/app/actions/profile";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { User, Palette, Shield, Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  email: string;
  initial: {
    fullName: string;
    companyName: string;
    jobTitle: string;
  };
};

export function SettingsClient({ email, initial }: Props) {
  const { theme, setTheme } = useTheme();
  const [pending, start] = useTransition();
  const [fullName, setFullName] = useState(initial.fullName);
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);

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

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-primary">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Workspace
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Profile, appearance, and account security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" aria-hidden />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Job title</Label>
                <Input
                  id="job"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  autoComplete="organization-title"
                />
              </div>
              <Button onClick={saveProfile} disabled={pending} className="w-full sm:w-auto">
                {pending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Save profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="size-5 text-primary" aria-hidden />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>Theme applies across the app on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme ?? "dark"}
                onValueChange={(v) => setTheme(v as "dark" | "light" | "system")}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" aria-hidden />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Signed in as <span className="font-medium text-foreground">{email || "—"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/forgot-password"
                className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
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
        </motion.div>
      </div>
    </div>
  );
}

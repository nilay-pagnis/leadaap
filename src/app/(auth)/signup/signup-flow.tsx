"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "fullName" | "companyName" | "jobTitle" | "email" | "password";

function validateFields(input: {
  fullName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  password: string;
}): Partial<Record<FieldKey, string>> {
  const e: Partial<Record<FieldKey, string>> = {};
  if (!input.fullName.trim()) e.fullName = "Enter your full name.";
  if (!input.companyName.trim()) e.companyName = "Enter your company name.";
  if (!input.jobTitle.trim()) e.jobTitle = "Enter your job title.";
  if (!input.email.trim()) e.email = "Enter your work email.";
  else if (!emailRe.test(input.email.trim()))
    e.email = "Enter a valid email address.";
  if (input.password.length < 8)
    e.password = "Use at least 8 characters.";
  return e;
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const inputClass =
  "h-12 rounded-xl border-slate-200/90 bg-white text-base shadow-sm transition-colors duration-200 placeholder:text-slate-400 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 md:text-sm";

export function SignupFlow() {
  const router = useRouter();
  const [view, setView] = useState<"form" | "verify" | "ready">("form");

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>(
    {}
  );

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);
    const nextErrors = validateFields({
      fullName,
      companyName,
      jobTitle,
      email,
      password,
    });
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    const supabase = createClient();
    const fn = fullName.trim();
    const cn = companyName.trim();
    const jt = jobTitle.trim();
    const em = email.trim();

    const { data, error: err } = await supabase.auth.signUp({
      email: em,
      password,
      options: {
        data: {
          full_name: fn,
          company_name: cn,
          job_title: jt,
        },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      },
    });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    if (data.session) {
      setView("ready");
      router.refresh();
      return;
    }

    setView("verify");
  }

  async function handleGoogleSignup() {
    setError(null);
    setOauthLoading(true);
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      },
    });
    setOauthLoading(false);
    if (err) setError(err.message);
  }

  const leftPanel = (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90" />
      <div className="pointer-events-none absolute -right-24 top-1/4 size-[380px] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-[280px] rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            <Sparkles className="size-6 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">LeadAap</span>
        </Link>
      </div>

      <div className="relative z-10 mt-8 max-w-md lg:mt-0">
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Build forms that turn traffic into pipeline
        </h1>
        <p className="mt-5 text-base leading-relaxed text-indigo-100/95 sm:text-lg">
          One account for your team — capture leads, route them cleanly, and keep
          data locked to your workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-indigo-100/90">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
            <Zap className="size-4 shrink-0 text-amber-200" />
            Start free — no card
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
            <Shield className="size-4 shrink-0 text-emerald-300" />
            Secure by design
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
            <CreditCard className="size-4 shrink-0 text-sky-200" />
            Upgrade when you scale
          </span>
        </div>
      </div>

      <p className="relative z-10 mt-10 text-xs text-indigo-200/80 lg:mt-0">
        © {new Date().getFullYear()} LeadAap
      </p>
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#F4F6FB] lg:flex-row">
      {/* Brand — indigo → violet (matches login + primary token) */}
      <div className="relative flex min-h-[40vh] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#5B52E8] to-[#6D28D9] px-5 py-8 text-white sm:px-8 sm:py-10 lg:min-h-dvh lg:w-[46%] lg:max-w-xl lg:px-12 lg:py-14">
        {leftPanel}
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 lg:px-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Sparkles className="size-5" />
              </div>
              <span className="text-lg font-semibold">LeadAap</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7 md:p-8">
            <AnimatePresence mode="wait">
              {view === "form" && (
                <motion.div
                  key="form"
                  variants={fade}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22 }}
                >
                  <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                      Get started
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      Create your account
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Free to start — complete the fields below and verify your email.
                    </p>
                  </div>

                  <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {error && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200/90 bg-gradient-to-b from-red-50 to-red-50/80 px-4 py-3 text-sm text-red-900 shadow-sm"
                      >
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="su-fullname"
                        className="text-sm font-medium text-slate-700"
                      >
                        Full name
                      </Label>
                      <Input
                        id="su-fullname"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          clearFieldError("fullName");
                          setError(null);
                        }}
                        placeholder="Jane Cooper"
                        className={cn(
                          inputClass,
                          fieldErrors.fullName &&
                            "border-destructive/60 bg-red-50/40 focus-visible:border-destructive focus-visible:ring-destructive/15"
                        )}
                        aria-invalid={Boolean(fieldErrors.fullName)}
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="su-company"
                        className="text-sm font-medium text-slate-700"
                      >
                        Company name
                      </Label>
                      <Input
                        id="su-company"
                        autoComplete="organization"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          clearFieldError("companyName");
                          setError(null);
                        }}
                        placeholder="Acme Inc."
                        className={cn(
                          inputClass,
                          fieldErrors.companyName &&
                            "border-destructive/60 bg-red-50/40 focus-visible:border-destructive focus-visible:ring-destructive/15"
                        )}
                        aria-invalid={Boolean(fieldErrors.companyName)}
                      />
                      {fieldErrors.companyName && (
                        <p className="text-xs text-destructive">
                          {fieldErrors.companyName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="su-job"
                        className="text-sm font-medium text-slate-700"
                      >
                        Job title
                      </Label>
                      <Input
                        id="su-job"
                        autoComplete="organization-title"
                        value={jobTitle}
                        onChange={(e) => {
                          setJobTitle(e.target.value);
                          clearFieldError("jobTitle");
                          setError(null);
                        }}
                        placeholder="Head of Growth"
                        className={cn(
                          inputClass,
                          fieldErrors.jobTitle &&
                            "border-destructive/60 bg-red-50/40 focus-visible:border-destructive focus-visible:ring-destructive/15"
                        )}
                        aria-invalid={Boolean(fieldErrors.jobTitle)}
                      />
                      {fieldErrors.jobTitle && (
                        <p className="text-xs text-destructive">{fieldErrors.jobTitle}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="su-email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Work email
                      </Label>
                      <Input
                        id="su-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearFieldError("email");
                          setError(null);
                        }}
                        placeholder="you@company.com"
                        className={cn(
                          inputClass,
                          fieldErrors.email &&
                            "border-destructive/60 bg-red-50/40 focus-visible:border-destructive focus-visible:ring-destructive/15"
                        )}
                        aria-invalid={Boolean(fieldErrors.email)}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-destructive">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="su-password"
                        className="text-sm font-medium text-slate-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="su-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError("password");
                            setError(null);
                          }}
                          className={cn(
                            inputClass,
                            "pr-12",
                            fieldErrors.password &&
                              "border-destructive/60 bg-red-50/40 focus-visible:border-destructive focus-visible:ring-destructive/15"
                          )}
                          aria-invalid={Boolean(fieldErrors.password)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-destructive">{fieldErrors.password}</p>
                      )}
                      <p className="text-xs text-slate-500">At least 8 characters.</p>
                    </div>

                    <Button
                      type="submit"
                      className="mt-2 h-12 w-full rounded-2xl text-base font-semibold shadow-md shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0"
                      disabled={loading || oauthLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/90" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-white/95 px-3 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleGoogleSignup()}
                    disabled={loading || oauthLoading}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "inline-flex h-12 w-full items-center justify-center gap-0 rounded-2xl border-slate-200 bg-white text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:translate-y-0"
                    )}
                  >
                    {oauthLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="mr-3 size-5 shrink-0" />
                        Continue with Google
                      </>
                    )}
                  </button>

                  <p className="mt-8 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}

              {view === "verify" && (
                <motion.div
                  key="verify"
                  variants={fade}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary shadow-inner ring-1 ring-primary/10">
                    <Mail className="size-8" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Almost there
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Check your email
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    We sent a confirmation link to{" "}
                    <span className="font-medium text-slate-800">{email.trim()}</span>.
                    Click the link in that message to verify your account and open the
                    app — no need to sign in again from this page.
                  </p>
                  <p className="mt-6 text-xs text-slate-500">
                    Wrong email?{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setView("form");
                        setError(null);
                      }}
                    >
                      Go back and edit
                    </button>
                  </p>
                </motion.div>
              )}

              {view === "ready" && (
                <motion.div
                  key="ready"
                  variants={fade}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-600/15 text-emerald-700 shadow-inner ring-1 ring-emerald-500/15">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/90">
                    Welcome
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    You&apos;re all set
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Your workspace is ready. Continue to the dashboard to build forms
                    and capture leads.
                  </p>
                  <Button
                    type="button"
                    className="mt-8 h-12 w-full gap-2 rounded-2xl font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => router.push("/dashboard")}
                  >
                    <Rocket className="size-4" aria-hidden />
                    Go to dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            By continuing you agree to responsible use of LeadAap and your data.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

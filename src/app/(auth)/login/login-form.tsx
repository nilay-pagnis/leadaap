"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type FloatFieldProps = {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  icon: ReactNode;
  trailing?: ReactNode;
};

function FloatField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  icon,
  trailing,
}: FloatFieldProps) {
  const [focused, setFocused] = useState(false);
  const float = focused || value.length > 0;

  return (
    <div className="relative">
      <span
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400 transition-colors duration-200",
          float && "top-[1.125rem] -translate-y-0 text-primary",
          error && "text-destructive"
        )}
      >
        {icon}
      </span>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error}
        className={cn(
          "h-14 rounded-2xl border-slate-200/90 bg-white pl-11 pt-5 pb-2 text-base text-slate-900 shadow-sm transition-all duration-200 placeholder:text-transparent focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 md:text-sm",
          trailing ? "pr-12" : "pr-3",
          error &&
            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
        )}
        placeholder=" "
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-11 top-1/2 z-[1] origin-left -translate-y-1/2 text-slate-500 transition-all duration-200 ease-out",
          float && "top-2 translate-y-0 text-[11px] font-medium text-slate-500",
          error && !float && "text-destructive"
        )}
      >
        {label}
      </label>
      {trailing}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect =
    searchParams.get("next") ??
    searchParams.get("redirect") ??
    "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function clearError() {
    setFormError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function onGoogleSignIn() {
    setFormError(null);
    setOauthLoading(true);
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const next = encodeURIComponent(redirect.startsWith("/") ? redirect : `/${redirect}`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${next}`,
      },
    });
    setOauthLoading(false);
    if (error) {
      setFormError(error.message);
    }
  }

  const hasError = Boolean(formError);
  const busy = loading || oauthLoading;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8FAFC] lg:flex-row">
      {/* Left — brand */}
      <div className="relative flex min-h-[42vh] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#5B52E8] to-[#7C3AED] px-5 py-8 text-white sm:px-8 sm:py-10 lg:min-h-dvh lg:w-[46%] lg:max-w-xl lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90" />
        <div className="pointer-events-none absolute -right-24 top-1/4 size-[380px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 size-[280px] rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
            <SiteLogo size="md" />
            <span className="text-xl font-semibold tracking-tight">LeadAap</span>
          </Link>
        </div>

        <div className="relative z-10 mt-8 max-w-md lg:mt-0">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Turn visitors into paying clients
          </h1>
          <p className="mt-5 text-base leading-relaxed text-indigo-100/95 sm:text-lg">
            Secure sign-in to your workspace. Your leads and data stay private —
            row-level security by design.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-indigo-100/90">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <Shield className="size-4 shrink-0 text-emerald-300" />
              SOC-minded architecture
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <Lock className="size-4 shrink-0 text-amber-200" />
              Encrypted sessions
            </span>
          </div>
        </div>

        <p className="relative z-10 mt-10 text-xs text-indigo-200/80 lg:mt-0">
          © {new Date().getFullYear()} LeadAap
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 lg:px-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900">
              <SiteLogo size="sm" />
              <span className="text-lg font-semibold">LeadAap</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)] sm:p-7 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Sign in to manage forms, leads, and billing.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {formError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <FloatField
                id="login-email"
                label="Work email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  clearError();
                }}
                error={hasError}
                icon={<Mail className="size-[18px]" aria-hidden />}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FloatField
                  id="login-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    clearError();
                  }}
                  error={hasError}
                  icon={<Lock className="size-[18px]" aria-hidden />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-[18px]" />
                      ) : (
                        <Eye className="size-[18px]" />
                      )}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                className="group h-12 w-full rounded-2xl text-base font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0"
                disabled={busy}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void onGoogleSignIn()}
              disabled={busy}
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
              No account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            By signing in you agree to our approach to{" "}
            <span className="text-slate-600">privacy &amp; security</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

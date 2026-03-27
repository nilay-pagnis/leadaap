"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/update-password";
  const [message, setMessage] = useState("Verifying your link…");

  useEffect(() => {
    const supabase = createClient();
    let done = false;

    function go(next: string) {
      if (done) return;
      done = true;
      router.replace(next);
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        go(nextPath.startsWith("/") ? nextPath : `/${nextPath}`);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED")
      ) {
        go(nextPath.startsWith("/") ? nextPath : `/${nextPath}`);
      }
    });

    const t = window.setTimeout(() => {
      if (!done) {
        setMessage(
          "Could not complete sign-in from this link. Request a new reset email or try again."
        );
      }
    }, 12000);

    return () => {
      window.clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [router, nextPath]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-zinc-950">
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

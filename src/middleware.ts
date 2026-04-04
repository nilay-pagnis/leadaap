import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

async function profileIsAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return (data as { role?: string } | null)?.role === "admin";
}

function isUserWorkspacePath(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname.startsWith("/forms")) return true;
  if (pathname.startsWith("/inbox")) return true;
  if (pathname.startsWith("/leads")) return true;
  if (pathname.startsWith("/onboarding")) return true;
  if (pathname.startsWith("/billing")) return true;
  if (pathname.startsWith("/docs")) return true;
  return false;
}

function adminRedirectTarget(pathname: string): string {
  if (pathname.startsWith("/dashboard/settings")) return "/admin/settings";
  return "/admin";
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Invalid or expired code — continue; page can show an error
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/forms") ||
    path.startsWith("/inbox") ||
    path.startsWith("/leads") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/billing") ||
    path.startsWith("/admin");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    const isAdmin = await profileIsAdmin(supabase, user.id);

    if (isAdmin) {
      if (isUserWorkspacePath(path) && !path.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = adminRedirectTarget(path);
        url.search = "";
        return NextResponse.redirect(url);
      }
    } else {
      if (path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (
      (path === "/login" ||
        path === "/signup" ||
        path === "/forgot-password") &&
      user
    ) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

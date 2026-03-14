import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { locales, defaultLocale } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // omit /en for default locale
});

export async function middleware(request: NextRequest) {
  // 1. Run next-intl locale detection & rewriting
  const intlResponse = intlMiddleware(request);

  // 2. Refresh Supabase auth session (attaches cookies to response)
  //    Skip if Supabase env vars aren't configured yet (dev convenience)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { response } = await updateSession(request, intlResponse);
      return response;
    } catch {
      // Supabase not configured — continue without auth
    }
  }

  return intlResponse;
}

export const config = {
  // Match all paths except static files, api routes, and Next.js internals
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

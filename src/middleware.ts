import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PROTECTED_ROUTES = ["/dashboard", "/scan", "/routine", "/products", "/profile"];
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth/callback", "/api"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes and API routes through
  const isPublic = PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  if (isPublic) {
    return await updateSession(request);
  }

  // For all other routes, check authentication
  const response = await updateSession(request);

  // The session is refreshed by updateSession; we need to verify user
  // We can't easily extract the user from updateSession, so we'll rely on
  // client-side AuthGuard for SPA navigation and middleware for SSR/page loads.
  // For middleware-level protection, we'd need to replicate the cookie reading.
  // Instead, we let the request through and the AuthGuard on client handles redirect.
  // However, we can do a lightweight check by looking at the supabase session cookie.

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected) {
    // Check if there's a supabase auth token cookie
    const hasSession = request.cookies.get("sb-access-token")?.value ||
      request.cookies.get("sb-cnzoilxsttoqtvwotexd-auth-token")?.value ||
      request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)).*)",
  ],
};

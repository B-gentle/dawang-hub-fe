import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("dawang_token")?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Redirect unauthenticated users attempting to access /admin routes to /login
  if (isAdminRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("dawang_token")?.value;
  const { pathname, search } = request.nextUrl;

  if (!token) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isVendorRoute = pathname.startsWith("/vendor");

    // Admin pages: existing behaviour, send to login.
    // Vendor pages: visitor must sign up first, send to register.
    if (isAdminRoute || isVendorRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isVendorRoute ? "/register" : "/login";
      url.search = "";
      // "redirect" is the single param name used by login and register
      // (replaces the old "from" param).
      url.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};

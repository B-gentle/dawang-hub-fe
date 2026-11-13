import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("dawang_token")?.value;
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "dawang.com";

  // 1. Auth Protection for /admin and /vendor routes
  if (!token) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isVendorRoute = pathname.startsWith("/vendor");

    if (isAdminRoute || isVendorRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isVendorRoute ? "/register" : "/login";
      url.search = "";
      url.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
  }

  // 2. Multi-Tenant Storefront Subdomain Rewrite ({slug}.dawang.com -> /store/{slug})
  const cleanHost = hostname.split(":")[0]; // Strip port (e.g. :3000)
  const rootWithoutPort = rootDomain.split(":")[0];

  const isRootOrReserved =
    cleanHost === rootWithoutPort ||
    cleanHost === `www.${rootWithoutPort}` ||
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1";

  let subdomain = "";
  if (!isRootOrReserved) {
    if (cleanHost.endsWith(`.${rootWithoutPort}`)) {
      subdomain = cleanHost.replace(`.${rootWithoutPort}`, "");
    } else if (cleanHost.endsWith(".localhost")) {
      subdomain = cleanHost.replace(".localhost", "");
    }
  }

  if (subdomain && !["www", "api", "admin"].includes(subdomain)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/store/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "mail", "app"]);

export function proxy(request: NextRequest) {
  const token = request.cookies.get("dawang_token")?.value;
  const { pathname, search } = request.nextUrl;
  const hostname =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com"
  ).toLowerCase();

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

  // 2. Multi-Tenant Storefront Subdomain Rewrite ({slug}.globexmall.com -> /{slug})
  // Matches ./app/(store)/[slug]/page.tsx because (store) is a route group
  const cleanHost = hostname.split(":")[0].toLowerCase().trim();
  const rootWithoutPort = rootDomain.split(":")[0].trim();

  const isRootOrReserved =
    cleanHost === rootWithoutPort ||
    cleanHost === `www.${rootWithoutPort}` ||
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1";

  let subdomain = "";
  if (!isRootOrReserved) {
    if (cleanHost.endsWith(`.${rootWithoutPort}`)) {
      subdomain = cleanHost.slice(0, -(rootWithoutPort.length + 1));
    } else if (cleanHost.endsWith(".localhost")) {
      subdomain = cleanHost.slice(0, -".localhost".length);
    }
  }

  if (
    subdomain &&
    !subdomain.includes(".") &&
    !RESERVED_SUBDOMAINS.has(subdomain) &&
    pathname !== `/${subdomain}` &&
    !pathname.startsWith(`/${subdomain}/`)
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

/**
 * Only allow redirects to internal paths (e.g. "/vendor/setup").
 * Blocks absolute URLs ("https://evil.com"), protocol-relative URLs
 * ("//evil.com") and backslash tricks, so the ?redirect= param can't be
 * used as an open redirect.
 */
export function getSafeRedirect(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

/** Build "/login?redirect=%2Fvendor%2Fsetup" style links that keep the destination. */
export function withRedirect(path: string, redirect?: string | null): string {
  if (!redirect || redirect === "/") return path;
  return `${path}?redirect=${encodeURIComponent(redirect)}`;
}

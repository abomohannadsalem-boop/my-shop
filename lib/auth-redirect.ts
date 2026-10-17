/** Only allow same-site relative redirects ("/account", never "//evil.com" or "https://..."). */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  const value = String(next ?? "");
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}

/** Public origin of the site, also behind proxies such as Render. */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** Lightweight per-process abuse controls for app API routes.
 * For production DDoS protection, also use a CDN/WAF and platform-level rate limits.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function getClientAddress(request: Request): string {
  // Hosting platforms such as Vercel/Cloudflare populate these headers at the edge.
  // Configure the proxy to overwrite untrusted incoming forwarding headers in production.
  const edgeIp = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedParts = request.headers.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean);
  // Prefer platform-provided edge headers. If only X-Forwarded-For is available,
  // use the last entry (the nearest proxy) and configure the proxy to overwrite/append it safely.
  const forwarded = forwardedParts?.at(-1);
  return (edgeIp || realIp || forwarded || "local").slice(0, 80);
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(entryKey);
      if (buckets.size <= 5000) break;
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function requestRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  return checkRateLimit(`${scope}:${getClientAddress(request)}`, limit, windowMs);
}

/** Reject cross-origin browser writes when an Origin header is present. */
export function isCrossOriginWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false; // Non-browser/server-to-server clients may omit Origin; auth is still required.
  try {
    return new URL(origin).origin !== new URL(request.url).origin;
  } catch {
    return true;
  }
}

export function isBodyTooLarge(request: Request, maxBytes: number): boolean {
  const length = Number(request.headers.get("content-length") ?? 0);
  return Number.isFinite(length) && length > maxBytes;
}

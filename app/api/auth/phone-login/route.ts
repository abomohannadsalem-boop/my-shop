import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, isBodyTooLarge, isCrossOriginWrite, requestRateLimit } from "@/lib/request-guard";
import { cleanIranianMobileInput, isValidIranianMobile } from "@/lib/iran-phone";

// Login with phone + password for accounts whose Supabase login email is their real email.
// The server finds that email from the phone number (service role), then signs in with the
// password and sets the session cookies. The email is never sent back to the browser,
// except after a correct password when the email still needs confirmation.
export const dynamic = "force-dynamic";

const BAD = () => NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

export async function POST(request: Request) {
  if (isCrossOriginWrite(request)) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 403 });
  if (isBodyTooLarge(request, 4 * 1024)) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 413 });
  const ipRate = requestRateLimit(request, "phone-login-ip", 20, 10 * 60_000);
  if (!ipRate.allowed) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } });

  let body: { phone?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return BAD(); }
  const phone = cleanIranianMobileInput(String(body.phone ?? ""));
  const password = String(body.password ?? "");
  if (!isValidIranianMobile(phone) || password.length < 1 || password.length > 200) return BAD();

  const phoneRate = checkRateLimit(`phone-login:${phone}`, 8, 10 * 60_000);
  if (!phoneRate.allowed) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(phoneRate.retryAfterSeconds) } });

  const admin = createAdminClient();
  if (!admin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured; phone login for real-email accounts is unavailable.");
    return BAD();
  }

  const { data: profiles } = await admin.from("customer_profiles").select("user_id").eq("phone", phone).limit(3);
  if (!profiles || profiles.length === 0) return BAD();

  const supabase = await createClient();
  for (const profile of profiles) {
    const { data } = await admin.auth.admin.getUserById(profile.user_id);
    const email = data?.user?.email;
    if (!email) continue;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    if (error.message.toLowerCase().includes("not confirmed")) {
      return NextResponse.json({ ok: false, error: "email_not_confirmed", email }, { status: 403 });
    }
  }
  return BAD();
}

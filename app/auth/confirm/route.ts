import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin, safeNextPath } from "@/lib/auth-redirect";

// Optional token-hash landing route (works even if the email link is opened on another device).
// Use it by changing the Supabase email templates to:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup            (Confirm signup)
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password   (Reset password)
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change       (Change email)
export const dynamic = "force-dynamic";

const TYPES: EmailOtpType[] = ["signup", "recovery", "email_change", "invite", "magiclink", "email"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = requestOrigin(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const isRecovery = type === "recovery";
  const next = safeNextPath(searchParams.get("next"), isRecovery ? "/reset-password" : "/account?confirmed=1");

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}${isRecovery ? "/forgot-password?expired=1" : "/login"}`);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin, safeNextPath } from "@/lib/auth-redirect";

// Landing route for Supabase email links (email confirmation, password reset) that arrive with ?code=...
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = requestOrigin(request);
  const next = safeNextPath(searchParams.get("next"), "/account?confirmed=1");
  const isReset = next.startsWith("/reset-password");
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  // Link opened in another browser/device or expired. For sign-up links the email is already confirmed.
  return NextResponse.redirect(`${origin}${isReset ? "/forgot-password?expired=1" : "/login?confirmed=1"}`);
}

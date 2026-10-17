"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cleanIranianMobileInput, isValidIranianMobile, toPhoneLoginEmail } from "@/lib/iran-phone";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");
  const [needsConfirmEmail, setNeedsConfirmEmail] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("confirmed") === "1") setInfo("ایمیلت تأیید شد. حالا با شماره یا ایمیل و رمز عبور وارد شو.");
  }, []);

  function handleIdentifierChange(value: string) {
    // Keep email addresses intact; phone input accepts digits only (including Persian digits).
    setIdentifier(/[a-zA-Z@]/.test(value) ? value : cleanIranianMobileInput(value));
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setInfo("");
    setNeedsConfirmEmail("");

    const cleanIdentifier = identifier.trim();
    const supabase = createClient();
    let errorMessage: string | null = null;

    if (cleanIdentifier.includes("@")) {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanIdentifier.toLowerCase(), password });
      if (error) {
        errorMessage = error.message.toLowerCase().includes("not confirmed") ? "EMAIL_NOT_CONFIRMED" : "BAD";
        if (errorMessage === "EMAIL_NOT_CONFIRMED") setNeedsConfirmEmail(cleanIdentifier.toLowerCase());
      }
    } else {
      const localPhone = cleanIranianMobileInput(cleanIdentifier);
      if (!isValidIranianMobile(localPhone)) {
        setMessage("شماره موبایل باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود؛ یا ایمیلت را بنویس.");
        setLoading(false);
        return;
      }
      // 1) Old phone-only accounts still work directly with their internal address.
      const aliasEmail = toPhoneLoginEmail(localPhone);
      const direct = aliasEmail ? await supabase.auth.signInWithPassword({ email: aliasEmail, password }) : { error: { message: "x" } };
      if (direct.error) {
        // 2) Accounts whose login email is their real email: the server finds it from the phone number.
        try {
          const res = await fetch("/api/auth/phone-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: localPhone, password }) });
          const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; email?: string };
          if (!res.ok || !json.ok) {
            errorMessage = json.error === "email_not_confirmed" ? "EMAIL_NOT_CONFIRMED" : "BAD";
            if (json.error === "email_not_confirmed" && json.email) setNeedsConfirmEmail(json.email);
            if (res.status === 429) errorMessage = "RATE";
          } else {
            // The server set the session cookies; reload so the whole site (header, cart) picks them up.
            window.location.assign("/");
            return;
          }
        } catch {
          errorMessage = "BAD";
        }
      }
    }

    setLoading(false);
    if (errorMessage === "EMAIL_NOT_CONFIRMED") { setMessage("ایمیلت هنوز تأیید نشده؛ لینکی که موقع ثبت‌نام برایت فرستادیم را باز کن."); return; }
    if (errorMessage === "RATE") { setMessage("تلاش‌های زیاد. چند دقیقه بعد دوباره امتحان کن."); return; }
    if (errorMessage) { setMessage("شماره/ایمیل یا رمز عبور اشتباه است."); return; }
    router.push("/");
    router.refresh();
  }

  async function resendConfirmation() {
    if (!needsConfirmEmail) return;
    const { error } = await createClient().auth.resend({ type: "signup", email: needsConfirmEmail, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setInfo(error ? "ارسال دوباره انجام نشد. کمی بعد تلاش کن." : "لینک تأیید دوباره ارسال شد.");
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600";
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center"><h1 className="text-3xl font-bold">ورود به حساب</h1><p className="mt-3 text-gray-500">با شماره موبایل یا ایمیل وارد شوید</p></div>
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-medium">شماره موبایل یا ایمیل</label>
            <input type="text" dir="ltr" inputMode={identifier.includes("@") ? "email" : "numeric"} autoComplete="username" value={identifier} onChange={e => handleIdentifierChange(e.target.value)} placeholder="09123456789 یا name@example.com" required className={`${inputClass} text-left`} />
          </div>
          <div>
            <label className="mb-2 block font-medium">رمز عبور</label>
            <div className="relative"><input type={showPassword ? "text" : "password"} dir="ltr" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="رمز عبور" required className={`${inputClass} text-left`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800">{showPassword ? "پنهان" : "نمایش"}</button></div>
            <div className="mt-2 text-left"><Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">رمز عبورم را فراموش کرده‌ام</Link></div>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "در حال ورود..." : "ورود"}</button>
        </form>
        {info && <div role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">{info}</div>}
        {message && <div role="status" className="mt-5 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">{message}{needsConfirmEmail && <button type="button" onClick={resendConfirmation} className="mt-2 block w-full font-semibold text-blue-600 hover:underline">ارسال دوباره لینک تأیید</button>}</div>}
        <div className="mt-6 text-center text-sm text-gray-500">حساب کاربری ندارید؟ <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">ثبت‌نام کنید</Link></div>
      </div>
    </main>
  );
}

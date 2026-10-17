"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("expired") === "1") setMessage("لینک نامعتبر یا منقضی شده بود. اگر لینک را در مرورگر دیگری باز کردی، دوباره درخواست بده و لینک را در همین مرورگر باز کن.");
  }, []);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) { setMessage("ایمیل را درست وارد کن."); return; }
    setLoading(true);
    setMessage("");
    // The reset link is always sent only to the account's own email, never to anything the visitor types elsewhere.
    const { error } = await createClient().auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    setLoading(false);
    if (error && (error.status === 429 || error.message.toLowerCase().includes("rate"))) { setMessage("تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کن."); return; }
    if (error) console.error("resetPasswordForEmail failed:", { code: error.code, message: error.message });
    // Same answer whether or not the email exists (so nobody can probe which emails are registered).
    setSent(true);
    setSecondsLeft(60);
  }

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center"><h1 className="text-3xl font-bold">فراموشی رمز عبور</h1><p className="mt-3 text-gray-500">ایمیلی که با آن ثبت‌نام کرده‌ای را بنویس؛ لینک ساخت رمز جدید را برایش می‌فرستیم.</p></div>
        {sent ? (
          <div className="mt-8 text-center">
            <p className="rounded-lg bg-green-50 p-4 text-sm leading-7 text-green-800">اگر این ایمیل در سایت ثبت شده باشد، لینک ساخت رمز جدید برایش ارسال شد. (پوشه اسپم را هم نگاه کن.)</p>
            <button type="button" disabled={secondsLeft > 0 || loading} onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400">{secondsLeft > 0 ? `ارسال دوباره (${secondsLeft.toLocaleString("fa-IR")} ثانیه)` : "ارسال دوباره"}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div><label className="mb-2 block font-medium">ایمیل</label><input type="email" dir="ltr" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left outline-none transition focus:border-blue-600" /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}</button>
          </form>
        )}
        {message && <div role="status" className="mt-5 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">{message}</div>}
        <div className="mt-6 text-center text-sm text-gray-500"><Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">بازگشت به ورود</Link></div>
      </div>
    </main>
  );
}

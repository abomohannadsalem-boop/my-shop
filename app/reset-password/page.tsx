"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState<"checking" | "ok" | "none">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setReady(data.user ? "ok" : "none"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) { setMessage("رمز عبور باید حداقل ۶ کاراکتر باشد."); return; }
    if (password !== confirm) { setMessage("رمز و تکرار آن یکسان نیستند."); return; }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      const lower = error.message.toLowerCase();
      setMessage(lower.includes("same") ? "رمز جدید باید با رمز قبلی فرق داشته باشد." : lower.includes("weak") ? "رمز ضعیف است؛ رمز قوی‌تری انتخاب کن." : "تغییر رمز انجام نشد. دوباره درخواست لینک بده.");
      return;
    }
    setDone(true);
    setTimeout(() => { window.location.assign("/account"); }, 1500);
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-left outline-none transition focus:border-blue-600";
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center"><h1 className="text-3xl font-bold">ساخت رمز عبور جدید</h1></div>
        {ready === "checking" && <p className="mt-8 text-center text-gray-500">در حال بررسی لینک...</p>}
        {ready === "none" && (
          <div className="mt-8 text-center"><p className="rounded-lg bg-red-50 p-4 text-sm leading-7 text-red-600">لینک بازیابی نامعتبر یا منقضی است. لینک را باید در همان مرورگری باز کنی که درخواست دادی.</p><Link href="/forgot-password" className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-700">درخواست لینک جدید</Link></div>
        )}
        {ready === "ok" && !done && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div><label className="mb-2 block font-medium">رمز عبور جدید</label>
              <div className="relative"><input type={showPassword ? "text" : "password"} dir="ltr" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required className={inputClass} /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800">{showPassword ? "پنهان" : "نمایش"}</button></div></div>
            <div><label className="mb-2 block font-medium">تکرار رمز عبور</label><input type={showPassword ? "text" : "password"} dir="ltr" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={6} required className={inputClass} /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}</button>
          </form>
        )}
        {done && <p className="mt-8 rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">رمز عبور تغییر کرد و وارد حسابت شدی.</p>}
        {message && <div role="status" className="mt-5 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">{message}</div>}
      </div>
    </main>
  );
}

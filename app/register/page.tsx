"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cleanIranianMobileInput, cleanDigits, isValidIranianMobile } from "@/lib/iran-phone";
import JalaliDateInput from "@/app/components/JalaliDateInput";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [birthDate, setBirthDate] = useState(""); // Gregorian ISO, picked in Jalali
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const checks = [
    { ok: isValidIranianMobile(phone), label: "شماره موبایل ۱۱ رقمی" },
    { ok: nationalId.length === 10, label: "کد ملی ۱۰ رقمی" },
    { ok: postalCode.length === 10, label: "کد پستی ۱۰ رقمی" },
    { ok: !!birthDate, label: "تاریخ تولد" },
    { ok: EMAIL_PATTERN.test(email.trim()), label: "ایمیل (تأیید با لینکی که برایت می‌فرستیم)" },
  ];

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const localPhone = cleanIranianMobileInput(phone);
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidIranianMobile(localPhone)) { setMessage("شماره موبایل باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود؛ مثل 09123456789."); setLoading(false); return; }
    if (!EMAIL_PATTERN.test(cleanEmail)) { setMessage("ایمیل را درست وارد کن؛ حساب با لینک تأیید همین ایمیل فعال می‌شود."); setLoading(false); return; }
    if (nationalId && nationalId.length !== 10) { setMessage("کد ملی باید ۱۰ رقم باشد (یا خالی بماند)."); setLoading(false); return; }
    if (postalCode && postalCode.length !== 10) { setMessage("کد پستی باید ۱۰ رقم باشد (یا خالی بماند)."); setLoading(false); return; }
    if (password.length < 6) { setMessage("رمز عبور باید حداقل ۶ کاراکتر باشد."); setLoading(false); return; }

    const supabase = createClient();

    // Friendly duplicate check (phone / national ID belong to one account only).
    const { data: conflict } = await supabase.rpc("registration_conflicts", { p_phone: localPhone, p_national_id: nationalId || null });
    if (conflict === "phone") { setMessage("این شماره قبلاً ثبت شده است؛ وارد شو یا اگر رمز را فراموش کرده‌ای از «فراموشی رمز» استفاده کن."); setLoading(false); return; }
    if (conflict === "national_id") { setMessage("این کد ملی قبلاً برای حساب دیگری ثبت شده است."); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName.trim(),
          phone: localPhone,
          local_phone: localPhone,
          national_id: nationalId || null,
          contact_email: cleanEmail,
          postal_code: postalCode || null,
          date_of_birth: birthDate || null,
        },
      },
    });
    setLoading(false);

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("already registered") || lower.includes("already been registered")) {
        setMessage("این ایمیل قبلاً ثبت شده است؛ وارد شو یا «فراموشی رمز» را بزن.");
      } else if (lower.includes("rate limit") || lower.includes("too many") || error.status === 429) {
        setMessage("تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کن.");
      } else if (lower.includes("database error")) {
        setMessage("ثبت‌نام انجام نشد؛ احتمالاً شماره یا کد ملی قبلاً ثبت شده است.");
      } else if (lower.includes("signup") && lower.includes("disabled")) {
        setMessage("ثبت‌نام کاربران جدید در Supabase غیرفعال است.");
      } else if (lower.includes("weak") || lower.includes("password")) {
        setMessage("رمز عبور ضعیف است؛ یک رمز قوی‌تر انتخاب کن.");
      } else {
        console.error("Golden Lion registration failed:", { code: error.code, message: error.message });
        setMessage("ثبت‌نام انجام نشد. چند دقیقه بعد دوباره تلاش کن.");
      }
      return;
    }

    // Supabase hides "email already registered" by returning a user with no identities.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setMessage("این ایمیل قبلاً ثبت شده است؛ وارد شو یا «فراموشی رمز» را بزن.");
      return;
    }

    setSentTo(cleanEmail);
    setSecondsLeft(60);
  }

  async function resend() {
    if (secondsLeft > 0 || !sentTo) return;
    const { error } = await createClient().auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setMessage(error ? "ارسال دوباره انجام نشد. کمی بعد تلاش کن." : "لینک تأیید دوباره ارسال شد.");
    setSecondsLeft(60);
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  if (sentTo) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">📩</div>
          <h1 className="mt-4 text-2xl font-bold">ایمیل خودت را چک کن</h1>
          <p className="mt-4 leading-8 text-gray-600">لینک تأیید برای <span dir="ltr" className="font-bold text-gray-900">{sentTo}</span> فرستاده شد. روی لینک بزن تا حسابت فعال شود (پوشه اسپم را هم نگاه کن). فقط همین یک بار تأیید لازم است؛ بعدش با «شماره» یا «ایمیل» وارد می‌شوی.</p>
          {message && <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">{message}</p>}
          <button type="button" onClick={resend} disabled={secondsLeft > 0} className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400">{secondsLeft > 0 ? `ارسال دوباره لینک (${secondsLeft.toLocaleString("fa-IR")} ثانیه)` : "ارسال دوباره لینک"}</button>
          <div className="mt-6"><Link href="/login" className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">رفتن به صفحه ورود</Link></div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="text-center"><h1 className="text-3xl font-bold">ایجاد حساب کاربری</h1><p className="mt-3 text-gray-500">نام، شماره موبایل، ایمیل و رمز عبور الزامی است.</p></div>
        <form onSubmit={handleRegister} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-2 block font-medium">نام و نام خانوادگی <span className="text-red-600">*</span></span><input type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" required maxLength={150} className={inputClass} /></label>
          <label className="block"><span className="mb-2 block font-medium">شماره موبایل <span className="text-red-600">*</span></span><input type="tel" inputMode="numeric" dir="ltr" autoComplete="tel-national" value={phone} onChange={e => setPhone(cleanIranianMobileInput(e.target.value))} placeholder="09123456789" pattern="09[0-9]{9}" minLength={11} maxLength={11} required className={`${inputClass} text-left tracking-wider`} /><span className="mt-1 block text-xs text-slate-500">فقط ۱۱ رقم، بدون فاصله.</span></label>
          <label className="block"><span className="mb-2 block font-medium">ایمیل <span className="text-red-600">*</span></span><input type="email" dir="ltr" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required className={`${inputClass} text-left`} /></label>
          <label className="block"><span className="mb-2 block font-medium">کد ملی (اختیاری)</span><input type="text" inputMode="numeric" dir="ltr" value={nationalId} onChange={e => setNationalId(cleanDigits(e.target.value, 10))} placeholder="۱۰ رقم" maxLength={10} className={`${inputClass} text-left tracking-wider`} /></label>
          <label className="block"><span className="mb-2 block font-medium">کد پستی (اختیاری)</span><input type="text" inputMode="numeric" dir="ltr" autoComplete="postal-code" value={postalCode} onChange={e => setPostalCode(cleanDigits(e.target.value, 10))} placeholder="۱۰ رقم" maxLength={10} className={`${inputClass} text-left tracking-wider`} /></label>
          <div className="sm:col-span-2"><span className="mb-2 block font-medium">تاریخ تولد شمسی (اختیاری)</span><JalaliDateInput value={birthDate} onChange={setBirthDate} /></div>
          <label className="block sm:col-span-2"><span className="mb-2 block font-medium">رمز عبور <span className="text-red-600">*</span></span>
            <div className="relative"><input type={showPassword ? "text" : "password"} dir="ltr" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" minLength={6} required className={`${inputClass} text-left`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800">{showPassword ? "پنهان" : "نمایش"}</button></div>
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm sm:col-span-2">
            <p className="font-bold text-amber-900">برای گرفتن نشان «حساب تأییدشده» این موارد لازم است:</p>
            <ul className="mt-2 space-y-1">{checks.map(c => <li key={c.label} className={c.ok ? "text-green-700" : "text-slate-600"}>{c.ok ? "✓" : "○"} {c.label}</li>)}</ul>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">{loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}</button>
        </form>
        {message && <div role="status" className="mt-5 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">{message}</div>}
        <div className="mt-6 text-center text-sm text-gray-500">قبلاً حساب ساخته‌اید؟ <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">وارد شوید</Link></div>
      </div>
    </main>
  );
}

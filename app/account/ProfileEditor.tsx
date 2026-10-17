"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cleanDigits, cleanIranianMobileInput, isValidIranianMobile } from "@/lib/iran-phone";
import { formatJalaliDate } from "@/lib/jalali";
import JalaliDateInput from "@/app/components/JalaliDateInput";
import VerifiedBadge from "@/app/components/VerifiedBadge";

export type ProfileData = {
  userId: string;
  customerCode: string;
  fullName: string;
  phone: string;
  nationalId: string;
  postalCode: string;
  dateOfBirth: string; // Gregorian ISO
  contactEmail: string; // confirmed/login email shown to the user ("" for old phone-only accounts)
  pendingEmail: string; // new email waiting for confirmation
  isVerified: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ProfileEditor({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.pendingEmail || profile.contactEmail);
  const [nationalId, setNationalId] = useState(profile.nationalId);
  const [postalCode, setPostalCode] = useState(profile.postalCode);
  const [birthDate, setBirthDate] = useState(profile.dateOfBirth);

  const missing = [
    !isValidIranianMobile(profile.phone) && "شماره موبایل ۱۱ رقمی",
    !/^\d{10}$/.test(profile.nationalId) && "کد ملی ۱۰ رقمی",
    !/^\d{10}$/.test(profile.postalCode) && "کد پستی ۱۰ رقمی",
    !profile.dateOfBirth && "تاریخ تولد",
    !profile.contactEmail && "ایمیل تأییدشده",
  ].filter(Boolean) as string[];

  function startEdit() {
    setFullName(profile.fullName); setPhone(profile.phone); setEmail(profile.pendingEmail || profile.contactEmail);
    setNationalId(profile.nationalId); setPostalCode(profile.postalCode); setBirthDate(profile.dateOfBirth);
    setMessage(""); setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(""); setOk(false);
    const localPhone = cleanIranianMobileInput(phone);
    const cleanEmail = email.trim().toLowerCase();
    if (!fullName.trim()) return setMessage("نام را وارد کن.");
    if (!isValidIranianMobile(localPhone)) return setMessage("شماره موبایل باید ۱۱ رقم و شروع با ۰۹ باشد.");
    if (nationalId && nationalId.length !== 10) return setMessage("کد ملی باید ۱۰ رقم باشد (یا خالی بماند).");
    if (postalCode && postalCode.length !== 10) return setMessage("کد پستی باید ۱۰ رقم باشد (یا خالی بماند).");
    if (cleanEmail && !EMAIL_PATTERN.test(cleanEmail)) return setMessage("ایمیل را درست وارد کن.");

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("customer_profiles").update({
      full_name: fullName.trim(),
      phone: localPhone,
      national_id: nationalId || null,
      postal_code: postalCode || null,
      date_of_birth: birthDate || null,
    }).eq("user_id", profile.userId);

    if (error) {
      setSaving(false);
      if (error.code === "23505") {
        return setMessage(error.message.includes("national") ? "این کد ملی برای حساب دیگری ثبت شده است." : "این شماره برای حساب دیگری ثبت شده است.");
      }
      console.error("Profile update failed", error);
      return setMessage("ذخیره انجام نشد. دوباره تلاش کن.");
    }

    let extra = "";
    if (cleanEmail && cleanEmail !== profile.contactEmail.toLowerCase() && cleanEmail !== profile.pendingEmail.toLowerCase()) {
      const { error: emailError } = await supabase.auth.updateUser({ email: cleanEmail }, { emailRedirectTo: `${window.location.origin}/auth/callback` });
      if (emailError) {
        extra = emailError.message.toLowerCase().includes("already") ? " ولی این ایمیل برای حساب دیگری ثبت شده است." : " ولی ارسال لینک تأیید ایمیل انجام نشد.";
      } else {
        extra = " لینک تأیید برای ایمیل جدید فرستاده شد؛ تا تأیید، ایمیل قبلی معتبر است.";
      }
    }
    setSaving(false);
    setOk(true);
    setMessage(`اطلاعات ذخیره شد.${extra}`);
    setEditing(false);
    router.refresh();
  }

  const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
  const card = "rounded-xl bg-gray-50 p-5";
  const view = (label: string, value: string, ltr = false) => (
    <div className={card}><p className="text-sm text-gray-500">{label}</p><p dir={ltr ? "ltr" : undefined} className={`mt-2 font-semibold ${ltr ? "text-right" : ""}`}>{value || "—"}</p></div>
  );

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold">اطلاعات حساب</h2><VerifiedBadge verified={profile.isVerified} /></div>
        {!editing && <button type="button" onClick={startEdit} className="rounded-lg border border-blue-600 px-5 py-2 font-semibold text-blue-700 transition hover:bg-blue-50">ویرایش اطلاعات</button>}
      </div>

      {!profile.isVerified && missing.length > 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-7 text-amber-900">برای گرفتن نشان «حساب تأییدشده» این موارد را کامل کن: {missing.join("، ")}.</p>
      )}
      {profile.pendingEmail && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">ایمیل <span dir="ltr" className="font-bold">{profile.pendingEmail}</span> منتظر تأیید است؛ لینک داخل ایمیل را باز کن.</p>}
      {message && <p role="status" className={`mt-3 rounded-lg p-3 text-sm ${ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-600"}`}>{message}</p>}

      {!editing ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {view("نام", profile.fullName)}
          <div className={card}><p className="text-sm text-gray-500">کد مشتری</p><p className="mt-2 font-bold text-blue-700">{profile.customerCode || "—"}</p></div>
          {view("شماره موبایل", profile.phone, true)}
          {view("ایمیل", profile.contactEmail, true)}
          {view("کد ملی", profile.nationalId, true)}
          {view("کد پستی", profile.postalCode, true)}
          {view("تاریخ تولد", formatJalaliDate(profile.dateOfBirth))}
        </div>
      ) : (
        <form onSubmit={save} className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="text-sm text-gray-600">نام و نام خانوادگی</span><input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={150} required className={inputClass} /></label>
          <div className={card}><p className="text-sm text-gray-500">کد مشتری (قابل ویرایش نیست)</p><p className="mt-2 font-bold text-blue-700">{profile.customerCode || "—"}</p></div>
          <label className="block"><span className="text-sm text-gray-600">شماره موبایل</span><input dir="ltr" inputMode="numeric" value={phone} onChange={e => setPhone(cleanIranianMobileInput(e.target.value))} maxLength={11} required className={`${inputClass} text-left`} /></label>
          <label className="block"><span className="text-sm text-gray-600">ایمیل (برای تغییر، لینک تأیید می‌فرستیم)</span><input type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} text-left`} /></label>
          <label className="block"><span className="text-sm text-gray-600">کد ملی (۱۰ رقم)</span><input dir="ltr" inputMode="numeric" value={nationalId} onChange={e => setNationalId(cleanDigits(e.target.value, 10))} maxLength={10} className={`${inputClass} text-left`} /></label>
          <label className="block"><span className="text-sm text-gray-600">کد پستی (۱۰ رقم)</span><input dir="ltr" inputMode="numeric" value={postalCode} onChange={e => setPostalCode(cleanDigits(e.target.value, 10))} maxLength={10} className={`${inputClass} text-left`} /></label>
          <div className="sm:col-span-2"><span className="text-sm text-gray-600">تاریخ تولد (شمسی)</span><div className="mt-1"><JalaliDateInput value={birthDate} onChange={setBirthDate} /></div></div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
            <button type="button" onClick={() => { setEditing(false); setMessage(""); }} className="rounded-lg border px-6 py-3">انصراف</button>
          </div>
        </form>
      )}
    </div>
  );
}

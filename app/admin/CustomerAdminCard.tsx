"use client";

import { useState } from "react";
import { cleanDigits, cleanIranianMobileInput, isPhoneAliasEmail, isValidIranianMobile } from "@/lib/iran-phone";
import { formatJalaliDate } from "@/lib/jalali";
import { formatProductCode } from "@/lib/product-stock";
import JalaliDateInput from "@/app/components/JalaliDateInput";
import VerifiedBadge from "@/app/components/VerifiedBadge";

export type AdminCustomer = {
  user_id: string; customer_code: string; full_name: string; phone?: string | null; contact_email?: string | null;
  national_id?: string | null; postal_code?: string | null; date_of_birth?: string | null; is_verified?: boolean | null; created_at: string;
};
type CartItem = { id: number; product_code?: string | null; name: string; price: number; quantity: number; color_name?: string | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function CustomerAdminCard({ customer, items, onChanged, notify }: {
  customer: AdminCustomer; items: CartItem[]; onChanged: () => Promise<void> | void; notify: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState(customer.full_name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [email, setEmail] = useState(isPhoneAliasEmail(customer.contact_email) ? "" : customer.contact_email ?? "");
  const [nationalId, setNationalId] = useState(customer.national_id ?? "");
  const [postalCode, setPostalCode] = useState(customer.postal_code ?? "");
  const [birthDate, setBirthDate] = useState(customer.date_of_birth ?? "");
  const [password, setPassword] = useState("");

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  function startEdit() {
    setFullName(customer.full_name ?? ""); setPhone(customer.phone ?? ""); setEmail(isPhoneAliasEmail(customer.contact_email) ? "" : customer.contact_email ?? "");
    setNationalId(customer.national_id ?? ""); setPostalCode(customer.postal_code ?? ""); setBirthDate(customer.date_of_birth ?? ""); setPassword("");
    setError(""); setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const localPhone = cleanIranianMobileInput(phone);
    if (!fullName.trim()) return setError("نام را وارد کن.");
    if (localPhone && !isValidIranianMobile(localPhone)) return setError("شماره موبایل باید ۱۱ رقم و شروع با ۰۹ باشد.");
    if (nationalId && nationalId.length !== 10) return setError("کد ملی باید ۱۰ رقم باشد.");
    if (postalCode && postalCode.length !== 10) return setError("کد پستی باید ۱۰ رقم باشد.");
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) return setError("ایمیل نامعتبر است.");
    if (password && password.length < 6) return setError("رمز جدید باید حداقل ۶ کاراکتر باشد.");

    setBusy(true);
    const res = await fetch("/api/admin/customers", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: customer.user_id, full_name: fullName, phone: localPhone, email, national_id: nationalId, postal_code: postalCode, date_of_birth: birthDate, password }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setBusy(false);
    if (!res.ok || !json.ok) return setError(json.error ?? "ذخیره انجام نشد.");
    setEditing(false);
    notify("مشخصات مشتری ذخیره شد.");
    await onChanged();
  }

  async function remove(force = false) {
    const confirmText = force
      ? `این مشتری سفارش ثبت‌شده دارد. حذف حساب ممکن است سفارش‌هایش را هم حذف کند یا خطا بدهد. باز هم «${customer.full_name || customer.customer_code}» حذف شود؟`
      : `حساب «${customer.full_name || customer.customer_code}» (${customer.customer_code}) برای همیشه حذف شود؟ این کار برگشت ندارد.`;
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await fetch("/api/admin/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: customer.user_id, force }) });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; orders?: number };
    setBusy(false);
    if (res.status === 409 && json.orders) { return remove(true); }
    if (!res.ok || !json.ok) { window.alert(json.error ?? "حذف انجام نشد."); return; }
    notify("مشتری حذف شد.");
    await onChanged();
  }

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600";
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl p-5 text-right transition hover:bg-slate-50">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{customer.full_name || "بدون نام"}</h3><VerifiedBadge verified={!!customer.is_verified} /></div>
          <p className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">کد مشتری: {customer.customer_code}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left text-sm text-slate-500"><p>{customer.created_at ? new Date(customer.created_at).toLocaleDateString("fa-IR") : ""}</p><p className="mt-1">مجموع سبد: <strong className="text-slate-800">{total.toLocaleString("fa-IR")} تومان</strong></p></div>
          <span aria-hidden="true" className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
        </div>
      </button>

      {open && <div className="border-t border-slate-100 px-5 pb-5">
        {!editing ? <>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <p><span className="text-slate-500">تلفن:</span> <span dir="ltr">{customer.phone || "—"}</span></p>
            <p><span className="text-slate-500">ایمیل:</span> <span dir="ltr">{isPhoneAliasEmail(customer.contact_email) ? "—" : customer.contact_email || "—"}</span></p>
            <p><span className="text-slate-500">کد ملی:</span> <span dir="ltr">{customer.national_id || "—"}</span></p>
            <p><span className="text-slate-500">کد پستی:</span> <span dir="ltr">{customer.postal_code || "—"}</span></p>
            <p><span className="text-slate-500">تاریخ تولد:</span> {formatJalaliDate(customer.date_of_birth) || "—"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={startEdit} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">ویرایش مشخصات</button>
            <button type="button" disabled={busy} onClick={() => remove(false)} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">حذف مشتری</button>
          </div>
        </> : (
          <form onSubmit={save} className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <label className="block">نام و نام خانوادگی<input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={150} required className={inputClass} /></label>
            <label className="block">شماره موبایل<input dir="ltr" inputMode="numeric" value={phone} onChange={e => setPhone(cleanIranianMobileInput(e.target.value))} maxLength={11} className={`${inputClass} text-left`} /></label>
            <label className="block">ایمیل (تغییر ایمیل بدون ایمیل تأیید اعمال می‌شود)<input type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClass} text-left`} /></label>
            <label className="block">کد ملی (۱۰ رقم)<input dir="ltr" inputMode="numeric" value={nationalId} onChange={e => setNationalId(cleanDigits(e.target.value, 10))} maxLength={10} className={`${inputClass} text-left`} /></label>
            <label className="block">کد پستی (۱۰ رقم)<input dir="ltr" inputMode="numeric" value={postalCode} onChange={e => setPostalCode(cleanDigits(e.target.value, 10))} maxLength={10} className={`${inputClass} text-left`} /></label>
            <div>تاریخ تولد (شمسی)<div className="mt-1"><JalaliDateInput value={birthDate} onChange={setBirthDate} /></div></div>
            <label className="block sm:col-span-2">رمز عبور جدید (فقط اگر می‌خواهی عوض شود)<input type="text" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} placeholder="خالی = بدون تغییر" autoComplete="off" className={`${inputClass} text-left`} /></label>
            {error && <p className="rounded-lg bg-red-50 p-3 text-red-600 sm:col-span-2">{error}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button type="submit" disabled={busy} className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? "در حال ذخیره..." : "ذخیره"}</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border px-5 py-2">انصراف</button>
            </div>
          </form>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="mb-2 font-bold">سبد خرید ({count} کالا)</p>
          {items.length === 0 ? <p className="text-sm text-slate-500">سبد خرید خالی است.</p> : <div className="space-y-2">{items.map((item, index) => (
            <div key={`${item.id}-${item.color_name ?? ""}-${index}`} className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2 text-sm last:border-0 last:pb-0">
              <span>{item.name} <span className="text-xs text-slate-400" dir="ltr">({formatProductCode(item.product_code, item.id)})</span>{item.color_name ? ` · رنگ ${item.color_name}` : ""} × {Number(item.quantity) || 0}</span>
              <span>{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString("fa-IR")} تومان</span>
            </div>))}</div>}
        </div>
      </div>}
    </article>
  );
}

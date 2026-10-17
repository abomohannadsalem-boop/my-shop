import Link from "next/link";

const email = "mrehsanshop@gmail.com";
const phone = "09198777328";

export default function WholesalePage() {
  return (
    <main dir="rtl" className="mx-auto max-w-4xl px-5 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">درخواست همکاری و خرید عمده</h1>
      <p className="mt-4 leading-8 text-slate-600">
        برای ثبت درخواست خرید عمده یا شروع همکاری، از یکی از راه‌های ارتباطی زیر با ما تماس بگیرید.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <a href={`tel:${phone}`} className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">
          <span className="block font-bold text-slate-900">تلفن پشتیبانی</span>
          <span className="mt-2 block text-amber-700" dir="ltr">{phone}</span>
        </a>
        <a href={`mailto:${email}?subject=${encodeURIComponent("درخواست همکاری و خرید عمده")}`} className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">
          <span className="block font-bold text-slate-900">ایمیل</span>
          <span className="mt-2 block text-amber-700" dir="ltr">{email}</span>
        </a>
        <a href="https://instagram.com/goldenlion__store" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">ارتباط از طریق اینستاگرام</a>
        <a href="https://t.me/goldenlionstore" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">ارتباط از طریق تلگرام</a>
        <a href="https://ble.ir/goldenlionstore" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">ارتباط از طریق بله</a>
        <a href="https://rubika.ir/goldenlionstore" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-5 hover:border-amber-400">ارتباط از طریق روبیکا</a>
      </div>
      <p className="mt-6 text-sm leading-7 text-slate-500">پیش از انتشار نهایی، نشانی شبکه‌های اجتماعی را بررسی کن تا مطمئن شوی هر لینک به حساب رسمی فروشگاه می‌رود.</p>
      <Link href="/products" className="mt-6 inline-block text-amber-700 hover:underline">بازگشت به محصولات ←</Link>
    </main>
  );
}

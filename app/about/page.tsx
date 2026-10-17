import Link from "next/link";

export default function AboutPage() {
  return (
    <main dir="rtl" className="mx-auto max-w-4xl px-5 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">درباره ما</h1>
      <p className="mt-5 leading-8 text-slate-600">
        Golden Lion فروشگاه تخصصی قاب و لوازم جانبی موبایل است. هدف ما فراهم کردن راهی ساده برای مشاهده محصولات و انتخاب قاب مناسب مدل گوشی شماست.
      </p>
      <p className="mt-3 leading-8 text-slate-600">
        برای دریافت راهنمایی درباره محصولات یا همکاری در خرید عمده، از صفحه تماس با ما یا درخواست همکاری استفاده کنید.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-md">
        <img src="/about-social-links.jpg" alt="راه‌های ارتباطی Golden Lion Store: وب‌سایت، اینستاگرام، تلگرام، بله و روبیکا" className="mx-auto block h-auto w-full max-w-xl" />
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/contact" className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700">تماس با ما</Link>
        <Link href="/wholesale" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50">درخواست همکاری و خرید عمده</Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";

const CONTACT_EMAIL = "mrehsanshop@gmail.com";
const SUPPORT_PHONE = "09198777328";

const socials = [
  { label: "روبیکا", href: "https://rubika.ir/goldenlionstore", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2.5 20 7v10l-8 4.5L4 17V7z" /><path d="M4 7l8 4.5L20 7M12 11.5v10" /></svg>
  ) },
  { label: "تلگرام", href: "https://t.me/goldenlionstore", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M21.5 3.3 2.7 10.6c-.9.4-.9 1.1-.2 1.3l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.8c.3-1.2-.4-1.7-1.2-1.4zM8.5 13.2l9.3-5.9c.4-.3.8-.1.5.2l-7.6 6.9-.3 3.1z" /></svg>
  ) },
  { label: "اینستاگرام", href: "https://instagram.com/goldenlion__store", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
  ) },
  { label: "بله", href: "https://ble.ir/goldenlionstore", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="m7.8 12.4 3 3 5.4-6" /></svg>
  ) },
];

export default function Footer() {
  return (
    <footer dir="rtl" className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/golden-lion-logo.png" alt="لوگوی Golden Lion" width={64} height={64} className="h-12 w-12 shrink-0 object-contain" />
            <h2 className="text-xl font-extrabold text-white">Golden Lion</h2>
          </div>
          <p className="mt-4 leading-7 text-gray-400">فروشگاه آنلاین Golden Lion؛ تولید و عرضه قاب و لوازم جانبی موبایل.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">لینک‌های سریع</h2>
          <nav className="mt-4 flex flex-col items-start gap-3">
            <Link href="/" className="hover:text-amber-300">خانه</Link>
            <Link href="/products" className="hover:text-amber-300">محصولات</Link>
            <Link href="/contact" className="hover:text-amber-300">تماس با ما</Link>
            <Link href="/about" className="hover:text-amber-300">درباره ما</Link>
            <Link href="/wholesale" className="hover:text-amber-300">درخواست همکاری و خرید عمده</Link>
          </nav>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">تماس با ما</h2>
          <div className="mt-4 space-y-3 text-gray-400">
            <p>تلفن پشتیبانی: <a href={`tel:${SUPPORT_PHONE}`} dir="ltr" className="text-gray-200 hover:text-amber-300">{SUPPORT_PHONE}</a></p>
            <p>ایمیل: <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="text-blue-300 hover:text-white">{CONTACT_EMAIL}</a></p>
          </div>
          <div className="mt-5 flex items-center gap-3" aria-label="شبکه‌های اجتماعی Golden Lion">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition hover:border-amber-400 hover:bg-gray-800 hover:text-amber-300">{social.icon}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-sm text-gray-500">© {new Date().getFullYear()} Golden Lion — تمامی حقوق محفوظ است.</div>
    </footer>
  );
}

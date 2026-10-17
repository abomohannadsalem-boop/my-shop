This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


کد محصول خودکار: برای تولید `product_code` و ذخیره کد در سفارش‌ها، فایل `supabase/migrations/20261014_auto_product_codes.sql` را نیز در Supabase SQL Editor اجرا کنید. شناسه‌ی داخلی `products.id` را دستی تغییر ندهید.


## ورود با شماره تلفن و دسترسی مدیریت مشتریان

در فرم ورود و ثبت‌نام شماره محلی ایران را وارد کنید، مانند `09123456789`. ورودی فقط رقم و دقیقاً ۱۱ رقم با شروع `09` را می‌پذیرد. برنامه پشت صحنه شماره را به قالب E.164 موردنیاز Supabase Auth تبدیل می‌کند؛ کاربر نیازی به وارد کردن `+98` ندارد.

پس از اجرای migrationهای پایه، فایل `supabase/migrations/20261014_phone_login_admin_customer_access.sql` را در Supabase SQL Editor اجرا کنید. این فایل شماره‌ی محلی را در پروفایل ذخیره می‌کند و دسترسی خواندن مشخصات مشتریان و سبد خریدشان را برای حساب ادمین `mrehsanshop@gmail.com` فعال می‌سازد. سپس با همین ایمیل وارد سایت شوید و مسیر `/admin` را باز کنید.

## نام فروشگاه و تماس
نام نمایشی سایت `Golden Lion` است و ایمیل تماس `mrehsanshop@gmail.com` می‌باشد. فرم تماس فعلی برنامه ایمیل کاربر را با متن و گیرنده‌ی آماده باز می‌کند. برای ارسال مستقیم پیام‌ها از سرور سایت، باید SMTP یا سرویس ارسال ایمیل و کلیدهای دسترسی آن پیکربندی شود.


## ورود با شماره موبایل بدون پیامک
فرم ثبت‌نام و ورود کد OTP ندارد و شماره‌ی محلی مانند `09123456789` می‌گیرد؛ تبدیل به قالب موردنیاز Supabase پشت صحنه انجام می‌شود. در داشبورد Supabase به `Authentication > Sign In / Providers > Phone` بروید و Phone provider را روشن و **Confirm phone** را خاموش کنید. اگر تأیید تلفن فعال باشد، Supabase ممکن است پیامک بفرستد و ورود فوری را انجام ندهد.

## محافظت‌های امنیتی پایه
`next.config.ts` هدرهای امنیتی را تنظیم می‌کند. API سبد خرید، سفارش و خرید ویدیو محدودیت نرخ درخواست، بررسی مبدأ cross-origin و محدودیت اندازه‌ی بدنه دارند. این محدودیت برنامه‌ای حافظه‌ای است و به‌تنهایی جلوی DDoS را نمی‌گیرد؛ برای تولید، `Authentication > Rate Limits` در Supabase و یک CDN/WAF در لایه‌ی هاست را نیز تنظیم کنید.

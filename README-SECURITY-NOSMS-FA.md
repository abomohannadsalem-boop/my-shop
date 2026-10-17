> ⚠️ توجه: بخش «ورود بدون پیامک / Confirm email را خاموش کنید» این فایل قدیمی شده است. تنظیمات فعلی ثبت‌نام و ورود در `README-ACCOUNTS-FA.md` است (Confirm email باید **روشن** باشد).

# تنظیم ورود بدون پیامک و امنیت پایه — Golden Lion

## ورود با موبایل بدون OTP
1. Supabase Dashboard → Authentication → Sign In / Providers → Phone
2. Phone provider را فعال کنید.
3. گزینه Confirm phone را خاموش کنید.
4. سرویس SMS برای جریان ثبت‌نام/ورود با رمز عبور لازم نیست. رابط سایت کادر OTP ندارد؛ اگر پس از ثبت‌نام session ایجاد نشد، ابتدا همین تنظیم را بررسی کنید.

شماره‌ی ورودی `09123456789` است: دقیقاً ۱۱ رقم و شروع با `09`. تبدیل به قالب Auth پشت صحنه انجام می‌شود.

## محافظت در برابر سوءاستفاده
- `next.config.ts`: هدرهای امنیتی و HSTS در production
- `/api/cart`, `/api/orders`, `/api/videos/[id]/buy`: محدودیت نرخ درخواست، کنترل Origin برای درخواست‌های تغییردهنده و محدودیت اندازه‌ی بدنه
- Supabase Auth: در Authentication → Rate Limits محدودیت‌های ثبت‌نام، ورود و توکن را بررسی کنید.
- سایت عمومی: CDN/WAF و rate limit در لایه‌ی هاست تنظیم شود. محافظ محدودکننده‌ی داخل برنامه حافظه‌ای است، بین چند نمونه‌ی سرور هماهنگ نمی‌شود و جایگزین حفاظت DDoS نیست.

## مدیریت مشتریان
ورود ادمین با `mrehsanshop@gmail.com`؛ صفحه مدیریت `/admin`. برای دیدن اطلاعات مشتریان و سبدها باید migration `supabase/migrations/20261014_phone_login_admin_customer_access.sql` (و migrationهای قبلی لازم) در Supabase اجرا شده باشد.

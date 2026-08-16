import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // اگر کاربر وارد نشده باشد
  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name || "کاربر";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-12"
    >
      <div className="mx-auto max-w-6xl">

        {/* =========================
            Header
        ========================= */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            پنل کاربری
          </h1>

          <p className="mt-3 text-gray-500">
            خوش آمدید، {name} 👋
          </p>

        </div>


        {/* =========================
            User Information
        ========================= */}

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold">
            اطلاعات حساب
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {/* Name */}

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                نام
              </p>

              <p className="mt-2 font-semibold">
                {name}
              </p>

            </div>


            {/* Email */}

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                ایمیل
              </p>

              <p className="mt-2 font-semibold">
                {user.email}
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            Dashboard
        ========================= */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">


          {/* =========================
              Orders
          ========================= */}

          <Link
            href="/account/orders"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-bold">
              سفارش‌های من
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              مشاهده سفارش‌ها و خریدهای شما
            </p>

          </Link>


          {/* =========================
              Cart
          ========================= */}

          <Link
            href="/cart"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="text-4xl">
              🛒
            </div>

            <h2 className="mt-5 text-xl font-bold">
              سبد خرید
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              مشاهده و مدیریت محصولات سبد خرید
            </p>

          </Link>


          {/* =========================
              Videos
          ========================= */}

          <Link
            href="/videos"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="text-4xl">
              🎥
            </div>

            <h2 className="mt-5 text-xl font-bold">
              ویدیوهای آموزشی
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              مشاهده آموزش‌های موجود
            </p>

          </Link>


          {/* =========================
              Catalogs
          ========================= */}

          <Link
            href="/catalogs"
            className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="text-4xl">
              📕
            </div>

            <h2 className="mt-5 text-xl font-bold">
              کاتالوگ‌ها
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              مشاهده کاتالوگ‌های محصولات
            </p>

          </Link>

        </div>


        {/* =========================
            Buttons
        ========================= */}

        <div className="mt-8 flex flex-wrap gap-4">

          {/* Back to Store */}

          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            🏠 بازگشت به فروشگاه
          </Link>


          {/* Logout */}

          <LogoutButton />

        </div>

      </div>
    </main>
  );
}
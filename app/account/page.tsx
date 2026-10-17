import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import ProfileEditor from "./ProfileEditor";
import { isPhoneAliasEmail } from "@/lib/iran-phone";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // اگر کاربر وارد نشده باشد
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("customer_profiles").select("customer_code,full_name,phone,national_id,contact_email,postal_code,date_of_birth,is_verified").eq("user_id", user.id).maybeSingle();
  const name = profile?.full_name || user.user_metadata?.full_name || "کاربر";

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


        <ProfileEditor
          profile={{
            userId: user.id,
            customerCode: profile?.customer_code ?? "",
            fullName: profile?.full_name || (user.user_metadata?.full_name as string) || "",
            phone: profile?.phone ?? "",
            nationalId: profile?.national_id ?? "",
            postalCode: profile?.postal_code ?? "",
            dateOfBirth: profile?.date_of_birth ?? "",
            contactEmail: user.email && !isPhoneAliasEmail(user.email) ? user.email : "",
            pendingEmail: user.new_email ?? "",
            isVerified: !!profile?.is_verified,
          }}
        />


        {/* =========================
            Dashboard
        ========================= */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">


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
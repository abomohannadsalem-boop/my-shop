import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = await createClient();

  // کاربر فعلی
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // اگر وارد نشده
  if (!user) {
    redirect("/login");
  }

  // دریافت سفارش‌های کاربر
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_price,
      status,
      created_at,
      order_items (
        id,
        product_name,
        price,
        quantity
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 px-6 py-12"
      >
        <div className="mx-auto max-w-5xl">

          <h1 className="text-4xl font-bold">
            سفارش‌های من
          </h1>

          <div className="mt-8 rounded-xl bg-red-50 p-6 text-red-600">
            خطا در دریافت سفارش‌ها:
            <br />
            {error.message}
          </div>

        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold">
              سفارش‌های من
            </h1>

            <p className="mt-3 text-gray-500">
              سفارش‌ها و خریدهای شما
            </p>
          </div>

          <Link
            href="/account"
            className="rounded-lg bg-gray-900 px-5 py-2 text-white hover:bg-gray-800"
          >
            پنل کاربری
          </Link>

        </div>

        {orders && orders.length > 0 ? (

          <div className="mt-10 space-y-6">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                {/* Header */}

                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">

                  <div>

                    <p className="text-sm text-gray-500">
                      شماره سفارش
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      #{order.id}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      تاریخ
                    </p>

                    <p className="mt-1 font-semibold">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString("fa-IR")}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      وضعیت
                    </p>

                    <span
                      className={`mt-1 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status === "paid"
                        ? "پرداخت شده"
                        : order.status === "cancelled"
                        ? "لغو شده"
                        : "در انتظار پرداخت"}
                    </span>

                  </div>

                </div>

                {/* Items */}

                <div className="mt-6 space-y-4">

                  {order.order_items?.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                    >

                      <div>

                        <h3 className="font-bold">
                          {item.product_name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          تعداد: {item.quantity}
                        </p>

                      </div>

                      <p className="font-semibold text-blue-600">
                        {(
                          item.price * item.quantity
                        ).toLocaleString("fa-IR")}{" "}
                        تومان
                      </p>

                    </div>

                  ))}

                </div>

                {/* Total */}

                <div className="mt-6 flex items-center justify-between border-t pt-5">

                  <span className="font-semibold">
                    مبلغ کل
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    {order.total_price.toLocaleString(
                      "fa-IR"
                    )}{" "}
                    تومان
                  </span>

                </div>

                {/* Payment */}

                {order.status === "pending" && (

                  <button
                    className="mt-5 w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
                  >
                    پرداخت سفارش
                  </button>

                )}

              </div>

            ))}

          </div>

        ) : (

          <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">

            <div className="text-6xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              هنوز سفارشی ندارید
            </h2>

            <p className="mt-3 text-gray-500">
              اولین خرید خود را از فروشگاه انجام دهید.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              مشاهده محصولات
            </Link>

          </div>

        )}

      </div>
    </main>
  );
}
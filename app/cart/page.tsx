"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  function saveCart(newCart: CartItem[]) {
    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );
  }

  function removeItem(id: number) {
    const newCart = cart.filter(
      (item) => item.id !== id
    );

    saveCart(newCart);
  }

  function increaseQuantity(id: number) {
    const newCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(newCart);
  }

  function decreaseQuantity(id: number) {
    const newCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  }

  async function createOrder() {
    if (cart.length === 0) {
      alert("سبد خرید خالی است.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          cart: cart,
        }),
      });

      const result = await response.json();

      console.log("ORDER RESPONSE:", result);

      if (!response.ok) {
        alert(
          result.error ||
            "خطا در ثبت سفارش"
        );

        return;
      }

      alert(
        `سفارش شماره ${result.orderId} با موفقیت ثبت شد.`
      );

      localStorage.removeItem("cart");

      setCart([]);

    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      alert(
        "خطایی در ارتباط با سرور رخ داد."
      );

    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-bold">
          سبد خرید 🛒
        </h1>

        {cart.length === 0 ? (

          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="text-6xl">
              🛒
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              سبد خرید خالی است
            </h2>

            <p className="mt-3 text-gray-500">
              هنوز محصولی به سبد خرید اضافه نکرده‌اید.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              مشاهده محصولات
            </Link>

          </div>

        ) : (

          <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* محصولات */}

            <div className="space-y-4 lg:col-span-2">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm"
                >

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200">

                    {item.image_url ? (

                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <span className="text-3xl">
                        📦
                      </span>

                    )}

                  </div>

                  <div className="flex-1">

                    <h2 className="text-lg font-bold">
                      {item.name}
                    </h2>

                    <p className="mt-2 font-semibold text-blue-600">
                      {item.price.toLocaleString("fa-IR")} تومان
                    </p>

                    <div className="mt-4 flex items-center gap-3">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="rounded-lg bg-gray-200 px-3 py-1 text-lg"
                      >
                        −
                      </button>

                      <span className="font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="rounded-lg bg-gray-200 px-3 py-1 text-lg"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="rounded-lg bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    حذف
                  </button>

                </div>

              ))}

            </div>

            {/* خلاصه سفارش */}

            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-2xl font-bold">
                خلاصه سفارش
              </h2>

              <div className="mt-6 flex justify-between border-b pb-4">

                <span>
                  تعداد محصولات
                </span>

                <span className="font-bold">
                  {cart.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}
                </span>

              </div>

              <div className="mt-4 flex justify-between">

                <span>
                  مبلغ کل
                </span>

                <span className="text-xl font-bold text-blue-600">
                  {total.toLocaleString("fa-IR")} تومان
                </span>

              </div>

              <button
                onClick={createOrder}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "در حال ثبت سفارش..."
                  : "ادامه و ثبت سفارش"}
              </button>

            </div>

          </div>

        )}

      </div>
    </main>
  );
}
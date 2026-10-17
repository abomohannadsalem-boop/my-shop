"use client";
import { formatProductCode } from "@/lib/product-stock";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  id: number;
  product_code?: string | null;
  name: string;
  price: number;
  image_url?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  quantity: number;
  is_available?: boolean;
};

type StockRecord = { id: number; product_code?: string | null; in_stock?: boolean | null; variants?: { name: string; in_stock?: boolean | null }[] | null };

function colorKey(name?: string | null) {
  return String(name ?? "").trim().toLocaleLowerCase() || null;
}

/** Keep exactly one cart row per product + color, while different colors stay separate. */
function normalizeCartLines(items: CartItem[]): CartItem[] {
  const normalized: CartItem[] = [];
  for (const source of items) {
    const item: CartItem = {
      ...source,
      color_name: String(source.color_name ?? "").trim() || null,
      quantity: Math.max(1, Math.min(99, Math.floor(Number(source.quantity) || 1))),
    };
    const found = normalized.find((line) =>
      Number(line.id) === Number(item.id) && colorKey(line.color_name) === colorKey(item.color_name)
    );
    if (found) {
      found.quantity = Math.min(99, found.quantity + item.quantity);
      if (!found.product_code && item.product_code) found.product_code = item.product_code;
      if (!found.image_url && item.image_url) found.image_url = item.image_url;
      if (!found.color_hex && item.color_hex) found.color_hex = item.color_hex;
    } else normalized.push(item);
  }
  return normalized;
}

function withAvailability(items: CartItem[], records: StockRecord[]): CartItem[] {
  return items.map((item) => {
    const product = records.find((record) => Number(record.id) === Number(item.id));
    if (!product) return { ...item, is_available: false };
    const enriched = { ...item, product_code: item.product_code || product.product_code || null };
    if (product.in_stock === false) return { ...enriched, is_available: false };
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length === 0) return { ...enriched, is_available: true };
    if (item.color_name) {
      const selected = variants.find((variant) => colorKey(variant.name) === colorKey(item.color_name));
      return { ...enriched, is_available: selected ? selected.in_stock !== false : variants.some((variant) => variant.in_stock !== false) };
    }
    return { ...enriched, is_available: variants.some((variant) => variant.in_stock !== false) };
  });
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setSignedIn(!!user);
      if (user) {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (response.ok) {
          const remote = (await response.json()).items ?? [];
          let local: CartItem[] = [];
          try { local = JSON.parse(localStorage.getItem("cart") || "[]"); } catch { local = []; }
          // Merge guest and signed-in carts, then normalize to one row per color.
          const merged = normalizeCartLines([...remote, ...local]);
          const { data: stockRecords } = await supabase.from("products").select("id,product_code,in_stock,variants").in("id", [...new Set(merged.map((item: CartItem) => item.id))]);
          const enriched = withAvailability(merged, (stockRecords ?? []) as StockRecord[]);
          setCart(enriched);
          await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: enriched }) });
          localStorage.removeItem("cart");
        }
      } else {
        try {
          const localItems = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
          const { data: stockRecords } = localItems.length ? await supabase.from("products").select("id,product_code,in_stock,variants").in("id", [...new Set(localItems.map(item => item.id))]) : { data: [] };
          const normalized = normalizeCartLines(localItems);
          const enriched = withAvailability(normalized, (stockRecords ?? []) as StockRecord[]);
          setCart(enriched);
          localStorage.setItem("cart", JSON.stringify(enriched));
        } catch { localStorage.removeItem("cart"); }
      }
    })();
  }, []);

  function saveCart(newCart: CartItem[]) {
    const normalized = normalizeCartLines(newCart);
    setCart(normalized);
    if (signedIn) {
      fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: normalized }) }).catch(() => {});
    } else localStorage.setItem("cart", JSON.stringify(normalized));
  }

  function sameCartLine(item: CartItem, id: number, colorName?: string | null) {
    return Number(item.id) === Number(id) && colorKey(item.color_name) === colorKey(colorName);
  }

  function removeItem(id: number, colorName?: string | null) {
    saveCart(cart.filter(item => !sameCartLine(item, id, colorName)));
  }

  function increaseQuantity(id: number, colorName?: string | null) {
    const line = cart.find(item => sameCartLine(item, id, colorName));
    if (line?.is_available === false) return;
    saveCart(cart.map(item => sameCartLine(item, id, colorName)
      ? { ...item, quantity: Math.min(99, item.quantity + 1) }
      : item));
  }

  function decreaseQuantity(id: number, colorName?: string | null) {
    saveCart(cart.map(item => sameCartLine(item, id, colorName)
      ? { ...item, quantity: item.quantity - 1 }
      : item).filter(item => item.quantity > 0));
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

      if (signedIn) { await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [] }) }); }
      else localStorage.removeItem("cart");

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
                  key={`${item.id}-${item.color_name ?? "default"}`}
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
                    <p className="mt-1 text-xs text-slate-400" dir="ltr">کد محصول: {formatProductCode(item.product_code, item.id)}</p>
                    {item.color_name && <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><span className="h-3 w-3 rounded-full border" style={{ backgroundColor: item.color_hex || "#e5e7eb" }} />رنگ: {item.color_name}</p>}
                    <p className={`mt-1 text-xs font-bold ${item.is_available === false ? "text-red-600" : "text-green-600"}`}>{item.is_available === false ? "ناموجود" : "موجود است"}</p>

                    <p className="mt-2 font-semibold text-blue-600">
                      {item.price.toLocaleString("fa-IR")} تومان
                    </p>

                    <div dir="ltr" className="mt-4 flex items-center gap-3">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id, item.color_name)
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
                          increaseQuantity(item.id, item.color_name)
                        }
                        disabled={item.is_available === false || item.quantity >= 99}
                        className="rounded-lg bg-gray-200 px-3 py-1 text-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.id, item.color_name)
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
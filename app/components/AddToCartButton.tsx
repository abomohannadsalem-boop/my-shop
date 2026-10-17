"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Variant = { name: string; hex?: string | null; image_url?: string | null; in_stock?: boolean | null };
type Product = { id: number; product_code?: string | null; name: string; price: number; image_url?: string | null; color_name?: string | null; color_hex?: string | null };
type CartProduct = Product & { quantity: number };
type Props = { product: Product; compact?: boolean; disabled?: boolean; initialVariant?: Variant | null };
const CART_EVENT = "shop-cart-updated";

async function loadCart(): Promise<{ items: CartProduct[]; userId: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "دریافت سبد خرید ناموفق بود.");
    return { items: (await response.json()).items ?? [], userId: user.id };
  }
  try { return { items: JSON.parse(localStorage.getItem("cart") || "[]"), userId: null }; }
  catch { localStorage.removeItem("cart"); return { items: [], userId: null }; }
}

async function persistCart(items: CartProduct[], userId: string | null) {
  if (userId) {
    const response = await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "ذخیره سبد خرید ناموفق بود.");
  } else {
    localStorage.setItem("cart", JSON.stringify(items));
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { items } }));
}

export default function AddToCartButton({ product, compact = false, disabled = false, initialVariant = null }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant);
  const effectivelyDisabled = disabled || selectedVariant?.in_stock === false;
  // Quantity is tracked for the chosen color only. Other colors of the same product
  // are separate cart lines and must not be included in this counter.
  const activeColorName = selectedVariant?.name ?? product.color_name ?? null;

  const refresh = useCallback(async () => {
    try {
      const { items } = await loadCart();
      const matching = items.filter(item =>
        Number(item.id) === Number(product.id) &&
        (item.color_name ?? null) === activeColorName
      );
      setQuantity(matching.reduce((total, item) => total + (Number(item.quantity) || 0), 0));
    } catch { setQuantity(0); }
  }, [product.id, activeColorName]);

  useEffect(() => {
    void refresh();
    const onCartChange = (event: Event) => {
      const eventItems = (event as CustomEvent<{ items?: CartProduct[] }>).detail?.items;
      if (Array.isArray(eventItems)) {
        setQuantity(eventItems.filter(item =>
          Number(item.id) === Number(product.id) &&
          (item.color_name ?? null) === activeColorName
        ).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
      } else {
        void refresh();
      }
    };
    const onColorChange = (event: Event) => {
      const custom = event as CustomEvent<{ productId: number; variant: Variant | null }>;
      if (Number(custom.detail?.productId) === Number(product.id)) setSelectedVariant(custom.detail.variant);
    };
    window.addEventListener(CART_EVENT, onCartChange);
    window.addEventListener("shop-product-color-selected", onColorChange);
    window.addEventListener("storage", onCartChange);
    return () => {
      window.removeEventListener(CART_EVENT, onCartChange);
      window.removeEventListener("shop-product-color-selected", onColorChange);
      window.removeEventListener("storage", onCartChange);
    };
  }, [product.id, activeColorName, refresh]);

  async function changeQuantity(delta: number) {
    if ((effectivelyDisabled && delta > 0) || busy) return;
    setBusy(true);
    try {
      const { items, userId } = await loadCart();
      const variantName = selectedVariant?.name ?? product.color_name ?? null;
      const variantHex = selectedVariant?.hex ?? product.color_hex ?? null;
      const keyMatches = (item: CartProduct) =>
        Number(item.id) === Number(product.id) &&
        (item.color_name ?? null) === variantName;
      const index = items.findIndex(keyMatches);
      let next = [...items];
      if (delta > 0) {
        if (index >= 0) {
          next[index] = { ...next[index], product_code: next[index].product_code || product.product_code || null, quantity: Math.min(99, (Number(next[index].quantity) || 0) + 1) };
        } else {
          // One line per product + color; adding red never changes the white line.
          next.push({
            ...product,
            image_url: selectedVariant?.image_url || product.image_url || null,
            color_name: variantName,
            color_hex: variantHex,
            quantity: 1,
          });
        }
      } else if (index >= 0) {
        if (Number(next[index].quantity) <= 1) next = next.filter((_, i) => i !== index);
        else next[index] = { ...next[index], quantity: Number(next[index].quantity) - 1 };
      }
      await persistCart(next, userId);
      setQuantity(next.filter(keyMatches).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
    } catch (error) {
      alert(error instanceof Error ? error.message : "تغییر سبد خرید انجام نشد.");
    } finally { setBusy(false); }
  }

  if (quantity > 0) {
    return <div dir="ltr" aria-label={`تعداد ${product.name} در سبد خرید`} className={`flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-white p-1 text-blue-700 shadow-sm ${compact ? "min-h-10" : "w-full min-h-12"}`}>
      <button type="button" aria-label="کم کردن تعداد" title="کم کردن تعداد" disabled={busy} onClick={() => changeQuantity(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xl font-bold leading-none hover:bg-red-50 hover:text-red-600 disabled:opacity-50">−</button>
      <span className="min-w-5 text-center text-sm font-extrabold tabular-nums">{quantity.toLocaleString("fa-IR")}</span>
      <button type="button" aria-label="زیاد کردن تعداد" title="زیاد کردن تعداد" disabled={effectivelyDisabled || busy || quantity >= 99} onClick={() => changeQuantity(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xl font-bold leading-none text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">+</button>
    </div>;
  }
  if (compact) return <button type="button" aria-label="افزودن به سبد خرید" title={effectivelyDisabled ? "ناموجود" : "افزودن به سبد خرید"} disabled={effectivelyDisabled || busy} onClick={() => changeQuantity(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">🛒</button>;
  return <button type="button" disabled={effectivelyDisabled || busy} onClick={() => changeQuantity(1)} className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">{effectivelyDisabled ? "ناموجود" : busy ? "در حال افزودن..." : "🛒 افزودن به سبد خرید"}</button>;
}

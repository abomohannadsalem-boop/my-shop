import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBodyTooLarge, isCrossOriginWrite, requestRateLimit } from "@/lib/request-guard";

function limitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "تعداد درخواست‌ها زیاد است. چند لحظه بعد دوباره تلاش کن." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export async function GET(request: Request) {
  const rate = requestRateLimit(request, "cart-read", 90, 60_000);
  if (!rate.allowed) return limitedResponse(rate.retryAfterSeconds);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "برای سبد خرید همگام‌شده وارد حساب شوید." }, { status: 401 });
  const { data, error } = await supabase.from("user_carts").select("items").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("Cart read failed", error);
    return NextResponse.json({ error: "دریافت سبد خرید انجام نشد." }, { status: 500 });
  }
  return NextResponse.json({ items: data?.items ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (isCrossOriginWrite(request)) return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  const rate = requestRateLimit(request, "cart-write", 30, 60_000);
  if (!rate.allowed) return limitedResponse(rate.retryAfterSeconds);
  if (isBodyTooLarge(request, 128 * 1024)) return NextResponse.json({ error: "اطلاعات ارسالی بیش از حد بزرگ است." }, { status: 413 });

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "برای ذخیره سبد خرید باید وارد حساب شوید." }, { status: 401 });

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > 128 * 1024) return NextResponse.json({ error: "اطلاعات ارسالی بیش از حد بزرگ است." }, { status: 413 });
  let body: { items?: unknown } | null = null;
  try { body = JSON.parse(rawBody) as { items?: unknown }; } catch { /* handled below */ }
  if (!Array.isArray(body?.items) || body.items.length > 100) return NextResponse.json({ error: "ساختار سبد خرید نامعتبر است." }, { status: 400 });

  const items = body.items.map((item: any) => ({
    id: Number(item?.id),
    product_code: item?.product_code ? String(item.product_code).slice(0, 40) : null,
    name: String(item?.name ?? "").slice(0, 250),
    price: Math.max(0, Number(item?.price) || 0),
    image_url: item?.image_url ? String(item.image_url).slice(0, 2000) : null,
    color_name: item?.color_name ? String(item.color_name).slice(0, 100) : null,
    color_hex: /^#[0-9a-fA-F]{6}$/.test(String(item?.color_hex ?? "")) ? String(item.color_hex) : null,
    quantity: Math.max(1, Math.min(99, Math.floor(Number(item?.quantity) || 1))),
  })).filter((item: { id: number; name: string }) => Number.isSafeInteger(item.id) && item.id > 0 && item.name.trim());

  const { error } = await supabase.from("user_carts").upsert({ user_id: user.id, items, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) {
    console.error("Cart save failed", error);
    return NextResponse.json({ error: "ذخیره سبد خرید انجام نشد." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

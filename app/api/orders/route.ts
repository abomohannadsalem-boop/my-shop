import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, isBodyTooLarge, isCrossOriginWrite, requestRateLimit } from "@/lib/request-guard";

export async function POST(request: Request) {
  if (isCrossOriginWrite(request)) return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  const ipRate = requestRateLimit(request, "order-ip", 8, 60_000);
  if (!ipRate.allowed) return NextResponse.json({ error: "تعداد درخواست‌های ثبت سفارش زیاد است. بعداً دوباره تلاش کن." }, { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } });
  if (isBodyTooLarge(request, 64 * 1024)) return NextResponse.json({ error: "اطلاعات سفارش بیش از حد بزرگ است." }, { status: 413 });

  try {
    const supabase = await createClient();

    // بررسی کاربر
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "لطفاً ابتدا وارد حساب خود شوید." }, { status: 401 });
    }
    const userRate = checkRateLimit(`order-user:${user.id}`, 5, 60_000);
    if (!userRate.allowed) return NextResponse.json({ error: "در مدت کوتاه سفارش‌های زیادی ثبت شده است. کمی بعد دوباره تلاش کن." }, { status: 429, headers: { "Retry-After": String(userRate.retryAfterSeconds) } });

    // دریافت و اعتبارسنجی اطلاعات سبد خرید
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > 64 * 1024) return NextResponse.json({ error: "اطلاعات سفارش بیش از حد بزرگ است." }, { status: 413 });
    let body: { cart?: unknown };
    try { body = JSON.parse(rawBody) as { cart?: unknown }; } catch { return NextResponse.json({ error: "فرمت درخواست نامعتبر است." }, { status: 400 }); }
    const cart = body.cart;

    if (!Array.isArray(cart) || cart.length === 0 || cart.length > 100) {
      return NextResponse.json(
        {
          error: "سبد خرید خالی است.",
        },
        {
          status: 400,
        }
      );
    }

    // گرفتن ID محصولات
    const normalizedCart = cart.map((item: { id?: unknown; quantity?: unknown; color_name?: unknown; color_hex?: unknown }) => ({
      id: Number(item?.id),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item?.quantity) || 1))),
      color_name: item?.color_name == null ? "" : String(item.color_name).slice(0, 100),
      color_hex: /^#[0-9a-fA-F]{6}$/.test(String(item?.color_hex ?? "")) ? String(item.color_hex) : null,
    }));
    const productIds = normalizedCart.map((item) => item.id);
    if (productIds.some((id: number) => !Number.isSafeInteger(id) || id <= 0)) {
      return NextResponse.json({ error: "شناسه یکی از محصولات نامعتبر است." }, { status: 400 });
    }

    // گرفتن قیمت واقعی از دیتابیس
    const { data: products, error: productsError } =
      await supabase
        .from("products")
        .select("id, product_code, name, price, in_stock, variants")
        .in("id", productIds);

    if (productsError) {
      console.error("Order product validation failed", productsError);
      return NextResponse.json({ error: "بررسی محصولات برای ثبت سفارش انجام نشد." }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          error: "محصولی پیدا نشد.",
        },
        {
          status: 400,
        }
      );
    }

    // محاسبه قیمت واقعی روی سرور
    let totalPrice = 0;

    const orderItems = [];

    for (const item of normalizedCart) {
      const product = products.find(
        (p) => p.id === item.id
      );

      if (!product) {
        continue;
      }
      if (product.in_stock === false) {
        return NextResponse.json({ error: `محصول «${product.name}» ناموجود است.` }, { status: 409 });
      }
      const productVariants = Array.isArray(product.variants) ? product.variants : [];
      if (productVariants.length > 0) {
        const requestedColor = item.color_name ? String(item.color_name) : "";
        const variant = productVariants.find((candidate: { name?: string; in_stock?: boolean }) => candidate.name === requestedColor);
        if (!variant || variant.in_stock === false) {
          return NextResponse.json({ error: `رنگ انتخاب‌شده از محصول «${product.name}» ناموجود است یا باید دوباره انتخاب شود.` }, { status: 409 });
        }
      }

      const quantity = item.quantity;

      totalPrice += product.price * quantity;

      orderItems.push({
        product_id: product.id,
        product_code: product.product_code ?? null,
        product_name: product.name,
        price: product.price,
        quantity,
        color_name: item.color_name || null,
        color_hex: item.color_hex,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        {
          error: "محصول معتبری در سبد خرید وجود ندارد.",
        },
        {
          status: 400,
        }
      );
    }

    // ساخت سفارش
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

    if (orderError) {
      console.error("Order creation failed", orderError);
      return NextResponse.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
    }

    // اضافه کردن آیتم‌های سفارش
    const itemsWithOrderId = orderItems.map(
      (item) => ({
        ...item,
        order_id: order.id,
      })
    );

    const { error: itemsError } =
      await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Order items creation failed", itemsError);
      return NextResponse.json({ error: "ذخیره جزئیات سفارش انجام نشد." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalPrice,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "خطایی در ثبت سفارش رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}
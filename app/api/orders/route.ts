import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // بررسی کاربر
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "لطفاً ابتدا وارد حساب خود شوید.",
        },
        {
          status: 401,
        }
      );
    }

    // دریافت اطلاعات سبد خرید
    const body = await request.json();

    const cart = body.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
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
    const productIds = cart.map(
      (item: { id: number }) => item.id
    );

    // گرفتن قیمت واقعی از دیتابیس
    const { data: products, error: productsError } =
      await supabase
        .from("products")
        .select("id, name, price")
        .in("id", productIds);

    if (productsError) {
      return NextResponse.json(
        {
          error: productsError.message,
        },
        {
          status: 500,
        }
      );
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

    for (const item of cart) {
      const product = products.find(
        (p) => p.id === item.id
      );

      if (!product) {
        continue;
      }

      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      totalPrice += product.price * quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity,
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
      return NextResponse.json(
        {
          error: orderError.message,
        },
        {
          status: 500,
        }
      );
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
      return NextResponse.json(
        {
          error: itemsError.message,
        },
        {
          status: 500,
        }
      );
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
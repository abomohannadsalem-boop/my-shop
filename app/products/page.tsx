import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

    console.log("PRODUCTS:", products);
    console.log("ERROR:", error);
    
  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 px-6 py-12"
      >
        <div className="mx-auto max-w-7xl">

          <h1 className="text-4xl font-bold">
            محصولات
          </h1>

          <div className="mt-8 rounded-xl bg-red-50 p-6 text-red-600">
            خطا در دریافت محصولات:
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
      <div className="mx-auto max-w-7xl">

        <h1 className="text-4xl font-bold">
          محصولات
        </h1>

        <p className="mt-3 text-gray-500">
          محصولات فروشگاه را مشاهده و بررسی کنید.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {products?.map((product) => (

            <div
              key={product.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* تصویر محصول */}
              <div className="flex h-48 items-center justify-center bg-gray-200 text-gray-500">

                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    تصویر محصول
                  </span>
                )}

              </div>

              {/* اطلاعات محصول */}
              <div className="p-5">

                <h2 className="text-xl font-bold">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {product.description}
                </p>

                <p className="mt-4 text-lg font-bold text-blue-600">
                  {product.price.toLocaleString("fa-IR")} تومان
                </p>

                {/* لینک جزئیات */}
                <Link
                  href={`/products/${product.id}`}
                  className="mt-5 block w-full rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
                >
                  مشاهده محصول
                </Link>

              </div>

            </div>

          ))}

        </div>

      </div>
    </main>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/app/components/AddToCartButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          <span>←</span>
          بازگشت به محصولات
        </Link>

        {/* Product Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          <div className="grid md:grid-cols-2">

            {/* ================= IMAGE ================= */}
            <div className="flex min-h-[420px] items-center justify-center bg-slate-100 p-6 md:min-h-[600px] md:p-10">

              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-[520px] w-full object-contain drop-shadow-xl transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full min-h-[350px] w-full items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
                  <span className="text-lg">
                    تصویر محصول موجود نیست
                  </span>
                </div>
              )}

            </div>

            {/* ================= INFORMATION ================= */}
            <div className="flex flex-col justify-center p-7 md:p-12">

              {/* Category */}
              <span className="mb-3 text-sm font-medium text-blue-600">
                محصول
              </span>

              {/* Name */}
              <h1 className="text-3xl font-extrabold leading-relaxed text-slate-900 md:text-4xl">
                {product.name}
              </h1>

              {/* Line */}
              <div className="my-6 h-px w-full bg-slate-200" />

              {/* Description */}
              <div>
                <h2 className="mb-3 text-lg font-bold text-slate-800">
                  توضیحات محصول
                </h2>

                <p className="whitespace-pre-line text-base leading-9 text-slate-600">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">

                <p className="mb-2 text-sm font-medium text-slate-500">
                  قیمت
                </p>

                <p className="text-3xl font-extrabold text-blue-600">
                  {product.price.toLocaleString("fa-IR")}
                  <span className="mr-2 text-base font-medium text-slate-500">
                    تومان
                  </span>
                </p>

              </div>

              {/* Buy */}
              <div className="mt-6">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                  }}
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
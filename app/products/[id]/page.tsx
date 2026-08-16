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
      className="min-h-screen bg-gray-50 px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/products"
          className="mb-8 inline-block text-blue-600 hover:text-blue-700"
        >
          ← بازگشت به محصولات
        </Link>

        {/* Product */}
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-2">

          {/* Image */}
          <div className="flex min-h-[400px] items-center justify-center bg-gray-200 text-gray-500">

            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg">
                تصویر محصول
              </span>
            )}

          </div>

          {/* Information */}
          <div className="p-8 md:p-10">

            <p className="text-sm text-gray-400">
              محصول
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {product.name}
            </h1>

            <div className="mt-6 h-px bg-gray-200" />

            <p className="mt-6 leading-8 text-gray-600">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-8">

              <p className="text-sm text-gray-500">
                قیمت
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-600">
                {product.price.toLocaleString("fa-IR")} تومان
              </p>

            </div>

            {/* Buy */}
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
    </main>
  );
}
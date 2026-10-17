import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/app/components/AddToCartButton";
import ProductGallery from "@/app/components/ProductGallery";
import { firstAvailableVariant, formatProductCode } from "@/lib/product-stock";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories(id,name,slug)")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const { data: media } = await supabase
    .from("product_media")
    .select("id,url,media_type,title,sort_order")
    .eq("product_id", product.id)
    .order("sort_order")
    .order("id");

  const videos = (media ?? []).filter(
    (item: any) => item.media_type === "video"
  );

  const imageUrl = product.image_url
    ? String(product.image_url)
    : "";

    const primaryImage = imageUrl
      .split("|||||")[0]
      .trim();
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-6xl">

        {/* بازگشت */}
        <Link
          href={
            product.categories?.slug
              ? `/products?category=${encodeURIComponent(
                  product.categories.slug
                )}`
              : "/products"
          }
          className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← بازگشت به محصولات
        </Link>

        {/* کارت محصول */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid md:grid-cols-2">

            {/* ========================= */}
            {/* گالری تصاویر */}
            {/* ========================= */}

            <ProductGallery
              productId={Number(product.id)}
              imageUrl={imageUrl}
              productName={product.name}
              soldOut={product.in_stock === false}
              variants={Array.isArray(product.variants) ? product.variants : []}
            />

            {/* ========================= */}
            {/* اطلاعات محصول */}
            {/* ========================= */}

            <div className="flex flex-col justify-center p-7 md:p-12">

              {/* دسته‌بندی + کد */}
              <div className="mb-3 flex flex-wrap items-center gap-3">

                {product.categories?.name && (
                  <span className="text-sm font-medium text-blue-600">
                    {product.categories.name}
                  </span>
                )}

                <span
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                  dir="ltr"
                >
                  کد محصول: {formatProductCode(product.product_code, product.id)}
                </span>

              </div>

              {/* نام محصول */}
              <h1 className="text-3xl font-extrabold md:text-4xl">
                {product.name}
              </h1>

              <div className="my-6 h-px w-full bg-slate-200" />

              {/* توضیحات */}
              <h2 className="mb-3 text-lg font-bold">
                توضیحات محصول
              </h2>

              <p className="whitespace-pre-line leading-9 text-slate-600">
                {product.description}
              </p>

              {/* قیمت */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-sm text-slate-500">
                  قیمت
                </p>

                <p className="text-3xl font-extrabold text-blue-600">
                  {Number(product.price).toLocaleString("fa-IR")}

                  <span className="text-base font-medium text-slate-500">
                    {" "}
                    تومان
                  </span>
                </p>
              </div>

              {/* سبد خرید */}
              <div className="mt-6">
                <AddToCartButton
                  product={{
                    id: product.id,
                    product_code: product.product_code ?? null,
                    name: product.name,
                    price: product.price,
                    image_url: primaryImage,
                    ...(firstAvailableVariant(product.variants)?.name ? { color_name: firstAvailableVariant(product.variants)?.name ?? null, color_hex: firstAvailableVariant(product.variants)?.hex ?? null } : {}),
                  }}
                  initialVariant={firstAvailableVariant(product.variants)}
                  disabled={product.in_stock === false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* ویدیوهای محصول */}
        {/* ========================= */}

        {videos.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg md:p-8">

            <h2 className="text-2xl font-bold">
              ویدیوهای محصول
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {videos.map((video: any) => (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-2xl bg-black"
                >

                  <video
                    controls
                    preload="metadata"
                    className="aspect-video w-full"
                  >
                    <source
                      src={video.url}
                      type="video/mp4"
                    />

                    مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
                  </video>

                  {video.title && (
                    <p className="bg-white p-4 font-semibold">
                      {video.title}
                    </p>
                  )}

                </div>
              ))}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}
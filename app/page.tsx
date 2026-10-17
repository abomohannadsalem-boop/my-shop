import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/app/components/AddToCartButton";
import SoldOutBadge from "@/app/components/SoldOutBadge";
import { formatProductCode, firstAvailableVariant, hasAvailableStock, productImageList } from "@/lib/product-stock";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: products }, { data: bannerRows }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("storefront_banners").select("slot,image_url,alt_text").order("slot"),
  ]);

  const fallbackBanners = [1, 2, 3, 4, 5].map((slot) => ({
    slot,
    image_url: `/banners/banner-${slot}.svg`,
    alt_text: `بنر نمایشی ${slot} فروشگاه Golden Lion`,
  }));
  const banners = fallbackBanners.map(fallback =>
    bannerRows?.find((row: any) => row.slot === fallback.slot) ?? fallback
  );

  return (
    <main dir="rtl">
      {/* Hero */}
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">
            به Golden Lion خوش آمدید
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            محصول مورد نیازت را در فروشگاه Golden Lion پیدا کن.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 transition hover:bg-gray-100"
          >
            مشاهده همه محصولات
          </Link>
        </div>
      </section>

      {/* Five simple, non-clickable storefront banners */}
      <section aria-label="بنرهای فروشگاه" className="bg-white px-4 py-5 sm:px-6 sm:py-7">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {banners.map((banner: any) => (
            <div key={banner.slot} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
              <img src={banner.image_url} alt={banner.alt_text || "بنر فروشگاه Golden Lion"} className="block aspect-[10/3] w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* New Products */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                محصولات جدید
              </h2>

              <p className="mt-2 text-gray-500">
                آخرین محصولات فروشگاه
              </p>
            </div>

            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800"
            >
              مشاهده همه ←
            </Link>
          </div>

          {(products ?? []).length === 0 ? (
            <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              فعلا محصولی موجود نیست. برای نمایش محصولات، اتصال پایگاه داده و محصولات ثبت‌شده را بررسی کن.
            </p>
          ) : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(products ?? []).map((product: any) => (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-xl bg-white pb-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href={`/products/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={productImageList(product.image_url)[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      تصویر محصول
                    </span>
                  )}

                  {!hasAvailableStock(product) && <SoldOutBadge />}
                </div>

                {/* Product Info */}
                <div className="min-h-36 p-5 pb-16">
                  <h3 className="text-lg font-bold">
                    {product.name}
                  </h3>

                  <p
                    className="mt-1 text-xs text-gray-400"
                    dir="ltr"
                  >
                    کد محصول: {formatProductCode(product.product_code, product.id)}
                  </p>

                  <p className={`mt-2 text-sm font-bold ${hasAvailableStock(product) ? "text-green-600" : "text-red-600"}`}>{hasAvailableStock(product) ? "موجود است" : "ناموجود"}</p>
                  <p className="mt-3 font-bold text-blue-600">
                    {Number(product.price).toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                </Link>
                <div className="absolute bottom-4 left-3"><AddToCartButton compact product={{ id: product.id, product_code: product.product_code ?? null, name: product.name, price: Number(product.price), image_url: productImageList(product.image_url)[0] ?? null, ...(firstAvailableVariant(product.variants)?.name ? { color_name: firstAvailableVariant(product.variants)?.name ?? null, color_hex: firstAvailableVariant(product.variants)?.hex ?? null } : {}) }} initialVariant={firstAvailableVariant(product.variants)} disabled={!hasAvailableStock(product)} /></div>
              </article>
            ))}
          </div>}
        </div>
      </section>
    </main>
  );
}
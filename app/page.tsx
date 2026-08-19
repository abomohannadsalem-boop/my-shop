import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SoldOutBadge from "@/app/components/SoldOutBadge";

export default async function Home() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main dir="rtl">
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">به فروشگاه ما خوش آمدید</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">محصول مورد نیاز خود را از بین دسته‌بندی‌های مختلف پیدا کنید.</p>
          <Link href="/products" className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 transition hover:bg-gray-100">مشاهده همه محصولات</Link>
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4"><div><h2 className="text-3xl font-bold">محصولات جدید</h2><p className="mt-2 text-gray-500">آخرین محصولات فروشگاه</p></div><Link href="/products" className="text-blue-600 hover:text-blue-800">مشاهده همه ←</Link></div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(products ?? []).map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-100">
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-gray-400">تصویر محصول</span>}
                  {product.in_stock === false && <SoldOutBadge />}
                </div>
                <div className="p-5"><h3 className="text-lg font-bold">{product.name}</h3><p className="mt-1 text-xs text-gray-400" dir="ltr">کد محصول: #{String(product.id).padStart(4, "0")}</p><p className="mt-4 font-bold text-blue-600">{Number(product.price).toLocaleString("fa-IR")} تومان</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

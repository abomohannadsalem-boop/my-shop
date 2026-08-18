import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("categories").select("id,name,slug").order("name"),
  ]);

  return (
    <main dir="rtl">
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">به فروشگاه ما خوش آمدید</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">محصول مورد نیاز خود را از بین دسته‌بندی‌های مختلف پیدا کنید.</p>
          <Link href="/products" className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 transition hover:bg-gray-100">مشاهده همه محصولات</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="text-3xl font-bold">دسته‌بندی محصولات</h2><p className="mt-2 text-gray-500">برای مشاهده محصولات هر دسته انتخاب کنید.</p></div>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">همه محصولات ←</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(categories ?? []).map((category: any) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-2xl">🛍️</div>
              <h3 className="mt-5 text-xl font-bold">{category.name}</h3>
              <p className="mt-2 text-sm text-gray-500">مشاهده محصولات این دسته</p>
            </Link>
          ))}
          {(!categories || categories.length === 0) && <Link href="/products" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg"><h3 className="text-xl font-bold">همه محصولات</h3><p className="mt-2 text-sm text-gray-500">ابتدا دسته‌بندی‌ها را در Supabase اضافه کنید.</p></Link>}
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4"><div><h2 className="text-3xl font-bold">محصولات جدید</h2><p className="mt-2 text-gray-500">آخرین محصولات فروشگاه</p></div><Link href="/products" className="text-blue-600 hover:text-blue-800">مشاهده همه ←</Link></div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(products ?? []).map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-48 items-center justify-center bg-gray-100">
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-gray-400">تصویر محصول</span>}
                </div>
                <div className="p-5"><h3 className="text-lg font-bold">{product.name}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-500">{product.description}</p><p className="mt-4 font-bold text-blue-600">{Number(product.price).toLocaleString("fa-IR")} تومان</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

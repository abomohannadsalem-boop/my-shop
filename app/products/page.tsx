import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvailabilityFilter from "@/app/components/AvailabilityFilter";
import SoldOutBadge from "@/app/components/SoldOutBadge";

type Props = { searchParams: Promise<{ category?: string; q?: string; available?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { category: categorySlug, q: search, available } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("id,name,slug").order("name");

  let query = supabase.from("products").select("*, categories(id,name,slug)").order("created_at", { ascending: false });
  if (categorySlug) {
    const selectedCategory = (categories ?? []).find((c: any) => c.slug === categorySlug);
    if (selectedCategory) query = query.eq("category_id", selectedCategory.id);
    else query = query.eq("category_id", -1);
  }
  if (search) query = query.ilike("name", `%${search}%`);
  if (available === "1") query = query.eq("in_stock", true);
  const { data: products, error } = await query;

  if (error) {
    return <main dir="rtl" className="min-h-screen bg-gray-50 px-6 py-12"><div className="mx-auto max-w-7xl"><h1 className="text-4xl font-bold">محصولات</h1><div className="mt-8 rounded-xl bg-red-50 p-6 text-red-600">خطا در دریافت محصولات:<br />{error.message}</div></div></main>;
  }

  const activeCategory = (categories ?? []).find((c: any) => c.slug === categorySlug);

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center"><h1 className="text-4xl font-bold">{activeCategory ? activeCategory.name : "همه محصولات"}</h1><p className="mt-3 text-gray-500">محصولات فروشگاه را مشاهده و بررسی کنید.</p></div>

        {search && <p className="mt-6 text-center text-gray-500">نتایج جستجو برای: <span className="font-semibold text-gray-800">{search}</span></p>}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className={`rounded-full px-5 py-2 text-sm font-semibold ${!categorySlug ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"}`}>همه</Link>
          {(categories ?? []).map((category: any) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className={`rounded-full px-5 py-2 text-sm font-semibold ${categorySlug === category.slug ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"}`}>{category.name}</Link>)}
          <AvailabilityFilter />
        </div>

        {products && products.length > 0 ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product: any) => (
          <Link key={product.id} href={`/products/${product.id}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-200">
              {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-gray-500">تصویر محصول</span>}
              {product.in_stock === false && <SoldOutBadge />}
            </div>
            <div className="p-5">
              {product.categories?.name && <span className="text-xs font-semibold text-blue-600">{product.categories.name}</span>}
              <h2 className="mt-2 text-xl font-bold">{product.name}</h2>
              <p className="mt-1 text-xs text-gray-400" dir="ltr">کد محصول: #{String(product.id).padStart(4, "0")}</p>
              <p className="mt-4 text-lg font-bold text-blue-600">{Number(product.price).toLocaleString("fa-IR")} تومان</p>
            </div>
          </Link>
        ))}</div> : <div className="mt-12 rounded-2xl bg-white p-10 text-center text-gray-500">محصولی یافت نشد.</div>}
      </div>
    </main>
  );
}

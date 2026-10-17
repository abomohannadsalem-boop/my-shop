import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvailabilityFilter from "@/app/components/AvailabilityFilter";
import CaseFeatureFilter from "@/app/components/CaseFeatureFilter";
import { CASE_FEATURE_GROUPS, parseFeatureParam } from "@/lib/case-features";
import AddToCartButton from "@/app/components/AddToCartButton";
import SoldOutBadge from "@/app/components/SoldOutBadge";
import { formatProductCode, firstAvailableVariant, hasAvailableStock, productImageList } from "@/lib/product-stock";

type Props = { searchParams: Promise<{ category?: string; q?: string; available?: string; features?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { category: categorySlug, q: search, available, features } = await searchParams;
  const selectedFeatures = parseFeatureParam(features);
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug,parent_id").order("name");
  const activeCategory = (categories ?? []).find((c: any) => c.slug === categorySlug);
  let query = supabase.from("products").select("*, categories(id,name,slug)").order("created_at", { ascending: false });
  if (categorySlug) {
    if (activeCategory) {
      if (activeCategory.parent_id == null) {
        const childIds = (categories ?? []).filter((c: any) => c.parent_id === activeCategory.id).map((c: any) => c.id);
        query = query.in("category_id", [activeCategory.id, ...childIds]);
      } else query = query.eq("category_id", activeCategory.id);
    } else query = query.eq("category_id", -1);
  }
  if (search) {
    const cleaned = search.trim();
    // Search by the database-generated product code (e.g. PRD-000025) or by name.
    // Also keep numeric ID searches working for legacy bookmarks/admin workflows.
    const safeSearch = cleaned.replace(/[,%()]/g, " ").trim();
    const numericId = cleaned.match(/^#?(\d+)$/);
    if (numericId) {
      const parsedId = Number(numericId[1]);
      query = query.or(`name.ilike.%${safeSearch}%,product_code.ilike.%${safeSearch}%,id.eq.${Number.isSafeInteger(parsedId) ? parsedId : -1}`);
    } else {
      query = query.or(`name.ilike.%${safeSearch}%,product_code.ilike.%${safeSearch}%`);
    }
  }
  // Feature filter: nothing selected = show everything.
  // Within "any" groups (type, material) one match is enough; "all" groups (design) must all match.
  for (const group of CASE_FEATURE_GROUPS) {
    const picked = selectedFeatures.filter((value) => group.options.some((o) => o.value === value));
    if (picked.length === 0) continue;
    query = group.mode === "all" ? query.contains("case_features", picked) : query.overlaps("case_features", picked);
  }
  if (available === "1") query = query.eq("in_stock", true);
  const { data: products, error } = await query;
  const visibleProducts = available === "1" ? (products ?? []).filter((product: any) => hasAvailableStock(product)) : (products ?? []);

  if (error) return <main dir="rtl" className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-7xl"><h1 className="text-3xl font-bold">محصولات</h1><div className="mt-8 rounded-xl bg-red-50 p-6 text-red-600">خطا در دریافت محصولات: {error.message}</div></div></main>;

  return <main dir="rtl" className="min-h-[60vh] bg-slate-50 px-4 py-8 md:px-6 md:py-10">
    <div className="mx-auto max-w-7xl">
      <CaseFeatureFilter />
      {(search || available === "1") && <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">{search ? <>نتایج جستجو برای «{search}»</> : "محصولات موجود"}</p><AvailabilityFilter /></div>}
      {visibleProducts.length > 0 ? <>
        <div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{activeCategory?.name ?? (search ? "نتایج جستجو" : "همه محصولات")}</h1><span className="text-sm text-slate-400">{visibleProducts.length.toLocaleString("fa-IR")} محصول</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{visibleProducts.map((product: any) => <article key={product.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Link href={`/products/${product.id}`} className="block">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50">
              {product.image_url ? <img src={productImageList(product.image_url)[0]} alt={product.name} className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]" /> : <span className="text-sm text-slate-400">تصویر محصول</span>}
              {!hasAvailableStock(product) && <SoldOutBadge />}
            </div>
            <div className="min-h-28 p-3 pb-14 md:p-4 md:pb-14">
              <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-6 text-slate-800 md:text-base">{product.name}</h2>
              <p className="mt-1 text-xs text-slate-400" dir="ltr">کد محصول: {formatProductCode(product.product_code, product.id)}</p>
              <p className={`mt-2 text-xs font-bold ${hasAvailableStock(product) ? "text-green-600" : "text-red-600"}`}>{hasAvailableStock(product) ? "موجود است" : "ناموجود"}</p>
              <p className="mt-3 text-base font-extrabold text-blue-700 md:text-lg">{Number(product.price).toLocaleString("fa-IR")} <span className="text-xs font-medium">تومان</span></p>
            </div>
          </Link>
          <div className="absolute bottom-3 left-3"><AddToCartButton compact product={{ id: product.id, product_code: product.product_code ?? null, name: product.name, price: Number(product.price), image_url: productImageList(product.image_url)[0] ?? null, ...(firstAvailableVariant(product.variants)?.name ? { color_name: firstAvailableVariant(product.variants)?.name ?? null, color_hex: firstAvailableVariant(product.variants)?.hex ?? null } : {}) }} initialVariant={firstAvailableVariant(product.variants)} disabled={!hasAvailableStock(product)} /></div>
        </article>)}</div>
      </> : <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white px-6 py-16 text-center"><p className="text-lg font-medium text-slate-500">{selectedFeatures.length > 0 ? "محصولی با این مشخصات پیدا نشد. فیلترها را کم کن." : "فعلاً محصولی موجود نیست"}</p></div>}
    </div>
  </main>;
}

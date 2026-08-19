import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/app/components/AddToCartButton";
import SoldOutBadge from "@/app/components/SoldOutBadge";

type ProductPageProps = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase.from("products").select("*, categories(id,name,slug)").eq("id", id).single();
  if (error || !product) notFound();

  const { data: media } = await supabase.from("product_media").select("id,url,media_type,title,sort_order").eq("product_id", product.id).order("sort_order").order("id");
  const images = (media ?? []).filter((item: any) => item.media_type === "image");
  const videos = (media ?? []).filter((item: any) => item.media_type === "video");
  const allImages = product.image_url ? [{ id: "primary", url: product.image_url }] : [];
  for (const image of images) allImages.push({ id: image.id, url: image.url });

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href={product.categories?.slug ? `/products?category=${encodeURIComponent(product.categories.slug)}` : "/products"} className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800">← بازگشت به محصولات</Link>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid md:grid-cols-2">
            <div className="relative overflow-hidden bg-slate-100 p-6 md:p-10">
              <div className="flex min-h-[420px] items-center justify-center">{allImages[0] ? <img src={allImages[0].url} alt={product.name} className="max-h-[520px] w-full object-contain" /> : <div className="text-slate-400">تصویر محصول موجود نیست</div>}</div>
              {product.in_stock === false && <SoldOutBadge />}
              {allImages.length > 1 && <div className="mt-5 grid grid-cols-4 gap-3">{allImages.map((image: any) => <div key={image.id} className="flex h-20 items-center justify-center overflow-hidden rounded-lg border bg-white"><img src={image.url} alt={product.name} className="h-full w-full object-cover" /></div>)}</div>}
            </div>
            <div className="flex flex-col justify-center p-7 md:p-12">
              <div className="mb-3 flex items-center gap-3">
                {product.categories?.name && <span className="text-sm font-medium text-blue-600">{product.categories.name}</span>}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500" dir="ltr">کد محصول: #{String(product.id).padStart(4, "0")}</span>
              </div>
              <h1 className="text-3xl font-extrabold md:text-4xl">{product.name}</h1>
              <div className="my-6 h-px w-full bg-slate-200" />
              <h2 className="mb-3 text-lg font-bold">توضیحات محصول</h2>
              <p className="whitespace-pre-line leading-9 text-slate-600">{product.description}</p>
              <div className="mt-8 rounded-2xl bg-slate-50 p-5"><p className="mb-2 text-sm text-slate-500">قیمت</p><p className="text-3xl font-extrabold text-blue-600">{Number(product.price).toLocaleString("fa-IR")} <span className="text-base font-medium text-slate-500">تومان</span></p></div>
              <div className="mt-6">
                {product.in_stock === false ? (
                  <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-300 py-4 text-lg font-bold text-slate-600">ناموجود</button>
                ) : (
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, image_url: product.image_url }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {videos.length > 0 && <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg md:p-8"><h2 className="text-2xl font-bold">ویدیوهای محصول</h2><div className="mt-6 grid gap-6 md:grid-cols-2">{videos.map((video: any) => <div key={video.id} className="overflow-hidden rounded-2xl bg-black"><video controls preload="metadata" className="aspect-video w-full"><source src={video.url} type="video/mp4" />مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.</video>{video.title && <p className="bg-white p-4 font-semibold">{video.title}</p>}</div>)}</div></section>}

        {allImages.length > 1 && <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg md:p-8"><h2 className="text-2xl font-bold">گالری تصاویر</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{allImages.map((image: any) => <img key={image.id} src={image.url} alt={product.name} className="h-64 w-full rounded-2xl object-cover" />)}</div></section>}
      </div>
    </main>
  );
}

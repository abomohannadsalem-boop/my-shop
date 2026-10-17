"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatProductCode, hasAvailableStock } from "@/lib/product-stock";
import { CASE_FEATURE_GROUPS } from "@/lib/case-features";
import CustomerAdminCard from "./CustomerAdminCard";

const ADMIN_EMAIL = "mrehsanshop@gmail.com";
type Category = { id: number; name: string; slug: string; parent_id?: number | null };
type Variant = { name: string; hex: string; image_url: string | null; in_stock?: boolean };
type Product = { id: number; product_code?: string | null; name: string; description?: string | null; price: number; image_url?: string | null; category_id?: number | null; in_stock?: boolean | null; variants?: Variant[] | null; case_features?: string[] | null };
type CustomerProfile = { user_id: string; customer_code: string; full_name: string; phone?: string | null; contact_email?: string | null; national_id?: string | null; is_verified?: boolean | null; postal_code?: string | null; date_of_birth?: string | null; created_at: string };
type UserCart = { user_id: string; items: { id: number; product_code?: string | null; name: string; price: number; quantity: number; color_name?: string | null }[]; updated_at?: string };
type StoreBanner = { slot: number; image_url: string; alt_text: string };

async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("مرورگر امکان تبدیل تصویر را ندارد.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("تبدیل WebP انجام نشد.")), "image/webp", 0.84));
}

export default function AdminPage() {
  const supabase = createClient();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantHex, setNewVariantHex] = useState("#000000");
  const [newVariantImage, setNewVariantImage] = useState("");
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [customerCarts, setCustomerCarts] = useState<UserCart[]>([]);
  const [banners, setBanners] = useState<StoreBanner[]>([1,2,3,4,5].map(slot => ({ slot, image_url: `/banners/banner-${slot}.svg`, alt_text: `بنر نمایشی ${slot} فروشگاه Golden Lion` })));
  const [bannerBusySlot, setBannerBusySlot] = useState<number | null>(null);
  const [inStock, setInStock] = useState(true);
  const [caseFeatures, setCaseFeatures] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const [{ data: ps, error: pe }, { data: cs, error: ce }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name,slug,parent_id").order("name"),
    ]);
    if (pe) setMessage(`خطا در دریافت محصولات: ${pe.message}`);
    if (ce) setMessage(`خطا در دریافت دسته‌بندی‌ها: ${ce.message}`);
    setProducts((ps ?? []) as Product[]);
    setCategories((cs ?? []) as Category[]);
  }


  async function loadBanners() {
    const { data, error } = await supabase.from("storefront_banners").select("slot,image_url,alt_text").order("slot");
    if (error) {
      setMessage("برای فعال شدن مدیریت بنرها، فایل supabase/migrations/20261017_storefront_banners.sql را در Supabase اجرا کن.");
      return;
    }
    if (data?.length) {
      setBanners(current => current.map(fallback => data.find(row => row.slot === fallback.slot) ?? fallback));
    }
  }

  async function uploadBanner(slot: number, file?: File) {
    if (!file) return;
    setBannerBusySlot(slot);
    setMessage(`در حال بارگذاری بنر ${slot}...`);
    try {
      const blob = await toWebp(file);
      const path = `banners/banner-${slot}-${Date.now()}-${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(path);
      const banner = { slot, image_url: publicData.publicUrl, alt_text: `بنر ${slot} فروشگاه Golden Lion` };
      const { error } = await supabase.from("storefront_banners").upsert(banner, { onConflict: "slot" });
      if (error) throw error;
      setBanners(current => current.map(item => item.slot === slot ? banner : item));
      setMessage(`بنر ${slot} با موفقیت تغییر کرد.`);
    } catch (error) {
      setMessage(`تغییر بنر انجام نشد: ${error instanceof Error ? error.message : "خطای نامشخص"}`);
    } finally {
      setBannerBusySlot(null);
    }
  }

  async function loadCustomers() {
    const [{ data: profiles, error: profileError }, { data: carts, error: cartError }] = await Promise.all([
      supabase.from("customer_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_carts").select("user_id,items,updated_at"),
    ]);
    if (profileError || cartError) {
      setMessage("برای نمایش مشخصات مشتری و سبدهای خرید، migration جدید Supabase را اجرا کن. " + (profileError?.message || cartError?.message || ""));
      return;
    }
    setCustomers((profiles ?? []) as CustomerProfile[]);
    setCustomerCarts((carts ?? []) as UserCart[]);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setAuthorized((data.user?.email ?? "").toLowerCase() === ADMIN_EMAIL);
      setChecking(false);
      if ((data.user?.email ?? "").toLowerCase() === ADMIN_EMAIL) { await loadProducts(); await loadCustomers(); await loadBanners(); }
    })();
    return () => { active = false; };
  }, []);

  function resetForm() {
    setEditingId(null); setName(""); setDescription(""); setPrice(""); setCategoryId(""); setImageUrls([]); setVariants([]); setNewVariantName(""); setNewVariantHex("#000000"); setNewVariantImage(""); setInStock(true); setCaseFeatures([]);
  }

  async function uploadImages(files: File[]) {
    if (!files.length) return;
    setBusy(true); setMessage(`در حال تبدیل و بارگذاری ${files.length} تصویر...`);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const blob = await toWebp(file);
        const path = `${Date.now()}-${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/webp", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImageUrls(current => [...current, ...uploaded]);
      setMessage(`${uploaded.length} تصویر WebP با موفقیت بارگذاری شد.`);
    } catch (e) { setMessage(`خطا در بارگذاری عکس: ${e instanceof Error ? e.message : "خطای نامشخص"}`); }
    finally { setBusy(false); }
  }

  function startEdit(p: Product) {
    setEditingId(p.id); setName(p.name); setDescription(p.description ?? ""); setPrice(String(p.price)); setCategoryId(p.category_id ? String(p.category_id) : ""); setImageUrls(String(p.image_url ?? "").split("|||||").map(x => x.trim()).filter(Boolean)); setVariants(Array.isArray(p.variants) ? p.variants : []); setInStock(p.in_stock !== false); setCaseFeatures(Array.isArray(p.case_features) ? p.case_features : []); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addVariant() {
    const variantName = newVariantName.trim();
    if (!variantName) { setMessage("برای رنگ جدید یک نام وارد کن."); return; }
    if (variants.some(v => v.name.trim().toLocaleLowerCase() === variantName.toLocaleLowerCase())) { setMessage("این رنگ قبلاً اضافه شده است."); return; }
    setVariants(current => [...current, { name: variantName, hex: newVariantHex, image_url: newVariantImage || null, in_stock: true }]);
    setNewVariantName(""); setNewVariantHex("#000000"); setNewVariantImage(""); setMessage("");
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      category_id: categoryId ? Number(categoryId) : null,
      image_url: imageUrls.join("|||||") || null,
      variants,
      in_stock: inStock,
      case_features: caseFeatures,
    };

    try {
      // image_url is the primary gallery source used by ProductGallery and product cards.
      // Avoid making a successful product save appear to fail because optional product_media
      // synchronization is blocked by a separate table policy.
      const result = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert(payload);

      if (result.error) throw result.error;

      const wasEditing = editingId !== null;
      resetForm();
      await loadProducts();
      setMessage(wasEditing ? "تغییرات محصول با موفقیت ذخیره شد." : "محصول با موفقیت ثبت شد.");
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : e instanceof Error
            ? e.message
            : String(e ?? "خطای نامشخص");
      setMessage(`ذخیره انجام نشد: ${errorMessage}`);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!window.confirm("از حذف این محصول مطمئن هستید؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setMessage(`حذف انجام نشد: ${error.message}`); else { setMessage("محصول حذف شد."); await loadProducts(); }
  }

  if (checking) return <main dir="rtl" className="mx-auto max-w-5xl p-8">در حال بررسی دسترسی...</main>;
  if (!authorized) return <main dir="rtl" className="mx-auto max-w-2xl p-8"><div className="rounded-2xl bg-white p-8 shadow"><h1 className="text-2xl font-bold">دسترسی محدود است</h1><p className="mt-3 text-gray-600">این صفحه فقط برای حساب ادمین {ADMIN_EMAIL} فعال است. ابتدا با همان ایمیل وارد سایت شوید.</p></div></main>;

  return <main dir="rtl" className="mx-auto max-w-6xl px-4 py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">پنل مدیریت فروشگاه</h1><p className="mt-2 text-gray-500">مدیریت محصولات · {ADMIN_EMAIL}</p></div><a href="/" className="rounded-lg border bg-white px-4 py-2">مشاهده فروشگاه</a></div>
    {message && <p role="status" className="mb-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">{message}</p>}
    <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4"><h2 className="text-xl font-bold">بنرهای صفحه اصلی (۵ تصویر)</h2><p className="mt-2 text-sm leading-6 text-slate-500">این تصاویر فقط نمایش داده می‌شوند و قابلیت کلیک ندارند. برای تغییر هر کدام، تصویر جدید را انتخاب کن؛ نسبت پیشنهادی تصویر ۱۲۰۰×۳۶۰ است.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {banners.map(banner => <div key={banner.slot} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          <img src={banner.image_url} alt={banner.alt_text} className="aspect-[10/3] w-full rounded-lg object-cover" />
          <p className="my-2 text-sm font-semibold">بنر {banner.slot}</p>
          <label className="block cursor-pointer rounded-lg border bg-white px-3 py-2 text-center text-xs font-semibold hover:bg-slate-100">{bannerBusySlot === banner.slot ? "در حال بارگذاری..." : "تغییر تصویر"}<input type="file" accept="image/*" disabled={bannerBusySlot !== null} onChange={e => { const file = e.currentTarget.files?.[0]; void uploadBanner(banner.slot, file); e.currentTarget.value = ""; }} className="sr-only" /></label>
        </div>)}
      </div>
    </section>
    <form onSubmit={saveProduct} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-xl font-bold">{editingId ? "ویرایش محصول" : "ثبت محصول جدید"}</h2>
      <label className="block">نام محصول<input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="block">قیمت (تومان)<input type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} required className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="block">دسته‌بندی گوشی<select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">انتخاب مدل گوشی</option>{categories.filter(c=>c.parent_id != null || !categories.some(child=>child.parent_id===c.id)).map(c=><option key={c.id} value={c.id}>{c.parent_id != null ? `${categories.find(parent=>parent.id===c.parent_id)?.name} ← ${c.name}` : c.name}</option>)}</select><span className="mt-1 block text-xs text-gray-500">برای ثبت محصول، زیر‌دسته مدل گوشی را انتخاب کن.</span></label>
      <label className="block">عکس‌های محصول (چند عکس انتخاب کن؛ تبدیل خودکار به WebP)<input type="file" accept="image/*" multiple onChange={e=>{const files=Array.from(e.target.files ?? []); uploadImages(files); e.currentTarget.value="";}} className="mt-1 block w-full rounded-lg border p-3" /><span className="mt-1 block text-xs text-gray-500">می‌توانی چند عکس را هم‌زمان انتخاب کنی یا در چند نوبت عکس اضافه کنی.</span></label>
      {imageUrls.length > 0 && <div className="md:col-span-2"><p className="mb-3 font-semibold">تصاویر انتخاب‌شده ({imageUrls.length})</p><div className="flex flex-wrap gap-3">{imageUrls.map((url,index)=><div key={`${url}-${index}`} className="relative"><img src={url} alt={`پیش‌نمایش ${index+1}`} className="h-28 w-28 rounded-xl border object-cover"/><button type="button" onClick={()=>{setImageUrls(current=>current.filter((_,i)=>i!==index));setVariants(current=>current.map(v=>v.image_url===url?{...v,image_url:null}:v));}} className="mt-1 w-full rounded border border-red-200 px-2 py-1 text-xs text-red-600">حذف عکس</button></div>)}</div></div>}
      <section className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold">رنگ‌های محصول و تصویر هر رنگ</h3>
        <p className="mt-1 text-sm text-slate-500">ابتدا عکس‌ها را بارگذاری کن، بعد برای هر رنگ تصویر مرتبط را انتخاب کن. انتخاب رنگ در صفحه محصول تصویر همان رنگ را نمایش می‌دهد.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">نام رنگ<input value={newVariantName} onChange={e=>setNewVariantName(e.target.value)} placeholder="مثلاً مشکی" className="mt-1 w-full rounded-lg border bg-white p-3" /></label>
          <label className="text-sm">نمونه رنگ<input type="color" value={newVariantHex} onChange={e=>setNewVariantHex(e.target.value)} className="mt-1 h-12 w-full rounded-lg border bg-white p-2" /></label>
          <label className="text-sm">تصویر مربوط به رنگ<select value={newVariantImage} onChange={e=>setNewVariantImage(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">بدون تصویر اختصاصی</option>{imageUrls.map((url, i)=><option key={url} value={url}>تصویر {i+1}</option>)}</select></label>
          <button type="button" onClick={addVariant} className="self-end rounded-lg bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700">افزودن رنگ</button>
        </div>
        {variants.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{variants.map((variant, i)=><div key={`${variant.name}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3"><span className="h-6 w-6 rounded-full border" style={{backgroundColor: variant.hex || "#e5e7eb"}} /><div className="min-w-24 flex-1"><p className="font-semibold">{variant.name}</p><p className="text-xs text-slate-500">{variant.image_url ? `تصویر ${Math.max(1, imageUrls.indexOf(variant.image_url)+1)}` : "بدون تصویر اختصاصی"}</p></div><label className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold ${variant.in_stock === false ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}><input type="checkbox" checked={variant.in_stock !== false} onChange={e=>setVariants(current=>current.map((v,idx)=>idx===i?{...v,in_stock:e.target.checked}:v))}/>{variant.in_stock === false ? "ناموجود" : "موجود است"}</label><button type="button" onClick={()=>setVariants(current=>current.filter((_,idx)=>idx!==i))} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">حذف</button></div>)}</div>}
      </section>
      <label className="block md:col-span-2">توضیحات<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border p-3" /></label>
      <section className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold">مشخصات قاب (برای فیلتر مشتری‌ها)</h3>
        <p className="mt-1 text-sm text-slate-500">هر چند مورد که مناسب این محصول است تیک بزن؛ مثلاً یک قاب چرمی مگ‌سیف‌دار فانتزی: «چرمی» + «مگ‌سیف» + «فانتزی».</p>
        <div className="mt-3 space-y-4">{CASE_FEATURE_GROUPS.map(group=><div key={group.key}><p className="mb-2 text-sm font-semibold text-slate-600">{group.title}</p><div className="flex flex-wrap gap-2">{group.options.map(option=>{const checked=caseFeatures.includes(option.value);return <label key={option.value} className={`flex cursor-pointer select-none items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${checked ? "border-amber-500 bg-amber-50 font-semibold text-amber-800" : "border-slate-200 bg-white"}`}><input type="checkbox" checked={checked} onChange={()=>setCaseFeatures(current=>checked ? current.filter(x=>x!==option.value) : [...current, option.value])} className="h-4 w-4 accent-amber-600" />{option.label}</label>})}</div></div>)}</div>
      </section>
      <div><label className="flex items-center gap-2"><input type="checkbox" checked={inStock} onChange={e=>setInStock(e.target.checked)} /> محصول به‌طور کلی موجود است</label><p className="mt-1 text-xs text-slate-500">اگر این گزینه خاموش باشد، همه رنگ‌ها ناموجود در نظر گرفته می‌شوند. برای کنترل جداگانه موجودی هر رنگ، این گزینه روشن باشد و وضعیت رنگ‌ها را از بخش رنگ‌ها تنظیم کن.</p></div>
      <div className="flex flex-wrap gap-3 md:col-span-2"><button disabled={busy} className="rounded-lg bg-blue-700 px-6 py-3 font-bold text-white disabled:opacity-50">{busy ? "لطفاً صبر کنید..." : editingId ? "ذخیره تغییرات" : "ثبت محصول"}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-lg border px-5 py-3">لغو ویرایش</button>}</div>
    </form>
    <section className="mt-9"><h2 className="mb-4 text-2xl font-bold">محصولات ثبت‌شده ({products.length})</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map(p=><article key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm">{p.image_url ? <img src={p.image_url.split("|||||")[0].trim()} alt={p.name} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gray-100 text-gray-400">بدون تصویر</div>}<div className="p-4"><h3 className="font-bold">{p.name}</h3><p className="mt-1 text-xs text-slate-400" dir="ltr">کد محصول: {formatProductCode(p.product_code, p.id)}</p><p className={`mt-1 text-sm font-bold ${hasAvailableStock(p) ? "text-green-600" : "text-red-600"}`}>{hasAvailableStock(p) ? "موجود است" : "ناموجود"}</p><p className="mt-1 text-blue-700">{Number(p.price).toLocaleString("fa-IR")} تومان</p>{Array.isArray(p.variants) && p.variants.length > 0 && <p className="mt-1 text-xs text-slate-500">{p.variants.length} رنگ ثبت شده</p>}<div className="mt-4 flex gap-2"><button onClick={()=>startEdit(p)} className="rounded-lg border px-4 py-2">ویرایش</button><button onClick={()=>deleteProduct(p.id)} className="rounded-lg border border-red-200 px-4 py-2 text-red-600">حذف</button></div></div></article>)}</div></section>
    <section className="mt-12"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">مشتریان و سبد خریدشان ({customers.length})</h2><p className="mt-1 text-sm text-slate-500">کد مشتری برای هر حساب یکتا است.</p></div><button type="button" onClick={loadCustomers} className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50">به‌روزرسانی</button></div>
      {customers.length === 0 ? <div className="rounded-xl bg-white p-6 text-sm text-slate-500">هنوز اطلاعات مشتری نمایش داده نمی‌شود. اگر migration اجرا شده ولی این پیام پابرجاست، مجوزهای Supabase را بررسی کن.</div> : <div className="space-y-4">{customers.map(customer=><CustomerAdminCard key={customer.user_id} customer={customer} items={customerCarts.find(c=>c.user_id===customer.user_id)?.items ?? []} onChanged={loadCustomers} notify={setMessage} />)}</div>}
    </section>
  </main>;
}

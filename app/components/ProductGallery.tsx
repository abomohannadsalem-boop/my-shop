"use client";

import { useEffect, useMemo, useState } from "react";

type Variant = { name: string; hex?: string | null; image_url?: string | null; in_stock?: boolean | null };
type ProductGalleryProps = {
  productId: number;
  imageUrl: string;
  productName: string;
  soldOut?: boolean;
  variants?: Variant[] | null;
};

export default function ProductGallery({ productId, imageUrl, productName, soldOut = false, variants = [] }: ProductGalleryProps) {
  const baseImages = useMemo(() => imageUrl.split("|||||").map((url) => url.trim()).filter(Boolean), [imageUrl]);
  const validVariants = useMemo(() => (variants ?? []).filter((variant) => variant?.name?.trim()), [variants]);
  // Keep every product image in the gallery; variant images are included even if an older product
  // record did not have them in image_url.
  const images = useMemo(() => Array.from(new Set([
    ...baseImages,
    ...validVariants.map(v => v.image_url?.trim()).filter((url): url is string => Boolean(url)),
  ])), [baseImages, validVariants]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => Math.max(0, validVariants.findIndex(variant => variant.in_stock !== false)));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedVariant = validVariants[selectedVariantIndex] ?? null;
  const variantAvailable = !soldOut && (selectedVariant?.in_stock !== false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("shop-product-color-selected", { detail: { productId, variant: selectedVariant } }));
  }, [productId, selectedVariant]);

  useEffect(() => {
    if (!selectedVariant?.image_url) return;
    const mappedIndex = images.indexOf(selectedVariant.image_url.trim());
    if (mappedIndex >= 0) setSelectedImageIndex(mappedIndex);
  }, [selectedVariantIndex, selectedVariant, images]);

  return (
    <div className="relative overflow-hidden bg-slate-100 p-6 md:p-10">
      <div className="flex min-h-[360px] items-center justify-center md:min-h-[420px]">
        {images.length > 0 ? <img src={images[selectedImageIndex] ?? images[0]} alt={`${productName}${selectedVariant ? ` - رنگ ${selectedVariant.name}` : ""}`} className="max-h-[520px] w-full object-contain" /> : <span className="text-slate-400">تصویر محصول موجود نیست</span>}
      </div>
      <div className="absolute left-8 top-8">
        <span className={`rounded-full px-4 py-2 text-sm font-bold shadow ${variantAvailable ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {variantAvailable ? "موجود است" : "ناموجود"}
        </span>
      </div>

      {validVariants.length > 0 && <section className="mt-6 rounded-2xl bg-white/90 p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-800">انتخاب رنگ{selectedVariant ? `: ${selectedVariant.name}` : ""}</p>
        <div className="flex flex-wrap gap-3">
          {validVariants.map((variant, index) => {
            const available = !soldOut && variant.in_stock !== false;
            return <button key={`${variant.name}-${index}`} type="button" onClick={() => { setSelectedVariantIndex(index); if (variant.image_url) { const imageIndex = images.indexOf(variant.image_url.trim()); if (imageIndex >= 0) setSelectedImageIndex(imageIndex); } }} title={`${variant.name} - ${available ? "موجود" : "ناموجود"}`} aria-label={`انتخاب رنگ ${variant.name}`} aria-pressed={selectedVariantIndex === index} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${selectedVariantIndex === index ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300"}`}>
              <span className={`h-5 w-5 rounded-full border border-black/10 shadow-inner ${available ? "" : "opacity-45"}`} style={{ backgroundColor: variant.hex || "#e5e7eb" }} />
              <span>{variant.name}</span>
              <span className={`text-xs font-bold ${available ? "text-green-700" : "text-red-600"}`}>{available ? "موجود" : "ناموجود"}</span>
            </button>;
          })}
        </div>
      </section>}

      {images.length > 0 && <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-slate-700">همه تصاویر محصول</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((url, index) => <button key={`${url}-${index}`} type="button" onClick={() => setSelectedImageIndex(index)} aria-label={`نمایش تصویر ${index + 1}`} aria-pressed={selectedImageIndex === index} className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${selectedImageIndex === index ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-400"}`}>
            <img src={url} alt={`${productName} - تصویر ${index + 1}`} className="h-full w-full object-cover" />
          </button>)}
        </div>
        <p className="mt-3 text-center text-sm text-slate-400">تصویر {(selectedImageIndex + 1).toLocaleString("fa-IR")} از {images.length.toLocaleString("fa-IR")}</p>
      </div>}
    </div>
  );
}

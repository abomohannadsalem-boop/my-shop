"use client";

import { useState } from "react";

type ProductGalleryProps = {
  imageUrl: string;
  productName: string;
  soldOut?: boolean;
};

export default function ProductGallery({
  imageUrl,
  productName,
  soldOut = false,
}: ProductGalleryProps) {
  const images = imageUrl
  .split("|||||")
  .map((url) => url.trim())
  .filter(Boolean);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative flex min-h-[500px] items-center justify-center bg-slate-100">
        <span className="text-slate-400">
          تصویر محصول موجود نیست
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-slate-100 p-6 md:p-10">
      {/* عکس بزرگ */}
      <div className="flex min-h-[420px] items-center justify-center">
        <img
          src={images[selectedIndex]}
          alt={`${productName} - تصویر ${selectedIndex + 1}`}
          className="max-h-[520px] w-full object-contain"
        />
      </div>

      {/* برچسب ناموجود */}
      {soldOut && (
        <div className="absolute right-8 top-8">
          <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow">
            ناموجود
          </div>
        </div>
      )}

      {/* تصاویر کوچک */}
      {images.length > 1 && (
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                  selectedIndex === index
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-slate-200 hover:border-blue-400"
                }`}
              >
                <img
                  src={url}
                  alt={`${productName} - تصویر ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-sm text-slate-400">
            تصویر {selectedIndex + 1} از {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
export type ProductVariantStock = { name: string; hex?: string | null; image_url?: string | null; in_stock?: boolean | null };
export type ProductStockState = {
  in_stock?: boolean | null;
  variants?: ProductVariantStock[] | null;
};

/** A product with variants is available when at least one color is available, unless the whole product is disabled. */
export function hasAvailableStock(product: ProductStockState): boolean {
  if (product.in_stock === false) return false;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return variants.length === 0 || variants.some((variant) => variant?.in_stock !== false);
}

/** Select an available color by default so quick-add never silently picks an unavailable color. */
export function firstAvailableVariant<T extends ProductVariantStock>(variants: T[] | null | undefined): T | null {
  const list = Array.isArray(variants) ? variants : [];
  return list.find((variant) => variant?.in_stock !== false) ?? list[0] ?? null;
}

export function productImageList(imageUrl?: string | null): string[] {
  return String(imageUrl ?? "").split("|||||").map((url) => url.trim()).filter(Boolean);
}

/** Prefer the database-generated product code; show the old ID format only as a safe fallback before migration. */
export function formatProductCode(productCodeOrId: string | number | null | undefined, fallbackId?: number | string): string {
  if (typeof productCodeOrId === "string" && productCodeOrId.trim()) {
    return productCodeOrId.trim();
  }
  const id = fallbackId ?? productCodeOrId;
  if (id === null || id === undefined || id === "") return "—";
  return `PRD-${String(id).padStart(6, "0")}`;
}

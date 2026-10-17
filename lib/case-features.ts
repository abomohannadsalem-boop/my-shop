// Phone-case features used by the admin product form and the storefront filter.
// "any": a product matches if it has AT LEAST ONE selected option of that group.
// "all": a product must have EVERY selected option of that group.
export type CaseFeatureGroup = {
  key: string;
  title: string;
  mode: "any" | "all";
  options: { value: string; label: string }[];
};

export const CASE_FEATURE_GROUPS: CaseFeatureGroup[] = [
  {
    key: "kind",
    title: "نوع محصول",
    mode: "any",
    options: [
      { value: "case", label: "قاب گوشی" },
      { value: "guard", label: "گارد گوشی" },
    ],
  },
  {
    key: "material",
    title: "جنس قاب",
    mode: "any",
    options: [
      { value: "fabric", label: "پارچه‌ای" },
      { value: "jelly", label: "ژله‌ای" },
      { value: "leather", label: "چرمی" },
      { value: "wood", label: "چوبی" },
      { value: "silicone", label: "سیلیکونی" },
      { value: "carbon", label: "فیبر کربن" },
      { value: "hybrid", label: "ترکیبی و هیبریدی" },
    ],
  },
  {
    key: "design",
    title: "طراحی و امکانات",
    mode: "all",
    options: [
      { value: "standard", label: "استاندارد" },
      { value: "shockproof", label: "ضربه‌گیر" },
      { value: "hard", label: "سخت" },
      { value: "waterproof", label: "ضدآب" },
      { value: "magnetic", label: "مگنتی" },
      { value: "folio", label: "کلاسوری (کتابی)" },
      { value: "magsafe", label: "مگ‌سیف" },
      { value: "fancy", label: "فانتزی و طرح‌دار" },
      { value: "holder", label: "هولدردار و پاپ‌آپ" },
    ],
  },
];

export const ALL_CASE_FEATURE_VALUES = CASE_FEATURE_GROUPS.flatMap((g) => g.options.map((o) => o.value));

export function caseFeatureLabel(value: string) {
  for (const g of CASE_FEATURE_GROUPS) {
    const found = g.options.find((o) => o.value === value);
    if (found) return found.label;
  }
  return value;
}

/** Parse the ?features=a,b,c URL param into a clean list of known values. */
export function parseFeatureParam(param?: string | null): string[] {
  if (!param) return [];
  return Array.from(new Set(param.split(",").map((x) => x.trim()).filter((x) => ALL_CASE_FEATURE_VALUES.includes(x))));
}

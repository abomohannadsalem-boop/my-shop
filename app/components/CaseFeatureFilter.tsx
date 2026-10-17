"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CASE_FEATURE_GROUPS, parseFeatureParam } from "@/lib/case-features";

export default function CaseFeatureFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = parseFeatureParam(searchParams.get("features"));
  const [open, setOpen] = useState(selected.length > 0);

  function update(next: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set("features", next.join(","));
    else params.delete("features");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggle(value: string) {
    update(selected.includes(value) ? selected.filter((x) => x !== value) : [...selected, value]);
  }

  return (
    <section dir="rtl" aria-label="فیلتر مشخصات قاب" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-2 font-bold text-slate-800">
          فیلتر مشخصات قاب
          {selected.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{selected.length.toLocaleString("fa-IR")} انتخاب</span>}
          <span aria-hidden="true" className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {selected.length > 0 && <button type="button" onClick={() => update([])} className="text-sm text-red-600 hover:underline">پاک کردن فیلترها (نمایش همه)</button>}
      </div>
      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          {CASE_FEATURE_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-sm font-semibold text-slate-500">{group.title}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <label key={option.value} className={`flex cursor-pointer select-none items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${checked ? "border-amber-500 bg-amber-50 font-semibold text-amber-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(option.value)} className="h-4 w-4 accent-amber-600" />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">اگر هیچ مورد را انتخاب نکنی، همه محصولات نمایش داده می‌شوند.</p>
        </div>
      )}
    </section>
  );
}

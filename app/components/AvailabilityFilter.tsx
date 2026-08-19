"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AvailabilityFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const checked = searchParams.get("available") === "1";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.delete("available");
    } else {
      params.set("available", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border bg-white px-5 py-2 text-sm font-semibold text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={toggle}
        className="h-4 w-4 accent-blue-600"
      />
      فقط نمایش کالاهای موجود
    </label>
  );
}

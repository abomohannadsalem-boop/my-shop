"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Category = { id: number; name: string; slug: string; parent_id?: number | null };
type HeaderProps = { categories: Category[] };

const phoneBrands = [
  { label: "سامسونگ", query: "سامسونگ" },
  { label: "شیائومی", query: "شیائومی" },
  { label: "داریا", query: "داریا" },
  { label: "وکال", query: "وکال" },
  { label: "لنوو", query: "لنوو" },
];

export default function Header({ categories }: HeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parents = categories.filter((category) =>
    category.parent_id == null &&
    /سامسونگ|samsung|شیائومی|xiaomi|داریا|daria|وکال|vcall|لنوو|lenovo/i.test(category.name)
  );

  function clearDropdownTimer() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? user?.phone ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserEmail(session?.user?.email ?? session?.user?.phone ?? null)
    );
    return () => { subscription.unsubscribe(); clearDropdownTimer(); };
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <header dir="rtl" className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        <div className="flex min-h-[84px] flex-wrap items-center justify-between gap-3 py-3 md:flex-nowrap">
          <Link href="/" aria-label="صفحه اصلی Golden Lion" className="flex shrink-0 items-center gap-2">
            <Image src="/golden-lion-logo.png" alt="لوگوی Golden Lion" width={160} height={90} priority className="h-12 w-auto max-w-[105px] object-contain sm:h-14 sm:max-w-[135px]" />
            <span className="hidden whitespace-nowrap text-lg font-extrabold tracking-tight text-amber-700 sm:inline md:text-xl">Golden Lion</span>
          </Link>

          <form action="/products" method="GET" role="search" className="order-3 w-full md:order-none md:mx-4 md:max-w-lg md:flex-1">
            <input type="search" name="q" placeholder="جستجوی نام یا کد محصول..." aria-label="جستجوی نام یا کد محصول" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100" />
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/cart" aria-label="سبد خرید" title="سبد خرید" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-xl text-slate-700 transition hover:border-amber-300 hover:bg-amber-50">🛒</Link>
            {loading ? <div className="h-9 w-12 animate-pulse rounded-lg bg-gray-100" /> : userEmail ? <>
              {userEmail.toLowerCase() === "mrehsanshop@gmail.com" && <Link href="/admin" className="whitespace-nowrap rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">مدیریت</Link>}
              <Link href="/account" className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs hover:bg-gray-50">حساب کاربری</Link>
              <button onClick={handleLogout} className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 sm:block">خروج</button>
            </> : <Link href="/login" className="whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">ورود</Link>}
          </div>
        </div>

        <nav className="relative flex min-h-[52px] flex-wrap items-center justify-center gap-1 border-t border-slate-100 py-2 text-sm font-semibold sm:gap-3" aria-label="دسته‌بندی قاب گوشی">
          {phoneBrands.map((brand) => {
            const match = parents.find((category) => {
              const name = category.name.toLowerCase();
              return brand.label === "سامسونگ" ? /سامسونگ|samsung/.test(name)
                : brand.label === "شیائومی" ? /شیائومی|xiaomi/.test(name)
                : brand.label === "داریا" ? /داریا|daria/.test(name)
                : brand.label === "وکال" ? /وکال|vcall/.test(name)
                : /لنوو|lenovo/.test(name);
            });
            const children = match ? categories.filter((category) => category.parent_id === match.id).sort((x, y) => x.name.localeCompare(y.name, "fa", { numeric: true })) : [];
            const wide = children.length > 10;
            const isOpen = !!match && activeParentId === match.id;
            return (
              <div key={brand.query} className={`${wide ? "" : "relative"} shrink-0`} onMouseEnter={() => { if (match) { clearDropdownTimer(); setActiveParentId(match.id); } }} onMouseLeave={() => { clearDropdownTimer(); closeTimeout.current = setTimeout(() => setActiveParentId(null), 250); }}>
                <Link href={match ? `/products?category=${encodeURIComponent(match.slug)}` : `/products?q=${encodeURIComponent(brand.query)}`} onClick={() => setActiveParentId(null)} className={`flex items-center gap-1 rounded-md px-3 py-2 transition hover:bg-amber-50 hover:text-amber-800 ${isOpen ? "bg-amber-50 text-amber-800" : "text-slate-700"}`}>
                  {brand.label}<span aria-hidden="true" className="text-[10px]">⌄</span>
                </Link>
                {match && children.length > 0 && <div className={`absolute top-full z-50 pt-1 transition-opacity ${wide ? "left-1/2 w-[min(72rem,calc(100vw-1.5rem))] -translate-x-1/2" : "right-0 w-64 max-w-[calc(100vw-1.5rem)]"} ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
                  <div className="max-h-[calc(100vh-190px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 text-right shadow-xl">
                    <Link href={`/products?category=${encodeURIComponent(match.slug)}`} onClick={() => setActiveParentId(null)} className="block rounded-lg px-3 py-2 font-bold hover:bg-amber-50">همه قاب‌های {brand.label}</Link>
                    <div className={wide ? "grid grid-cols-2 gap-x-1 sm:grid-cols-3 lg:grid-cols-5" : ""}>
                      {children.map((child) => <Link key={child.id} href={`/products?category=${encodeURIComponent(child.slug)}`} onClick={() => setActiveParentId(null)} className="block rounded-lg px-3 py-1 text-[13px] text-slate-700 hover:bg-amber-50">{child.name}</Link>)}
                    </div>
                  </div>
                </div>}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

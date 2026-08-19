"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type HeaderProps = {
  categories: Category[];
};

export default function Header({ categories }: HeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* لوگو */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-700"
        >
          فروشگاه من
        </Link>

        {/* منوی اصلی */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            href="/"
            className="hover:text-blue-600"
          >
            خانه
          </Link>

          <Link
            href="/products"
            className="hover:text-blue-600"
          >
            محصولات
          </Link>

          {/* دسته‌بندی‌ها */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button
              type="button"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              دسته‌بندی‌ها
              <span className="text-xs">▼</span>
            </button>

            {showCategories && (
              <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border bg-white p-2 shadow-xl">

                {/* همه محصولات */}
                <Link
                  href="/products"
                  className="block rounded-lg px-4 py-3 text-right font-semibold hover:bg-blue-50 hover:text-blue-600"
                >
                  همه محصولات
                </Link>

                <div className="my-1 border-t" />

                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${encodeURIComponent(
                        category.slug
                      )}`}
                      className="block rounded-lg px-4 py-3 text-right hover:bg-blue-50 hover:text-blue-600"
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    دسته‌بندی‌ای وجود ندارد
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className="hover:text-blue-600"
          >
            تماس با ما
          </Link>

        </nav>

        {/* حساب کاربری */}
        <div className="flex items-center gap-3">

          {loading ? (
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
          ) : userEmail ? (
            <>
              <Link
                href="/account"
                className="hidden rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 md:block"
              >
                حساب کاربری
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              ورود
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
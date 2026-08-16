"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-700"
        >
          فروشگاه من
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            خانه
          </Link>

          <Link
            href="/products"
            className="transition hover:text-blue-600"
          >
            محصولات
          </Link>

          <Link
            href="/catalogs"
            className="transition hover:text-blue-600"
          >
            کاتالوگ‌ها
          </Link>

          <Link
            href="/videos"
            className="transition hover:text-blue-600"
          >
            ویدیوها
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-blue-600"
          >
            تماس با ما
          </Link>

        </nav>

        {/* User section */}
        <div className="flex items-center gap-3">

          {loading ? (
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
          ) : userEmail ? (
            <>
              <Link
                href="/account"
                className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 md:block"
              >
                حساب کاربری
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
            >
              ورود
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
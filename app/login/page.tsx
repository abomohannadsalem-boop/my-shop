"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("ایمیل یا رمز عبور اشتباه است.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            ورود به حساب
          </h1>

          <p className="mt-3 text-gray-500">
            وارد حساب کاربری خود شوید
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          {/* Email */}
          <div>

            <label className="mb-2 block font-medium">
              ایمیل
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

          </div>

          {/* Password */}
          <div>

            <label className="mb-2 block font-medium">
              رمز عبور
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>

        </form>

        {/* Message */}
        {message && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        {/* Register */}
        <div className="mt-6 text-center text-sm text-gray-500">

          حساب کاربری ندارید؟{" "}

          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ثبت‌نام کنید
          </Link>

        </div>

      </div>

    </main>
  );
}
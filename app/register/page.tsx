"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "ثبت‌نام انجام شد. ایمیل خود را برای تأیید حساب بررسی کنید."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            ایجاد حساب کاربری
          </h1>

          <p className="mt-3 text-gray-500">
            برای ثبت‌نام اطلاعات خود را وارد کنید
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5"
        >

          {/* Name */}
          <div>

            <label className="mb-2 block font-medium">
              نام و نام خانوادگی
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام شما"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600"
            />

          </div>

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
              placeholder="حداقل ۶ کاراکتر"
              minLength={6}
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
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>

        </form>

        {/* Message */}
        {message && (
          <div className="mt-5 rounded-lg bg-gray-100 p-4 text-center text-sm">
            {message}
          </div>
        )}

        {/* Login */}
        <div className="mt-6 text-center text-sm text-gray-500">

          قبلاً حساب ساخته‌اید؟{" "}

          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            وارد شوید
          </Link>

        </div>

      </div>

    </main>
  );
}
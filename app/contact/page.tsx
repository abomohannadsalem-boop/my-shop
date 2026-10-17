"use client";

import { useState } from "react";

const CONTACT_EMAIL = "mrehsanshop@gmail.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `پیام از فرم تماس سایت Golden Lion - ${name.trim()}`;
    const body = [
      `نام فرستنده: ${name.trim()}`,
      `ایمیل فرستنده: ${senderEmail.trim()}`,
      "",
      "متن پیام:",
      message.trim(),
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold tracking-wide text-blue-700">GOLDEN LION</p>
        <h1 className="mt-2 text-4xl font-bold">تماس با ما</h1>
        <p className="mt-3 text-gray-500">
          برای ارتباط با تیم Golden Lion پیام خود را بنویسید یا مستقیماً به ایمیل ما پیام بدهید.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">اطلاعات تماس</h2>
            <div className="mt-8 space-y-3">
              <p className="text-sm text-gray-500">ایمیل پشتیبانی</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block font-semibold text-blue-700 hover:underline" dir="ltr">
                {CONTACT_EMAIL}
              </a>
              <p className="pt-3 text-sm leading-7 text-gray-500">
                با انتخاب ایمیل، برنامه‌ی ایمیل دستگاه شما باز می‌شود و می‌توانید پیام خود را برای ما ارسال کنید.
              </p>
            </div>
          </section>

          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">ارسال پیام</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">نام</label>
                <input id="contact-name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="نام شما" required maxLength={120} className={inputClass} />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">ایمیل شما</label>
                <input id="contact-email" type="email" autoComplete="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} placeholder="example@email.com" required maxLength={254} className={inputClass} />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">پیام</label>
                <textarea id="contact-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="پیام خود را بنویسید..." required maxLength={5000} className={inputClass} />
              </div>
              <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
                آماده‌کردن ایمیل و ارسال
              </button>
              <p className="text-xs leading-6 text-gray-500">
                با زدن این دکمه، برنامه‌ی ایمیل شما باز می‌شود و آدرس {CONTACT_EMAIL} به‌عنوان گیرنده تنظیم خواهد شد.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

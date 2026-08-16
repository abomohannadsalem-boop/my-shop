export default function ContactPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-bold">
          تماس با ما
        </h1>

        <p className="mt-3 text-gray-500">
          برای ارتباط با ما می‌توانید از اطلاعات زیر استفاده کنید.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">

          {/* Contact information */}
          <div className="rounded-xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">
              اطلاعات تماس
            </h2>

            <div className="mt-8 space-y-6">

              <div>
                <p className="text-sm text-gray-500">
                  تلفن
                </p>
                <p className="mt-1 font-semibold">
                  ۰۲۱-۱۲۳۴۵۶۷۸
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  ایمیل
                </p>
                <p className="mt-1 font-semibold">
                  info@example.com
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  آدرس
                </p>
                <p className="mt-1 font-semibold">
                  تهران، خیابان نمونه، پلاک ۱۲
                </p>
              </div>

            </div>

          </div>

          {/* Contact form */}
          <div className="rounded-xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">
              ارسال پیام
            </h2>

            <form className="mt-8 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  نام
                </label>

                <input
                  type="text"
                  placeholder="نام شما"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  ایمیل
                </label>

                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  پیام
                </label>

                <textarea
                  rows={5}
                  placeholder="پیام خود را بنویسید..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                ارسال پیام
              </button>

            </form>

          </div>

        </div>

      </div>
    </main>
  );
}
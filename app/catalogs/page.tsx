export default function CatalogsPage() {
  const catalogs = [
    {
      name: "کاتالوگ محصولات ۱۴۰۵",
      description: "معرفی محصولات و مشخصات فنی",
      size: "12 MB",
    },
    {
      name: "کاتالوگ فنی",
      description: "اطلاعات فنی و دیتاشیت محصولات",
      size: "8 MB",
    },
    {
      name: "راهنمای محصولات",
      description: "راهنمای استفاده و نصب محصولات",
      size: "6 MB",
    },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-4xl font-bold">
          کاتالوگ‌ها
        </h1>

        <p className="mt-3 text-gray-500">
          کاتالوگ‌ها و فایل‌های PDF محصولات را مشاهده یا دانلود کنید.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {catalogs.map((catalog) => (
            <div
              key={catalog.name}
              className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-48 items-center justify-center rounded-lg bg-red-50 text-7xl">
                📕
              </div>

              <h2 className="mt-6 text-xl font-bold">
                {catalog.name}
              </h2>

              <p className="mt-2 text-gray-500">
                {catalog.description}
              </p>

              <p className="mt-3 text-sm text-gray-400">
                حجم فایل: {catalog.size}
              </p>

              <div className="mt-6 flex gap-3">

                <button className="flex-1 rounded-lg border border-gray-300 py-2 hover:bg-gray-100">
                  مشاهده
                </button>

                <button className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
                  دانلود PDF
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}
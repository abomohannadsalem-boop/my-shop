import Link from "next/link";

export default function Home() {
  return (
    <div>

      {/* Hero */}
      <section className="bg-blue-700 text-white">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <h1 className="text-4xl font-bold md:text-6xl">
            به فروشگاه ما خوش آمدید
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            محصولات، کاتالوگ‌ها و محتوای آموزشی مورد نیاز خود را اینجا پیدا کنید.
          </p>

          <div className="mt-8 flex justify-center gap-4">

            <Link
              href="/products"
              className="rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 transition hover:bg-gray-100"
            >
              مشاهده محصولات
            </Link>

            <Link
              href="/catalogs"
              className="rounded-lg border border-white px-7 py-3 font-semibold transition hover:bg-blue-600"
            >
              کاتالوگ‌ها
            </Link>

          </div>

        </div>

      </section>


      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <h2 className="text-center text-3xl font-bold">
          محصولات
        </h2>

        <p className="mt-3 text-center text-gray-500">
          جدیدترین محصولات فروشگاه
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {[
            "محصول شماره ۱",
            "محصول شماره ۲",
            "محصول شماره ۳",
            "محصول شماره ۴",
          ].map((product) => (

            <div
              key={product}
              className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="mb-5 flex h-40 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                تصویر محصول
              </div>

              <h3 className="text-lg font-bold">
                {product}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                توضیح کوتاه درباره محصول
              </p>

              <Link
                href="/products"
                className="mt-5 block w-full rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
              >
                مشاهده محصولات
              </Link>

            </div>

          ))}

        </div>

      </section>


      {/* Catalogs */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-6">

          <h2 className="text-center text-3xl font-bold">
            کاتالوگ‌ها
          </h2>

          <p className="mt-3 text-center text-gray-500">
            کاتالوگ‌ها و فایل‌های فنی محصولات
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {[
              "کاتالوگ محصولات",
              "راهنمای محصولات",
              "کاتالوگ فنی",
            ].map((catalog) => (

              <div
                key={catalog}
                className="rounded-xl border bg-gray-50 p-6"
              >

                <div className="text-5xl">
                  📕
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {catalog}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  مشاهده اطلاعات و مشخصات فنی
                </p>

                <Link
                  href="/catalogs"
                  className="mt-5 inline-block rounded-lg bg-gray-900 px-5 py-2 text-white transition hover:bg-gray-800"
                >
                  مشاهده کاتالوگ‌ها
                </Link>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* Videos */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <h2 className="text-center text-3xl font-bold">
          ویدیوهای آموزشی
        </h2>

        <p className="mt-3 text-center text-gray-500">
          آموزش‌های تخصصی و کاربردی
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {[
            "آموزش اول",
            "آموزش دوم",
            "آموزش سوم",
          ].map((video) => (

            <div
              key={video}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-48 items-center justify-center bg-gray-800 text-5xl text-white">
                ▶
              </div>

              <div className="p-5">

                <h3 className="text-lg font-bold">
                  {video}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  توضیح کوتاهی درباره این ویدیو
                </p>

                <Link
                  href="/videos"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                >
                  مشاهده ویدیو
                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}
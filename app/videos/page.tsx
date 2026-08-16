import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function VideosPage() {
  const supabase = await createClient();

  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 px-6 py-12"
      >
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-600">
            خطا در دریافت ویدیوها
          </h1>

          <p className="mt-4 text-gray-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="text-center">

          <h1 className="text-4xl font-bold md:text-5xl">
            ویدیوهای آموزشی
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            ویدیوهای آموزشی رایگان و تخصصی را مشاهده کنید.
          </p>

        </div>


        {/* Videos */}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {videos?.map((video) => (

            <div
              key={video.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Thumbnail */}

              <div className="relative flex h-52 items-center justify-center bg-gray-800">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-gray-800 shadow-xl">
                  ▶
                </div>

                {/* Duration */}

                <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1 text-sm text-white">
                  {video.duration}
                </span>

                {/* Free */}

                {video.is_free && (
                  <span className="absolute right-3 top-3 rounded-lg bg-green-600 px-3 py-1 text-sm font-bold text-white">
                    رایگان
                  </span>
                )}

                {/* Premium */}

                {!video.is_free && (
                  <span className="absolute right-3 top-3 rounded-lg bg-yellow-500 px-3 py-1 text-sm font-bold text-white">
                    🔒 ویژه
                  </span>
                )}

              </div>


              {/* Information */}

              <div className="p-6">

                <h2 className="text-xl font-bold">
                  {video.title}
                </h2>

                <p className="mt-3 min-h-[48px] text-sm leading-7 text-gray-500">
                  {video.description}
                </p>


                {/* Price */}

                {!video.is_free && (
                  <p className="mt-4 text-lg font-bold text-blue-600">
                    {Number(video.price).toLocaleString("fa-IR")} تومان
                  </p>
                )}

                {video.is_free && (
                  <p className="mt-4 text-lg font-bold text-green-600">
                    رایگان
                  </p>
                )}


                {/* Button */}

                <Link
                  href={`/videos/${video.id}`}
                  className={`mt-5 block w-full rounded-xl py-3 text-center font-semibold text-white transition ${
                    video.is_free
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {video.is_free
                    ? "▶ مشاهده ویدیو"
                    : "🔒 مشاهده / خرید"}
                </Link>

              </div>

            </div>

          ))}

        </div>


        {/* Back */}

        <div className="mt-12 text-center">

          <Link
            href="/account"
            className="inline-block rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            👤 بازگشت به پنل کاربری
          </Link>

        </div>

      </div>
    </main>
  );
}
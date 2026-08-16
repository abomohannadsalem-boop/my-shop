import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VideoPage({ params }: Props) {
  const { id } = await params;

  const videoId = Number(id);

  if (!Number.isInteger(videoId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();
  
  const { data: video, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", videoId)
    .single();

    let hasAccess = false;

if (video.is_free) {
  hasAccess = true;
}

if (!video.is_free && user) {

  const { data: access } = await supabase
    .from("user_videos")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", video.id)
    .single();

  if (access) {
    hasAccess = true;
  }
}

  if (error || !video) {
    notFound();
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900"
    >
      <div className="mx-auto max-w-5xl">

        {/* =========================
            Back
        ========================= */}

        <Link
          href="/videos"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← بازگشت به ویدیوها
        </Link>


        {/* =========================
            Title
        ========================= */}

        <div className="mt-6">

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-4xl font-bold">
              {video.title}
            </h1>

            {video.is_free ? (
              <span className="rounded-lg bg-green-600 px-3 py-1 text-sm font-bold text-white">
                رایگان
              </span>
            ) : (
              <span className="rounded-lg bg-yellow-500 px-3 py-1 text-sm font-bold text-white">
                🔒 ویژه
              </span>
            )}

          </div>

          <p className="mt-4 leading-8 text-gray-500">
            {video.description}
          </p>

        </div>


        {/* =========================
            Video / Locked
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-2xl bg-black shadow-xl">

          {hasAccess ? (

            <video
              controls
              preload="metadata"
              className="aspect-video w-full"
            >
              <source
                src={video.video_url}
                type="video/mp4"
              />

              مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
            </video>

          ) : (

            <div className="flex aspect-video flex-col items-center justify-center bg-gray-900 px-6 text-center text-white">

              <div className="text-7xl">
                🔒
              </div>

              <h2 className="mt-6 text-3xl font-bold">
                این ویدیو ویژه است
              </h2>

              <p className="mt-4 max-w-xl leading-8 text-gray-300">
                برای مشاهده این ویدیو ابتدا باید آن را خریداری کنید.
              </p>

              <p className="mt-5 text-2xl font-bold text-yellow-400">
                {Number(video.price).toLocaleString("fa-IR")} تومان
              </p>

              <form
                action={`/videos/${video.id}/buy`}
                method="POST"
                className="mt-6"
              >
                <button
                  type="submit"
                  className="rounded-xl bg-yellow-500 px-10 py-3 font-bold text-white transition hover:bg-yellow-600"
                >
                  🛒 خرید آزمایشی
                </button>
              </form>
            </div>

          )}

        </div>


        {/* =========================
            Video Information
        ========================= */}

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold">
            درباره این ویدیو
          </h2>

          <p className="mt-4 leading-8 text-gray-600">
            {video.description}
          </p>


          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            {/* Duration */}

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                مدت زمان
              </p>

              <p className="mt-2 text-lg font-bold">
                {video.duration}
              </p>

            </div>


            {/* Type */}

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                نوع دسترسی
              </p>

              <p className="mt-2 text-lg font-bold">
                {video.is_free
                  ? "رایگان"
                  : "ویژه"}
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            Navigation
        ========================= */}

        <div className="mt-8 flex flex-wrap gap-4">

          <Link
            href="/videos"
            className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            🎥 همه ویدیوها
          </Link>

          <Link
            href="/account"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            👤 پنل کاربری
          </Link>

        </div>

      </div>
    </main>
  );
}
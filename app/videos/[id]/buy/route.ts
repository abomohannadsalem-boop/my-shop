import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const videoId = Number(id);

  if (!Number.isInteger(videoId)) {
    return NextResponse.json(
      { error: "شناسه ویدیو نامعتبر است." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // =========================
  // Get user
  // =========================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  // =========================
  // Get video
  // =========================

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, title, price, is_free")
    .eq("id", videoId)
    .single();

  if (videoError || !video) {
    return NextResponse.json(
      { error: "ویدیو پیدا نشد." },
      { status: 404 }
    );
  }

  // =========================
  // Free video
  // =========================

  if (video.is_free) {
    return NextResponse.json({
      success: true,
      message: "این ویدیو رایگان است.",
    });
  }

  // =========================
  // Check previous access
  // =========================

  const { data: existingAccess } = await supabase
    .from("user_videos")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", video.id)
    .maybeSingle();

  if (existingAccess) {
    return NextResponse.json({
      success: true,
      alreadyOwned: true,
      message: "شما قبلاً این ویدیو را خریداری کرده‌اید.",
    });
  }

  // =========================
  // TEST PURCHASE
  // =========================

  const { error: accessError } = await supabase
    .from("user_videos")
    .insert({
      user_id: user.id,
      video_id: video.id,
    });

  if (accessError) {
    return NextResponse.json(
      {
        error: "ثبت خرید انجام نشد.",
        details: accessError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "خرید آزمایشی با موفقیت انجام شد.",
  });
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCrossOriginWrite, isBodyTooLarge, requestRateLimit } from "@/lib/request-guard";
import { cleanIranianMobileInput, isPhoneAliasEmail, isValidIranianMobile } from "@/lib/iran-phone";

// Admin-only customer management (edit profile / email / password, delete account).
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "mrehsanshop@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fail = (error: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

async function guard(request: Request) {
  if (isCrossOriginWrite(request)) return { error: fail("درخواست نامعتبر است.", 403) };
  if (isBodyTooLarge(request, 16 * 1024)) return { error: fail("درخواست بزرگ است.", 413) };
  const rate = requestRateLimit(request, "admin-customers", 60, 60_000);
  if (!rate.allowed) return { error: fail("تعداد درخواست‌ها زیاد است.", 429) };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== ADMIN_EMAIL) return { error: fail("دسترسی ندارید.", 403) };
  const admin = createAdminClient();
  if (!admin) return { error: fail("کلید SUPABASE_SERVICE_ROLE_KEY روی سرور تنظیم نشده است (فایل .env.local / Environment در Render).", 500) };
  return { admin, adminUserId: user.id };
}

export async function PATCH(request: Request) {
  const g = await guard(request);
  if ("error" in g) return g.error;
  const { admin } = g;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("فرمت درخواست نامعتبر است.", 400); }
  const userId = String(body.user_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return fail("شناسه مشتری نامعتبر است.", 400);

  const fullName = String(body.full_name ?? "").trim().slice(0, 150);
  const phone = cleanIranianMobileInput(String(body.phone ?? ""));
  const nationalId = String(body.national_id ?? "").replace(/\D/g, "");
  const postalCode = String(body.postal_code ?? "").replace(/\D/g, "");
  const dob = String(body.date_of_birth ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!fullName) return fail("نام را وارد کن.", 400);
  if (phone && !isValidIranianMobile(phone)) return fail("شماره موبایل باید ۱۱ رقم و شروع با ۰۹ باشد.", 400);
  if (nationalId && nationalId.length !== 10) return fail("کد ملی باید ۱۰ رقم باشد.", 400);
  if (postalCode && postalCode.length !== 10) return fail("کد پستی باید ۱۰ رقم باشد.", 400);
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return fail("تاریخ تولد نامعتبر است.", 400);
  if (email && !EMAIL_PATTERN.test(email)) return fail("ایمیل نامعتبر است.", 400);
  if (password && password.length < 6) return fail("رمز جدید باید حداقل ۶ کاراکتر باشد.", 400);

  const { data: current, error: getError } = await admin.auth.admin.getUserById(userId);
  if (getError || !current?.user) return fail("مشتری پیدا نشد.", 404);

  // Email / password live in Supabase Auth. Emails set by the admin count as confirmed.
  const currentEmail = (current.user.email ?? "").toLowerCase();
  const authUpdate: { email?: string; email_confirm?: boolean; password?: string } = {};
  if (email && email !== currentEmail) { authUpdate.email = email; authUpdate.email_confirm = true; }
  if (password) authUpdate.password = password;
  if (Object.keys(authUpdate).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(userId, authUpdate);
    if (error) return fail(error.message.toLowerCase().includes("already") ? "این ایمیل برای حساب دیگری ثبت شده است." : `تغییر ایمیل/رمز انجام نشد: ${error.message}`, 400);
  }

  const { error: profileError } = await admin.from("customer_profiles").update({
    full_name: fullName,
    phone: phone || null,
    national_id: nationalId || null,
    postal_code: postalCode || null,
    date_of_birth: dob || null,
  }).eq("user_id", userId);
  if (profileError) {
    if (profileError.code === "23505") return fail(profileError.message.includes("national") ? "این کد ملی برای حساب دیگری ثبت شده است." : "این شماره برای حساب دیگری ثبت شده است.", 409);
    console.error("Admin profile update failed", profileError);
    return fail("ذخیره مشخصات انجام نشد.", 500);
  }
  return NextResponse.json({ ok: true, aliasEmail: isPhoneAliasEmail(current.user.email) });
}

export async function DELETE(request: Request) {
  const g = await guard(request);
  if ("error" in g) return g.error;
  const { admin, adminUserId } = g;

  let body: { user_id?: unknown; force?: unknown };
  try { body = await request.json(); } catch { return fail("فرمت درخواست نامعتبر است.", 400); }
  const userId = String(body.user_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return fail("شناسه مشتری نامعتبر است.", 400);
  if (userId === adminUserId) return fail("حساب مدیر را نمی‌شود حذف کرد.", 400);

  // Warn when the customer has orders: deleting the account may remove or block them.
  if (body.force !== true) {
    const { count } = await admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if ((count ?? 0) > 0) return fail("این مشتری سفارش ثبت‌شده دارد.", 409, { orders: count });
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return fail(`حذف انجام نشد: ${error.message}`, 500);
  return NextResponse.json({ ok: true });
}

/** Phone input helpers for Iranian mobile numbers. Keep the UI local (09xxxxxxxxx)
 * and convert to E.164 only when calling Supabase Auth.
 */
export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function cleanIranianMobileInput(value: string): string {
  return toAsciiDigits(value).replace(/\D/g, "").slice(0, 11);
}

export function isValidIranianMobile(value: string): boolean {
  return /^09\d{9}$/.test(cleanIranianMobileInput(value));
}

/**
 * Phone-only customer accounts use a deterministic internal identity for Supabase Email/Password Auth.
 * The user enters only their phone number and password; no SMS is sent. This address is an Auth
 * identifier only, not a mailbox. Keep the hostname aligned with the deployed app, and keep
 * Supabase Email confirmations disabled so Auth never tries to send a confirmation to this alias.
 */
const PHONE_LOGIN_EMAIL_DOMAIN = "my-shop-t7oh.onrender.com";

export function toPhoneLoginEmail(value: string): string | null {
  const localPhone = cleanIranianMobileInput(value);
  if (!isValidIranianMobile(localPhone)) return null;
  return `phone-${localPhone}@${PHONE_LOGIN_EMAIL_DOMAIN}`;
}

/** Kept for legacy phone-auth accounts only. New accounts use toPhoneLoginEmail(). */
export function toSupabasePhone(value: string): string | null {
  const localPhone = cleanIranianMobileInput(value);
  if (!isValidIranianMobile(localPhone)) return null;
  return `+98${localPhone.slice(1)}`;
}

/** Keep digits only (Persian/Arabic digits converted), optionally capped to `max` characters. */
export function cleanDigits(value: string, max = 20): string {
  return toAsciiDigits(value).replace(/\D/g, "").slice(0, max);
}

export const isTenDigits = (value: string) => /^\d{10}$/.test(cleanDigits(value, 10));

/** Internal alias addresses (old phone-only accounts) are never shown to people as real emails. */
export const isPhoneAliasEmail = (email?: string | null) => /^phone-\d+@/i.test(String(email ?? ""));

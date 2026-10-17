export default function VerifiedBadge({ verified, className = "" }: { verified: boolean; className?: string }) {
  return verified ? (
    <span title="اطلاعات و ایمیل این حساب تأیید شده است" className={`inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200 ${className}`}>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" /></svg>
      حساب تأییدشده
    </span>
  ) : (
    <span className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 ${className}`}>تأیید نشده</span>
  );
}

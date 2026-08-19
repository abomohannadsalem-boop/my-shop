export default function SoldOutBadge() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
      <div className="w-[150%] -rotate-45 bg-red-600 py-1.5 text-center text-xs font-bold tracking-widest text-white shadow-md">
        SOLD OUT
      </div>
    </div>
  );
}

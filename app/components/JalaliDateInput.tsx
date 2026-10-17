"use client";

import { useEffect, useState } from "react";
import { JALALI_MONTHS, currentJalaliYear, isoToJalali, jalaliMonthLength, jalaliToIso } from "@/lib/jalali";

type Props = {
  /** Gregorian ISO date (YYYY-MM-DD) or "" */
  value: string;
  onChange: (iso: string) => void;
  className?: string;
};

const toFa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/** Birth-date picker in the Jalali calendar. Emits a Gregorian ISO date (or "" while incomplete). */
export default function JalaliDateInput({ value, onChange, className = "" }: Props) {
  const initial = isoToJalali(value);
  const [jy, setJy] = useState<number | "">(initial?.jy ?? "");
  const [jm, setJm] = useState<number | "">(initial?.jm ?? "");
  const [jd, setJd] = useState<number | "">(initial?.jd ?? "");

  // Re-sync when the parent loads/clears a value (e.g. opening the edit form).
  useEffect(() => {
    const j = isoToJalali(value);
    setJy(j?.jy ?? "");
    setJm(j?.jm ?? "");
    setJd(j?.jd ?? "");
  }, [value]);

  const thisYear = currentJalaliYear();
  const years = Array.from({ length: thisYear - 1300 + 1 }, (_, i) => thisYear - i);
  const maxDay = jy && jm ? jalaliMonthLength(Number(jy), Number(jm)) : 31;

  function emit(y: number | "", m: number | "", d: number | "") {
    if (!y || !m || !d) return onChange("");
    onChange(jalaliToIso(Number(y), Number(m), Number(d)) ?? "");
  }

  const selectClass = `rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${className}`;
  return (
    <div className="grid grid-cols-3 gap-2" dir="rtl">
      <select aria-label="روز تولد" value={jd} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : ""; setJd(v); emit(jy, jm, v); }} className={selectClass}>
        <option value="">روز</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{toFa(d)}</option>)}
      </select>
      <select aria-label="ماه تولد" value={jm} onChange={(e) => {
        const v = e.target.value ? Number(e.target.value) : "";
        setJm(v);
        const limit = jy && v ? jalaliMonthLength(Number(jy), Number(v)) : 31;
        const nextDay = jd && Number(jd) > limit ? limit : jd;
        setJd(nextDay);
        emit(jy, v, nextDay);
      }} className={selectClass}>
        <option value="">ماه</option>
        {JALALI_MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
      </select>
      <select aria-label="سال تولد" value={jy} onChange={(e) => {
        const v = e.target.value ? Number(e.target.value) : "";
        setJy(v);
        const limit = v && jm ? jalaliMonthLength(Number(v), Number(jm)) : 31;
        const nextDay = jd && Number(jd) > limit ? limit : jd;
        setJd(nextDay);
        emit(v, jm, nextDay);
      }} className={selectClass}>
        <option value="">سال</option>
        {years.map((y) => <option key={y} value={y}>{toFa(y)}</option>)}
      </select>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { createInquiry } from "@/app/actions";
import { fmt, type Dictionary } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

type Props = {
  villaId: string;
  pricePerNight: number;
  capacity: number;
  t: Dictionary["booking"];
  labels: { checkIn: string; checkOut: string; guests: string };
  locale: "tr" | "en";
  currency: Currency;
  rate: number;
  defaults: { checkIn?: string; checkOut?: string; guests?: string; name?: string };
};

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : 0;
}

export function BookingForm({ villaId, pricePerNight, capacity, t, labels, locale, currency, rate, defaults }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(defaults.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults.checkOut ?? "");
  const [guests, setGuests] = useState(Math.min(Number(defaults.guests) || 2, capacity));
  const [name, setName] = useState(defaults.name ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState<{ message: string; number: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const nights = nightsBetween(checkIn, checkOut);
  const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nights <= 0) return setError(t.invalidDates);
    if (guests > capacity) return setError(fmt(t.tooManyGuests, { n: capacity }));
    startTransition(async () => {
      const res = await createInquiry({ villaId, checkIn, checkOut, guests, contactName: name, contactPhone: phone });
      if (!res.ok) return setError(res.error);
      // MVP mock: show the WhatsApp message instead of opening res.whatsappUrl.
      setMock({ message: res.message, number: res.whatsappNumber });
    });
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="bk-in">{labels.checkIn}</label>
            <input id="bk-in" type="date" required min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="bk-out">{labels.checkOut}</label>
            <input id="bk-out" type="date" required min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={field} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="bk-guests">{labels.guests}</label>
          <input id="bk-guests" type="number" required min={1} max={capacity} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="bk-name">{t.name}</label>
          <input id="bk-name" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="bk-phone">{t.phone}</label>
          <input id="bk-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" className={field} />
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          {nights > 0 ? (
            <p className="flex justify-between">
              <span>
                {t.estimate} ({fmt(t.nights, { n: nights })})
              </span>
              <strong>{formatMoney(nights * pricePerNight, currency, rate, locale)}</strong>
            </p>
          ) : (
            <p className="text-slate-500">{t.pickDates}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">{t.estimateNote}</p>
        </div>

        {error && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-[#25D366] px-4 py-3 font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? t.sending : t.submit}
        </button>
      </form>

      {mock && (
        <div role="dialog" aria-modal="true" aria-labelledby="wa-mock-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3 text-white">
              <div>
                <p id="wa-mock-title" className="font-semibold">{t.mockTitle}</p>
                <p className="text-xs opacity-80">
                  {t.mockTo}: +{mock.number}
                </p>
              </div>
              <button onClick={() => setMock(null)} className="rounded px-2 py-1 text-sm hover:bg-white/10">
                {t.close}
              </button>
            </div>
            <div className="bg-[#ECE5DD] p-4">
              <div className="ml-auto max-w-[90%] whitespace-pre-wrap break-words rounded-lg rounded-tr-none bg-[#DCF8C6] p-3 text-sm text-slate-900 shadow">
                {mock.message}
              </div>
            </div>
            <p className="p-4 text-xs text-slate-600">{t.mockNote}</p>
          </div>
        </div>
      )}
    </>
  );
}

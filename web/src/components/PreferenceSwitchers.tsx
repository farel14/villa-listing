"use client";

import { setCurrency, setLocale } from "@/app/actions";
import { CURRENCIES, type Currency } from "@/lib/types";

export function LanguageSwitcher({ locale, label }: { locale: "tr" | "en"; label: string }) {
  return (
    <form action={setLocale} className="flex items-center gap-1" aria-label={label}>
      {(["tr", "en"] as const).map((l) => (
        <button
          key={l}
          name="locale"
          value={l}
          aria-pressed={locale === l}
          className={`rounded px-2 py-1 text-xs font-semibold ${
            locale === l ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {l === "tr" ? "Türkçe" : "English"}
        </button>
      ))}
    </form>
  );
}

export function CurrencySwitcher({ currency, label }: { currency: Currency; label: string }) {
  return (
    <form action={setCurrency}>
      <label className="sr-only" htmlFor="currency-select">
        {label}
      </label>
      <select
        id="currency-select"
        name="currency"
        defaultValue={currency}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </form>
  );
}

import Link from "next/link";
import { fmt, type Dictionary } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/format";
import type { Currency, Villa } from "@/lib/types";

type Props = {
  villa: Villa;
  t: Dictionary;
  locale: "tr" | "en";
  currency: Currency;
  rate: number;
  query?: string;
};

export function VillaCard({ villa, t, locale, currency, rate, query }: Props) {
  const region = locale === "en" ? villa.region.nameEn : villa.region.nameTr;
  return (
    <Link
      href={`/villas/${villa.slug}${query ? `?${query}` : ""}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {villa.images[0] && (
          <img
            src={villa.images[0]}
            alt={villa.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="space-y-2 p-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            {villa.name} <span className="text-slate-400">({villa.code})</span>
          </h3>
          <p className="text-sm text-slate-500">
            {region} / {villa.district}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-3 text-xs text-slate-600">
          <li>{fmt(t.villa.guests, { n: villa.capacity })}</li>
          <li>{fmt(t.villa.bedrooms, { n: villa.bedrooms })}</li>
          <li>{fmt(t.villa.bathrooms, { n: villa.bathrooms })}</li>
        </ul>
        <p className="text-sm">
          <span className="text-xs text-slate-500">{t.villa.startingFrom} </span>
          <span className="text-lg font-bold text-teal-800">
            {formatMoney(villa.pricePerNight, currency, rate, locale)}
          </span>
          <span className="text-xs text-slate-500"> {t.villa.perNight}</span>
        </p>
      </div>
    </Link>
  );
}

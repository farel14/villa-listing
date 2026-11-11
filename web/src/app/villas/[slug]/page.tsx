import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { api, ApiError } from "@/lib/api";
import { getMoney } from "@/lib/currency";
import { fmt } from "@/lib/dictionaries";
import { formatDate, formatMoney } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import type { Villa } from "@/lib/types";

export default async function VillaPage(props: PageProps<"/villas/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  let villa: Villa;
  try {
    villa = await api<Villa>(`/villas/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const [{ t, locale }, money, user] = await Promise.all([getI18n(), getMoney(), getCurrentUser()]);
  const region = locale === "en" ? villa.region.nameEn : villa.region.nameTr;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/villas" className="text-sm text-teal-700 hover:underline">← {t.villa.back}</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">
            {villa.name} <span className="text-slate-400">({villa.code})</span>
          </h1>
          <p className="text-slate-600">{region} / {villa.district}</p>
        </div>
        <p>
          <span className="text-sm text-slate-500">{t.villa.startingFrom} </span>
          <span className="text-2xl font-bold text-teal-800">
            {formatMoney(villa.pricePerNight, money.currency, money.rate, locale)}
          </span>
          <span className="text-sm text-slate-500"> {t.villa.perNight}</span>
        </p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {villa.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${villa.name} ${i + 1}`}
            className={`w-full rounded-xl object-cover ${i === 0 ? "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:h-full" : "aspect-[4/3]"}`}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <ul className="flex flex-wrap gap-3 text-sm">
            {[fmt(t.villa.guests, { n: villa.capacity }), fmt(t.villa.bedrooms, { n: villa.bedrooms }), fmt(t.villa.bathrooms, { n: villa.bathrooms })].map((s) => (
              <li key={s} className="rounded-full bg-white px-4 py-2 shadow-sm">{s}</li>
            ))}
          </ul>
          <section>
            <h2 className="mb-2 text-xl font-semibold">{t.villa.description}</h2>
            <p className="leading-relaxed text-slate-700">{locale === "en" ? villa.descriptionEn : villa.descriptionTr}</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold">{t.villa.features}</h2>
            <ul className="flex flex-wrap gap-2">
              {villa.features.map((f) => (
                <li key={f.slug} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm text-teal-800">
                  {locale === "en" ? f.nameEn : f.nameTr}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold">{t.villa.unavailable}</h2>
            {villa.unavailable?.length ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {villa.unavailable.map((u) => (
                  <li key={u.startDate}>
                    {formatDate(u.startDate, locale)} → {formatDate(u.endDate, locale)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{t.villa.unavailableNone}</p>
            )}
          </section>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm
            villaId={villa.id}
            pricePerNight={villa.pricePerNight}
            capacity={villa.capacity}
            t={t.booking}
            labels={{ checkIn: t.search.checkIn, checkOut: t.search.checkOut, guests: t.search.guests }}
            locale={locale}
            currency={money.currency}
            rate={money.rate}
            defaults={{ checkIn: str(sp.checkIn), checkOut: str(sp.checkOut), guests: str(sp.guests), name: user?.name }}
          />
        </div>
      </div>
    </div>
  );
}

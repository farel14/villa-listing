import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { VillaCard } from "@/components/VillaCard";
import { api } from "@/lib/api";
import { getMoney } from "@/lib/currency";
import { getI18n } from "@/lib/i18n";
import type { Named, SearchResult } from "@/lib/types";

export default async function Home() {
  const [{ t, locale }, money, regions, popular] = await Promise.all([
    getI18n(),
    getMoney(),
    api<Named[]>("/regions"),
    api<SearchResult>("/villas?pageSize=6"),
  ]);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-sky-700 px-4 pb-16 pt-14 text-white">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-bold sm:text-5xl">{t.home.heroTitle}</h1>
            <p className="text-teal-50">{t.home.heroSubtitle}</p>
          </div>
          <h2 className="text-lg font-semibold">{t.search.title}</h2>
          <SearchBar t={t} locale={locale} regions={regions} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t.home.popular}</h2>
          <Link href="/villas" className="text-sm font-semibold text-teal-700 hover:underline">
            {t.home.viewAll} →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.items.map((v) => (
            <VillaCard key={v.id} villa={v} t={t} locale={locale} currency={money.currency} rate={money.rate} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="mb-4 text-2xl font-bold">{t.home.regions}</h2>
        <div className="flex flex-wrap gap-3">
          {regions.map((r) => (
            <Link
              key={r.slug}
              href={`/villas?region=${r.slug}`}
              className="rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              {locale === "en" ? r.nameEn : r.nameTr}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

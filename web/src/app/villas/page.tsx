import Link from "next/link";
import { VillaCard } from "@/components/VillaCard";
import { api, ApiError } from "@/lib/api";
import { getMoney } from "@/lib/currency";
import { fmt } from "@/lib/dictionaries";
import { getI18n } from "@/lib/i18n";
import type { Named, SearchResult } from "@/lib/types";

const PAGE_SIZE = 9;

function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() ? s.trim() : undefined;
}
function many(v: string | string[] | undefined): string[] {
  return (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
}

export default async function VillasPage(props: PageProps<"/villas">) {
  const sp = await props.searchParams;
  const [{ t, locale }, money, regions, features] = await Promise.all([
    getI18n(),
    getMoney(),
    api<Named[]>("/regions"),
    api<Named[]>("/features"),
  ]);

  const f = {
    q: one(sp.q),
    region: one(sp.region),
    checkIn: one(sp.checkIn),
    checkOut: one(sp.checkOut),
    guests: one(sp.guests),
    bedrooms: one(sp.bedrooms),
    minPrice: one(sp.minPrice),
    maxPrice: one(sp.maxPrice),
    sort: one(sp.sort),
    page: Math.max(1, Number(one(sp.page)) || 1),
    features: many(sp.feature),
  };

  // Price filters are typed in the visitor's currency; the API stores TRY.
  const toTry = (v: string | undefined, round: (n: number) => number) => {
    const n = Number(v);
    return v && Number.isFinite(n) && n >= 0 ? String(round(n / money.rate)) : undefined;
  };

  const apiQuery = new URLSearchParams();
  const put = (k: string, v: string | undefined) => v && apiQuery.set(k, v);
  put("q", f.q);
  put("region", f.region);
  put("checkIn", f.checkIn);
  put("checkOut", f.checkOut);
  put("guests", f.guests);
  put("bedrooms", f.bedrooms);
  put("minPrice", toTry(f.minPrice, Math.floor));
  put("maxPrice", toTry(f.maxPrice, Math.ceil));
  put("sort", f.sort);
  put("features", f.features.join(",") || undefined);
  apiQuery.set("page", String(f.page));
  apiQuery.set("pageSize", String(PAGE_SIZE));

  let result: SearchResult | null = null;
  let error: string | null = null;
  try {
    result = await api<SearchResult>(`/villas?${apiQuery}`);
  } catch (e) {
    error = e instanceof ApiError && e.status === 400 ? e.message : t.errors.generic;
  }

  // Carry dates/guests to the detail page to prefill the booking form.
  const carry = new URLSearchParams();
  if (f.checkIn) carry.set("checkIn", f.checkIn);
  if (f.checkOut) carry.set("checkOut", f.checkOut);
  if (f.guests) carry.set("guests", f.guests);

  const pageHref = (page: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const x of many(v)) q.append(k, x);
    q.set("page", String(page));
    return `/villas?${q}`;
  };
  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <form action="/villas" method="get" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <label className={label} htmlFor="f-q">{t.search.keyword}</label>
            <input id="f-q" name="q" defaultValue={f.q} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="f-region">{t.search.region}</label>
            <select id="f-region" name="region" defaultValue={f.region ?? ""} className={field}>
              <option value="">{t.search.anyRegion}</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>{locale === "en" ? r.nameEn : r.nameTr}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label} htmlFor="f-in">{t.search.checkIn}</label>
              <input id="f-in" type="date" name="checkIn" min={today} defaultValue={f.checkIn} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="f-out">{t.search.checkOut}</label>
              <input id="f-out" type="date" name="checkOut" min={today} defaultValue={f.checkOut} className={field} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label} htmlFor="f-guests">{t.search.guests}</label>
              <input id="f-guests" type="number" min={1} max={50} name="guests" defaultValue={f.guests} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="f-bed">{t.search.bedrooms}</label>
              <select id="f-bed" name="bedrooms" defaultValue={f.bedrooms ?? ""} className={field}>
                <option value="">{t.search.any}</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label} htmlFor="f-min">{t.search.minPrice}</label>
              <input id="f-min" type="number" min={0} name="minPrice" defaultValue={f.minPrice} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="f-max">{t.search.maxPrice}</label>
              <input id="f-max" type="number" min={0} name="maxPrice" defaultValue={f.maxPrice} className={field} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-500">{fmt(t.search.priceIn, { currency: money.currency })}</p>
          <fieldset>
            <legend className={label}>{t.search.features}</legend>
            <div className="space-y-1">
              {features.map((ft) => (
                <label key={ft.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="feature" value={ft.slug} defaultChecked={f.features.includes(ft.slug)} />
                  {locale === "en" ? ft.nameEn : ft.nameTr}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className={label} htmlFor="f-sort">{t.search.sort}</label>
            <select id="f-sort" name="sort" defaultValue={f.sort ?? "recommended"} className={field}>
              <option value="recommended">{t.search.sortRecommended}</option>
              <option value="price_asc">{t.search.sortPriceAsc}</option>
              <option value="price_desc">{t.search.sortPriceDesc}</option>
              <option value="newest">{t.search.sortNewest}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
              {t.search.apply}
            </button>
            <Link href="/villas" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
              {t.search.clear}
            </Link>
          </div>
        </form>
      </aside>

      <section>
        {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {result && (
          <>
            <p className="mb-4 text-sm text-slate-600">{fmt(t.search.results, { n: result.total })}</p>
            {result.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                {t.search.noResults}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((v) => (
                  <VillaCard
                    key={v.id}
                    villa={v}
                    t={t}
                    locale={locale}
                    currency={money.currency}
                    rate={money.rate}
                    query={carry.toString()}
                  />
                ))}
              </div>
            )}
            {pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
                {f.page > 1 && <Link className="rounded border px-3 py-1 hover:bg-white" href={pageHref(f.page - 1)}>{t.search.prev}</Link>}
                <span>{fmt(t.search.page, { page: f.page, pages })}</span>
                {f.page < pages && <Link className="rounded border px-3 py-1 hover:bg-white" href={pageHref(f.page + 1)}>{t.search.next}</Link>}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

import type { Dictionary } from "@/lib/dictionaries";
import type { Named } from "@/lib/types";

type Props = {
  t: Dictionary;
  locale: "tr" | "en";
  regions: Named[];
  values?: { region?: string; checkIn?: string; checkOut?: string; guests?: string };
};

/** Plain GET form to /villas — works without client-side JavaScript. */
export function SearchBar({ t, locale, regions, values = {} }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
  return (
    <form action="/villas" method="get" className="grid gap-3 rounded-2xl bg-white p-4 shadow-lg sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label className={label} htmlFor="sb-region">{t.search.region}</label>
        <select id="sb-region" name="region" defaultValue={values.region ?? ""} className={field}>
          <option value="">{t.search.anyRegion}</option>
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>
              {locale === "en" ? r.nameEn : r.nameTr}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="sb-in">{t.search.checkIn}</label>
        <input id="sb-in" type="date" name="checkIn" min={today} defaultValue={values.checkIn} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="sb-out">{t.search.checkOut}</label>
        <input id="sb-out" type="date" name="checkOut" min={today} defaultValue={values.checkOut} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="sb-guests">{t.search.guests}</label>
        <input id="sb-guests" type="number" name="guests" min={1} max={50} defaultValue={values.guests ?? "2"} className={field} />
      </div>
      <button className="self-end rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
        {t.search.submit}
      </button>
    </form>
  );
}

import { getMoney } from "@/lib/currency";
import { fmt } from "@/lib/dictionaries";
import { formatDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n";

export async function Footer() {
  const [{ t, locale }, { rates }] = await Promise.all([getI18n(), getMoney()]);
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-xs text-slate-500">
        <p>{t.footer.demo}</p>
        {rates && (
          <p>
            {rates.fallback
              ? t.footer.ratesFallback
              : fmt(t.footer.rates, { source: rates.source, date: formatDate(rates.updatedAt, locale) })}
          </p>
        )}
      </div>
    </footer>
  );
}

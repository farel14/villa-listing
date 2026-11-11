import Link from "next/link";
import { api } from "@/lib/api";
import { fmt } from "@/lib/dictionaries";
import { formatDate, formatMoney } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { getToken, requireUser } from "@/lib/session";
import type { Inquiry } from "@/lib/types";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [{ t, locale }, token] = await Promise.all([getI18n(), getToken()]);
  const inquiries = await api<Inquiry[]>("/inquiries/mine", { token });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-slate-600">{fmt(t.account.hello, { name: user.name })}</p>
      <h1 className="mb-6 text-2xl font-bold">{t.account.title}</h1>
      {inquiries.length === 0 ? (
        <p className="text-slate-500">{t.account.empty}</p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <Link href={`/villas/${i.villa.slug}`} className="font-semibold hover:underline">
                  {i.villa.name} ({i.villa.code})
                </Link>
                <p className="text-sm text-slate-600">
                  {formatDate(i.checkIn, locale)} → {formatDate(i.checkOut, locale)} · {fmt(t.booking.nights, { n: i.nights })} ·{" "}
                  {fmt(t.villa.guests, { n: i.guests })} · {formatMoney(i.totalPrice, "TRY", 1, locale)}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{t.status[i.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

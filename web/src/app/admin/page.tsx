import { setVillaActive, updateInquiryStatus } from "@/app/actions";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import { getToken, requireUser } from "@/lib/session";
import { INQUIRY_STATUSES, type Inquiry, type Villa } from "@/lib/types";

export default async function AdminPage() {
  const user = await requireUser("/admin");
  const { t, locale } = await getI18n();
  if (user.role !== "ADMIN") {
    return <p className="mx-auto max-w-4xl px-4 py-10 text-red-700">403 — {t.admin.title}</p>;
  }
  const token = await getToken();
  const [inquiries, villas] = await Promise.all([
    api<Inquiry[]>("/admin/inquiries", { token }),
    api<Villa[]>("/admin/villas", { token }),
  ]);
  const th = "px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500";
  const td = "px-3 py-2 align-top";

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <h1 className="text-2xl font-bold">{t.admin.title}</h1>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t.admin.inquiries}</h2>
        {inquiries.length === 0 ? (
          <p className="text-slate-500">{t.admin.noInquiries}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>{t.admin.villa}</th>
                  <th className={th}>{t.admin.dates}</th>
                  <th className={th}>{t.admin.guest}</th>
                  <th className={th}>{t.admin.total}</th>
                  <th className={th}>{t.admin.contact}</th>
                  <th className={th}>{t.admin.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((i) => (
                  <tr key={i.id}>
                    <td className={td}>{i.villa.name} ({i.villa.code})</td>
                    <td className={td}>{formatDate(i.checkIn, locale)} → {formatDate(i.checkOut, locale)}</td>
                    <td className={td}>{i.guests}</td>
                    <td className={td}>{formatMoney(i.totalPrice, "TRY", 1, locale)}</td>
                    <td className={td}>
                      {i.contactName}
                      {i.contactPhone && <div className="text-xs text-slate-500">{i.contactPhone}</div>}
                      {i.user && <div className="text-xs text-slate-500">{i.user.email}</div>}
                    </td>
                    <td className={td}>
                      <form action={updateInquiryStatus} className="flex gap-2">
                        <input type="hidden" name="id" value={i.id} />
                        <select name="status" defaultValue={i.status} className="rounded border border-slate-300 px-2 py-1 text-xs">
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>{t.status[s]}</option>
                          ))}
                        </select>
                        <button className="rounded bg-slate-800 px-2 py-1 text-xs text-white">{t.admin.update}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t.admin.villas}</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>{t.admin.villa}</th>
                <th className={th}>{t.search.region}</th>
                <th className={th}>{t.admin.price}</th>
                <th className={th}>{t.admin.status}</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villas.map((v) => (
                <tr key={v.id}>
                  <td className={td}>{v.name} ({v.code})</td>
                  <td className={td}>{locale === "en" ? v.region.nameEn : v.region.nameTr} / {v.district}</td>
                  <td className={td}>{v.pricePerNight.toLocaleString("tr-TR")}</td>
                  <td className={td}>{v.isActive ? t.admin.active : t.admin.inactive}</td>
                  <td className={td}>
                    <form action={setVillaActive}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="isActive" value={String(!v.isActive)} />
                      <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                        {v.isActive ? t.admin.deactivate : t.admin.activate}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

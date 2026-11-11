import Link from "next/link";
import { logout } from "@/app/actions";
import { getMoney } from "@/lib/currency";
import { getI18n } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { CurrencySwitcher, LanguageSwitcher } from "./PreferenceSwitchers";

export async function Header() {
  const [{ t, locale }, user, { currency }] = await Promise.all([getI18n(), getCurrentUser(), getMoney()]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-teal-800">
          {t.brand}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/villas" className="hover:text-teal-700">
            {t.nav.villas}
          </Link>
          {user && (
            <Link href="/account" className="hover:text-teal-700">
              {t.nav.account}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-teal-700">
              {t.nav.admin}
            </Link>
          )}
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <LanguageSwitcher locale={locale} label={t.nav.language} />
          <CurrencySwitcher key={currency} currency={currency} label={t.nav.currency} />
          {user ? (
            <form action={logout} className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
              <button className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50">
                {t.nav.logout}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link href="/login" className="rounded px-3 py-1 hover:bg-slate-100">
                {t.nav.login}
              </Link>
              <Link href="/register" className="rounded bg-teal-700 px-3 py-1 text-white hover:bg-teal-800">
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

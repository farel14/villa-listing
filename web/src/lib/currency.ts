import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { api } from "./api";
import { CURRENCIES, type Currency, type Rates } from "./types";

export const CURRENCY_COOKIE = "currency";

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

export const getCurrency = cache(async (): Promise<Currency> => {
  const v = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return isCurrency(v) ? v : "TRY";
});

export const getRates = cache(async (): Promise<Rates | null> => {
  try {
    return await api<Rates>("/currency/rates", { revalidate: 600 });
  } catch {
    return null;
  }
});

/** Everything a component needs to show TRY prices in the visitor's currency. */
export async function getMoney() {
  const [selected, rates] = await Promise.all([getCurrency(), getRates()]);
  // Without a rate for the chosen currency, fall back to TRY rather than show wrong numbers.
  const rate = selected === "TRY" ? 1 : rates?.rates[selected];
  const currency: Currency = rate ? selected : "TRY";
  return { currency, rate: rate ?? 1, rates };
}

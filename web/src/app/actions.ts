"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { CURRENCY_COOKIE, isCurrency } from "@/lib/currency";
import { fmt } from "@/lib/dictionaries";
import { getI18n, isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import { getCurrentUser, getToken, safeNext, TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/session";
import { INQUIRY_STATUSES, type InquiryStatus, type User } from "@/lib/types";

const YEAR = 60 * 60 * 24 * 365;

// ---------- preferences ----------

export async function setLocale(formData: FormData) {
  const locale = formData.get("locale");
  if (isLocale(locale)) {
    (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR, sameSite: "lax" });
  }
}

export async function setCurrency(formData: FormData) {
  const currency = formData.get("currency");
  if (isCurrency(currency)) {
    (await cookies()).set(CURRENCY_COOKIE, currency, { path: "/", maxAge: YEAR, sameSite: "lax" });
  }
}

// ---------- auth ----------

export type FormState = { error?: string; email?: string; name?: string } | undefined;

async function startSession(accessToken: string) {
  (await cookies()).set(TOKEN_COOKIE, accessToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
  });
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n();
  const keep = { email: String(formData.get("email") ?? "") };
  try {
    const res = await api<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
    });
    await startSession(res.accessToken);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 400)) return { ...keep, error: t.auth.invalid };
    return { ...keep, error: e instanceof ApiError && e.status === 503 ? t.errors.apiDown : t.errors.generic };
  }
  redirect(safeNext(formData.get("next")));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n();
  const keep = { email: String(formData.get("email") ?? ""), name: String(formData.get("name") ?? "") };
  try {
    const res = await api<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
    });
    await startSession(res.accessToken);
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return { ...keep, error: t.auth.emailTaken };
    if (e instanceof ApiError && e.status === 400) return { ...keep, error: e.message };
    return { ...keep, error: e instanceof ApiError && e.status === 503 ? t.errors.apiDown : t.errors.generic };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  // JWTs are stateless: logging out removes the token from this browser.
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}

// ---------- booking via WhatsApp ----------

export type InquiryInput = {
  villaId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  contactName: string;
  contactPhone?: string;
};

export type InquiryResult =
  | { ok: true; message: string; whatsappNumber: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  const { t, locale } = await getI18n();
  const token = await getToken();
  try {
    const res = await api<{ message: string; whatsappNumber: string; whatsappUrl: string }>("/inquiries", {
      method: "POST",
      token,
      body: { ...input, contactPhone: input.contactPhone?.trim() || undefined, locale },
    });
    return { ok: true, message: res.message, whatsappNumber: res.whatsappNumber, whatsappUrl: res.whatsappUrl };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 409) return { ok: false, error: t.booking.unavailable };
      if (e.status === 400) {
        const m = /at most (\d+) guests/.exec(e.message);
        if (m) return { ok: false, error: fmt(t.booking.tooManyGuests, { n: m[1] }) };
        return { ok: false, error: e.message };
      }
      if (e.status === 503) return { ok: false, error: t.errors.apiDown };
    }
    return { ok: false, error: t.errors.generic };
  }
}

// ---------- admin ----------

async function adminToken(): Promise<string> {
  const user = await getCurrentUser();
  const token = await getToken();
  if (!user || user.role !== "ADMIN" || !token) redirect("/login?next=/admin");
  return token;
}

export async function updateInquiryStatus(formData: FormData) {
  const token = await adminToken();
  const status = formData.get("status") as InquiryStatus;
  if (!INQUIRY_STATUSES.includes(status)) return;
  await api(`/admin/inquiries/${String(formData.get("id"))}`, { method: "PATCH", token, body: { status } });
  revalidatePath("/admin");
}

export async function setVillaActive(formData: FormData) {
  const token = await adminToken();
  await api(`/villas/${String(formData.get("id"))}`, {
    method: "PATCH",
    token,
    body: { isActive: formData.get("isActive") === "true" },
  });
  revalidatePath("/admin");
}

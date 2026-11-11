"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/app/actions";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { mode: "login" | "register"; t: Dictionary["auth"]; next: string };

export function AuthForm({ mode, t, next }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  const field = "w-full rounded-lg border border-slate-300 px-3 py-2";
  const q = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{mode === "login" ? t.loginTitle : t.registerTitle}</h1>
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <label className="block text-sm">
          {t.name}
          <input name="name" defaultValue={state?.name} key={`n-${state?.name}`} required minLength={2} maxLength={80} autoComplete="name" className={field} />
        </label>
      )}
      <label className="block text-sm">
        {t.email}
        <input name="email" type="email" defaultValue={state?.email} key={`e-${state?.email}`} required autoComplete="email" className={field} />
      </label>
      <label className="block text-sm">
        {t.password}
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={field}
        />
        {mode === "register" && <span className="text-xs text-slate-500">{t.passwordHint}</span>}
      </label>
      {state?.error && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p>
      )}
      <button disabled={pending} className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
        {mode === "login" ? t.submitLogin : t.submitRegister}
      </button>
      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? t.noAccount : t.haveAccount}{" "}
        <Link href={`${mode === "login" ? "/register" : "/login"}${q}`} className="font-semibold text-teal-700 hover:underline">
          {mode === "login" ? t.submitRegister : t.submitLogin}
        </Link>
      </p>
    </form>
  );
}

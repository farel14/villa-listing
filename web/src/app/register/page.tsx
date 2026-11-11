import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getI18n } from "@/lib/i18n";
import { getCurrentUser, safeNext } from "@/lib/session";

export default async function RegisterPage(props: PageProps<"/register">) {
  const sp = await props.searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <AuthForm mode="register" t={t.auth} next={next} />
    </div>
  );
}

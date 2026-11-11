import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <Link href="/villas" className="mt-4 inline-block text-teal-700 hover:underline">← /villas</Link>
    </div>
  );
}

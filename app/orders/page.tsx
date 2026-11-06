import Link from "next/link";
import { getComponent, getPack } from "@/lib/catalog";
import { canDeliver } from "@/lib/server/files";
import { orderComponents, orderFromLink } from "@/lib/server/orders";
import ResendForm from "./ResendForm";

export const dynamic = "force-dynamic";

export default async function Orders({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";
  const found = token ? await orderFromLink(token).catch(() => null) : null;

  if (!found)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Your downloads</h1>
        <p className="mt-4 text-ink-soft">{token ? "This download link has expired. " : ""}Enter the email address you paid with and we&apos;ll email you a new download link. It works for 7 days.</p>
        <ResendForm />
      </div>
    );

  const { order, expires_at } = found;
  const slugs = orderComponents(order);
  const q = (slug: string, file: string) => `/api/orders/download?token=${encodeURIComponent(token)}&slug=${encodeURIComponent(slug)}&file=${file}`;
  const packs = order.items.filter((i) => i.kind === "pack").map((i) => getPack(i.slug)?.name ?? i.slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Your downloads</h1>
      <p className="mt-3 text-ink-soft">
        Order for {order.email}{packs.length ? `, including ${packs.join(", ")}` : ""}. This link works until{" "}
        {new Date(expires_at).toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" })}.
      </p>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
        {slugs.map((slug) => {
          const c = getComponent(slug);
          const ready = canDeliver(slug);
          return (
            <li key={slug} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">{c?.name ?? slug}</p>
                <p className="text-xs text-ink-soft">{ready ? "Managed solution and PDF user manual" : "Coming soon. We'll email you when it's ready."}</p>
              </div>
              {ready && (
                <div className="flex gap-2">
                  <a href={q(slug, "managed")} className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-tile-blue">Managed solution</a>
                  <a href={q(slug, "manual")} className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink">User manual (PDF)</a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-ink-soft">Install steps are in each user manual. Need help? <Link href="/custom" className="text-tile-blue hover:underline">Contact us</Link>.</p>
    </div>
  );
}

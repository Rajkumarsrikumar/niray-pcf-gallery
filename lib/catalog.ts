import components from "@/data/components.json";
import packs from "@/data/packs.json";
import type { Screen } from "./shared";
export * from "./shared";

export type Component = (typeof components)[number];
export type Pack = (typeof packs)[number];

export const allComponents = components as Component[];
export const allPacks = packs as Pack[];
export const industries = Array.from(new Set(components.map((c) => c.industry))).sort((a, b) =>
  a === "Cross-industry" ? -1 : b === "Cross-industry" ? 1 : a.localeCompare(b),
);
export const categories = Array.from(new Set(components.map((c) => c.category ?? "Other"))).sort();
export const getComponent = (slug: string) => allComponents.find((c) => c.slug === slug);
export const getPack = (slug: string) => allPacks.find((p) => p.slug === slug);
export const packComponents = (p: Pack) =>
  p.components.map((i) => allComponents.find((c) => c.slug === i.slug)).filter(Boolean) as Component[];
export const packForComponent = (c: Component) => allPacks.find((p) => p.components.some((i) => i.slug === c.slug));


import screens from "@/data/screens.json";
/** Screens for a component. `v` (a content hash from scripts/make-thumbs.py) is added to the URL so browsers fetch a replaced image instead of a cached one. */
export const screensFor = (slug: string): Screen[] =>
  ((screens as Record<string, Screen[]>)[slug] ?? []).map((s) => (s.v ? { ...s, src: `${s.src}?v=${s.v}` } : s));
export { thumbOf } from "./thumb";

/** Lead screenshots from a pack's components (one per component, desktop shots first), for pack cards and pages. */
export type PackPreview = Screen & { slug: string; name: string };
export const packPreviews = (p: Pack, n = Infinity): PackPreview[] => {
  const leads = p.components.flatMap((i) => {
    const s = screensFor(i.slug)[0];
    const c = allComponents.find((x) => x.slug === i.slug);
    return s && c ? [{ ...s, slug: c.slug, name: c.name }] : [];
  });
  return [...leads.filter((s) => !s.mobile), ...leads.filter((s) => s.mobile)].slice(0, n);
};

/** The few fields a product card needs, plus its lead screenshot, so client pages don't bundle the whole catalogue. */
export type CardItem = Pick<Component, "slug" | "name" | "industry" | "tagline" | "availability" | "category" | "tags"> & { shot?: Screen };
export const cardItem = (c: Component): CardItem => {
  const shots = screensFor(c.slug);
  // Prefer a desktop shot; components with only a phone shot show it centred instead of the placeholder art.
  const shot = shots.find((s) => !s.mobile) ?? shots[0];
  return { slug: c.slug, name: c.name, industry: c.industry, tagline: c.tagline, availability: c.availability, category: c.category, tags: c.tags, ...(shot ? { shot } : {}) };
};

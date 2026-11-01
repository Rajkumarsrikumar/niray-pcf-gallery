import components from "@/data/components.json";
import packs from "@/data/packs.json";

export type Component = (typeof components)[number];
export type Pack = (typeof packs)[number];

export const allComponents: Component[] = components;
export const allPacks: Pack[] = packs;
export const industries = Array.from(new Set(components.map((c) => c.industry))).sort();
export const getComponent = (slug: string) => components.find((c) => c.slug === slug);
export const getPack = (slug: string) => packs.find((p) => p.slug === slug);
export const packComponents = (p: Pack) => components.filter((c) => p.components.includes(c.name));

import components from "@/data/components.json";
import packs from "@/data/packs.json";

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
export const isAvailable = (c: Component) => c.availability === "Available";
export const industrySlug = (i: string) => i.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");

export type Theme = { color: string; on: string; soft: string; icon: string; blurb: string };
// Flat colours taken from the four logo tiles (plus one), one per industry.
export const theme: Record<string, Theme> = {
  "Cross-industry": { color: "#1D6FE0", on: "#FFFFFF", soft: "#E6EFFC", icon: "grid", blurb: "Grids, navigation, scheduling and maps for any business app." },
  "Healthcare & Life Sciences": { color: "#1F9D62", on: "#FFFFFF", soft: "#E3F4EB", icon: "heart", blurb: "Patient access, clinical documentation and care coordination." },
  "Government & Public Sector": { color: "#7A2E83", on: "#FFFFFF", soft: "#F2E7F3", icon: "landmark", blurb: "Citizen portals, permits, grants, benefits and case work." },
  "Financial Services & Insurance": { color: "#0F6E78", on: "#FFFFFF", soft: "#E1F0F1", icon: "bank", blurb: "Banking, lending, wealth, claims and policy servicing." },
  Education: { color: "#F4B400", on: "#102A43", soft: "#FDF3D4", icon: "cap", blurb: "Admissions, student records, fees and timetables." },
};
export const themeFor = (industry: string) => theme[industry] ?? theme["Cross-industry"];

export const HEALTH_NOTICE = "UI/documentation aid – not a medical device; validate clinically before use.";
export const CONTACT = "info@nirayitsolutions.com";

import screens from "@/data/screens.json";
export type Screen = { src: string; w: number; h: number; caption: string; mobile: boolean };
export const screensFor = (slug: string): Screen[] => (screens as Record<string, Screen[]>)[slug] ?? [];

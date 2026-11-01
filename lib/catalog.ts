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

export const theme: Record<string, { from: string; to: string; accent: string; icon: string; blurb: string }> = {
  "Cross-industry": { from: "#003B5C", to: "#007B7F", accent: "#8DC63F", icon: "grid", blurb: "Grids, navigation, scheduling, maps and more for any app." },
  "Healthcare & Life Sciences": { from: "#0E5E6F", to: "#3FA796", accent: "#C9F2E7", icon: "heart", blurb: "Patient access, clinical documentation and care coordination." },
  "Government & Public Sector": { from: "#1F3A68", to: "#4C6FB5", accent: "#FFD166", icon: "landmark", blurb: "Citizen portals, permits, grants, benefits and case work." },
  "Financial Services & Insurance": { from: "#2C2A6B", to: "#6A4FB3", accent: "#F2C14E", icon: "bank", blurb: "Banking, lending, wealth, claims and policy servicing." },
  Education: { from: "#7A3B12", to: "#D9822B", accent: "#FFE3B3", icon: "cap", blurb: "Admissions, student records, fees and learning portals." },
};
export const themeFor = (industry: string) => theme[industry] ?? theme["Cross-industry"];

export const HEALTH_NOTICE = "UI/documentation aid – not a medical device; validate clinically before use.";
export const CONTACT = "info@nirayitsolutions.com";

import screens from "@/data/screens.json";
export type Screen = { src: string; w: number; h: number; caption: string; mobile: boolean };
export const screensFor = (slug: string): Screen[] => (screens as Record<string, Screen[]>)[slug] ?? [];

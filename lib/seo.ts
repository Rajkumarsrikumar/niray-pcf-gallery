import type { Component, Pack } from "./catalog";

// Search phrases people use when looking for Power Apps code components.
export const CORE_KEYWORDS = [
  "PCF control", "PCF component", "Power Apps component framework", "Power Apps code component",
  "Power Apps custom control", "Canvas app component", "Model-driven app control", "Power Pages component",
  "Dataverse control", "Power Platform component", "Dynamics 365 custom control",
];

const words = (s: string) => s.replace(/-/g, " ").trim();
const uniq = (xs: (string | null | undefined)[]) => Array.from(new Map(xs.filter(Boolean).map((x) => [x!.toLowerCase(), x!])).values());
const short = (industry: string) => industry.split(" & ")[0];

export function componentKeywords(c: Component): string[] {
  return uniq([
    c.name, `${c.name} PCF control`, `${c.name} Power Apps`, `${c.name} Power Pages`,
    ...((c.tags ?? []) as string[]).map(words),
    (c as { subCategory?: string }).subCategory, `${short(c.industry)} Power Apps`, `${short(c.industry)} PCF control`,
    ...((c as { hosts?: string[] }).hosts ?? []).map((h) => `${h} control`),
    "PCF control", "Power Apps code component", "Power Apps component framework",
  ]);
}

export function packKeywords(p: Pack): string[] {
  const s = short(p.industry);
  return uniq([
    p.name, `${s} Power Apps components`, `${s} PCF controls`, `${s} Power Pages components`, `${p.industry} Power Platform`,
    `${s} Dataverse app`, `${s} Model-driven app`, ...CORE_KEYWORDS.slice(0, 5),
  ]);
}

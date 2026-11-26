// Constants and helpers that client components can import without bundling the component catalogue.
export const isAvailable = (c: { availability?: string | null }) => c.availability === "Available";
export const industrySlug = (i: string) => i.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
export type Screen = { src: string; w: number; h: number; caption: string; mobile: boolean; v?: string };

export type Theme = { color: string; on: string; soft: string; icon: string; blurb: string };
// Flat colours taken from the four logo tiles (plus one), one per industry.
export const theme: Record<string, Theme> = {
  "Cross-industry": { color: "#007B7F", on: "#FFFFFF", soft: "#E3F2F2", icon: "grid", blurb: "Grids, navigation, scheduling and maps for any business app." },
  "Healthcare & Life Sciences": { color: "#3E9A3B", on: "#FFFFFF", soft: "#E8F5E7", icon: "heart", blurb: "Patient access, clinical documentation and care coordination." },
  "Government & Public Sector": { color: "#003B5C", on: "#FFFFFF", soft: "#E3ECF1", icon: "landmark", blurb: "Citizen portals, permits, grants, benefits and case work." },
  "Financial Services & Insurance": { color: "#5B7B8C", on: "#FFFFFF", soft: "#ECF1F4", icon: "bank", blurb: "Banking, lending, wealth, claims and policy servicing." },
  Education: { color: "#8DC63F", on: "#003B5C", soft: "#F1F8E6", icon: "cap", blurb: "Admissions, student records, fees and timetables." },
  Manufacturing: { color: "#C46A1B", on: "#FFFFFF", soft: "#FBF0E6", icon: "factory", blurb: "OEE, quality, shop-floor execution, traceability and maintenance." },
  "Real Estate & Facilities": { color: "#6B4C9A", on: "#FFFFFF", soft: "#F0EBF6", icon: "box", blurb: "Property leasing, rent rolls, maintenance and facilities operations." },
  "Media & Entertainment": { color: "#B23A48", on: "#FFFFFF", soft: "#F8E8EA", icon: "layers", blurb: "Production scheduling, rights, royalties and content operations." },
  Nonprofit: { color: "#C0577A", on: "#FFFFFF", soft: "#F9EAF0", icon: "heart", blurb: "Donors, grants, volunteers, programmes and impact reporting." },
  "Retail & Hospitality": { color: "#D9822B", on: "#FFFFFF", soft: "#FBF1E6", icon: "cart", blurb: "Store operations, stock, guest service and loyalty." },
  "Logistics & Transport": { color: "#2F6F9F", on: "#FFFFFF", soft: "#E6EFF6", icon: "arrow", blurb: "Dispatch, fleet, yard, warehouse and proof of delivery." },
  "Energy & Utilities": { color: "#E0A100", on: "#003B5C", soft: "#FCF5E0", icon: "bolt", blurb: "Outages, metering, field crews and asset maintenance." },
  "Professional Services": { color: "#4A5A8C", on: "#FFFFFF", soft: "#ECEEF5", icon: "doc", blurb: "Engagements, timesheets, resourcing and client billing." },
  Agriculture: { color: "#5E8C31", on: "#FFFFFF", soft: "#EEF4E6", icon: "grid", blurb: "Crops, livestock, harvest, traceability and farm compliance." },
  Telecommunications: { color: "#0E7C9B", on: "#FFFFFF", soft: "#E3F1F5", icon: "phone", blurb: "Orders, fibre builds, network tickets and subscriber care." },
  "Construction & Engineering": { color: "#B5651D", on: "#FFFFFF", soft: "#F7EDE4", icon: "factory", blurb: "Site diaries, RFIs, variations, safety and project controls." },
  Legal: { color: "#3B3F58", on: "#FFFFFF", soft: "#EBEBEF", icon: "landmark", blurb: "Matters, intake, deadlines, billing and conflict checks." },
  "Mining & Natural Resources": { color: "#8A6D3B", on: "#FFFFFF", soft: "#F3EEE5", icon: "box", blurb: "Shift reporting, haulage, maintenance and site safety." },
  Automotive: { color: "#A23B2A", on: "#FFFFFF", soft: "#F6E9E6", icon: "bolt", blurb: "Dealer sales, service lanes, parts and vehicle stock." },
  "Hospitality & Travel": { color: "#1E8C7E", on: "#FFFFFF", soft: "#E4F3F1", icon: "search", blurb: "Front desk, revenue, tours, airlines and travel desks." },
  Pharmaceuticals: { color: "#5A6FB5", on: "#FFFFFF", soft: "#ECEFF8", icon: "shield", blurb: "GMP quality, clinical trials, regulatory and medical affairs." },
  "Sports & Fitness": { color: "#2E9E5B", on: "#FFFFFF", soft: "#E5F4EB", icon: "check", blurb: "Clubs, squads, athletes, gyms and match-day operations." },
  "Oil & Gas": { color: "#40464F", on: "#FFFFFF", soft: "#ECEDEE", icon: "layers", blurb: "Wells, drilling, production, pipelines and process safety." },
};
export const themeFor = (industry: string) => theme[industry] ?? theme["Cross-industry"];

export const HEALTH_NOTICE = "UI/documentation aid – not a medical device; validate clinically before use.";
export const CONTACT = "info@nirayitsolutions.com";

/** Licence prices in Singapore dollars (set by Niray, Nov 2026). */
export const PRICE = { component: 15, pack: 250 } as const;
export const formatPrice = (sgd: number) => `S$${sgd}`;
export const priceOf = (kind: "component" | "pack") => (kind === "pack" ? PRICE.pack : PRICE.component);

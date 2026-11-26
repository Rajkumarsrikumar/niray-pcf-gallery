import Shop, { type ShopItem } from "./Shop";
import { allComponents, cardItem, categories, industries } from "@/lib/catalog";

export const metadata = { keywords: ["PCF controls", "Power Apps components", "PCF component library", "Power Apps code components", "Power Pages components", "Model-driven app controls", "Canvas app components", "PCF gallery"], title: "All Power Apps PCF controls & code components | Niray PCF Gallery", description: "Browse every Niray Power Apps Component Framework (PCF) control for Canvas apps, Model-driven apps and Power Pages, with screenshots and specs.", alternates: { canonical: "/components" } };

export default function ShopPage() {
  const items: ShopItem[] = allComponents.map((c) => ({
    ...cardItem(c),
    dateBuilt: c.dateBuilt,
    // Lower-cased text the search box matches against (description trimmed to keep the page light).
    search: `${c.name} ${c.tagline} ${(c.description ?? "").slice(0, 240)} ${c.tags.join(" ")}`.toLowerCase(),
  }));
  return <Shop items={items} industries={industries} categories={categories} />;
}

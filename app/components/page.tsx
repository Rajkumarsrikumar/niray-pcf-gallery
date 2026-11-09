import { Suspense } from "react";
import Shop from "./Shop";

export const metadata = { keywords: ["PCF controls", "Power Apps components", "PCF component library", "Power Apps code components", "Power Pages components", "Model-driven app controls", "Canvas app components", "PCF gallery"], title: "All Power Apps PCF controls & code components | Niray PCF Gallery", description: "Browse every Niray Power Apps Component Framework (PCF) control for Canvas apps, Model-driven apps and Power Pages, with screenshots and specs.", alternates: { canonical: "/components" } };

export default function ShopPage() {
  return <Suspense><Shop /></Suspense>;
}

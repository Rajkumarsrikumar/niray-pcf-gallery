import { Suspense } from "react";
import Shop from "./Shop";

export const metadata = { title: "Shop all PCF components | Niray PCF Gallery", description: "Browse every Niray Power Apps Component Framework (PCF) control for Canvas apps, Model-driven apps and Power Pages, with screenshots and specs.", alternates: { canonical: "/components" } };

export default function ShopPage() {
  return <Suspense><Shop /></Suspense>;
}

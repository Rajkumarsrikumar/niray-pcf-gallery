import { Suspense } from "react";
import Shop from "./Shop";

export const metadata = { title: "Shop all PCF components | Niray PCF Gallery" };

export default function ShopPage() {
  return <Suspense><Shop /></Suspense>;
}

# Niray PCF Library – website guide

This pack has the data for a website that lists all **177** Niray PCF components. It covers 4 industry packs and the cross-industry library.

| Industry | Available | Coming soon | Total |
|---|---|---|---|
| Cross-industry (generic) | 78 | 0 | 78 |
| Healthcare & Life Sciences | 20 | 9 | 29 |
| Government & Public Sector | 25 | 5 | 30 |
| Financial Services & Insurance | 2 | 28 | 30 |
| Education (pack in progress) | 0 | 10 | 10 |
| **Total** | **125** | **52** | **177** |

**Available** means the component is in the Niray IT Solutions solution. **Coming soon** means it is built and tested but not yet added to the solution (library status `pending-sync`).

## Files

| File | Use |
|---|---|
| `components.json` | All components in one array. Import this into your CMS or feed it to a static site generator. |
| `components/<slug>.json` | One file per component, for the component detail pages. |
| `components.csv` | The same data for WordPress/WooCommerce, Shopify, Webflow or HubSpot CSV import. List fields are separated by ` \| `. |
| `packs.json` | The industry packs and their components in sales order. |
| `Niray-PCF-Website-Catalogue.xlsx` | Workbook for review and editing: Components, Packs, Summary (live counts) and Fields. |

## Suggested site structure

1. **Home**: what PCF components are, the three hosts (Canvas, Model-driven, Power Pages), headline counts and the industry packs.
2. **All components** (`/components`): a card grid with search and filters for industry, category, host and availability. Each card shows the name, tagline, host badges and an Available or Coming soon badge.
3. **Component page** (`/components/<slug>`):
   - Name, tagline and description.
   - Feature bullets.
   - Screenshot gallery.
   - Host badges and mobile badge.
   - Spec table: `schemaName`, `componentVersion`, `solutionVersion`, `controlType`, `react`.
   - Install summary (see below).
   - A user-manual download, then a Buy or Contact button.
4. **Industry pack pages** (`/packs/<slug>`): the pack intro, then the components in `packOrder` grouped by `subCategory`, and the pack price.
5. **Industry pages** (`/industries/<industry>`): a filtered view of `components.json`.
6. **How to install**: an import guide that applies to every component (below).

## Install text (same for every component)

- **Which package:** import the unmanaged solution in development and the managed solution in test and production.
- **Canvas apps:**
  1. Turn on "Allow publishing of canvas apps with code components".
  2. Import the solution.
  3. Go to Insert → Get more components → Code.
- **Model-driven apps:** in the form designer, select the field, then Components → + Component.
- **Power Pages:** either enable the code component on a form field in design studio, or place it with Liquid:

  ```liquid
  {% codecomponent name:<schemaName> ... /%}
  ```

- React 16.14.0 is bundled in every component, which is why they also work in Power Pages.

## Fill in before you publish

1. **Prices.** `price` is empty on purpose. Add a price or "Contact us" for each component and each pack.
2. **Images.** Each component's screenshots are inside its package under `docs/screenshots/` (real PNGs, with desktop shots at 1366 px). For each component:
   - Export a hero image and a mobile image.
   - Name them `<slug>-hero.png` and `<slug>-mobile.png`.
   - Write descriptive alt text.
3. **Wording.** `tagline` and `features` were generated from the technical use-case text in the catalogue. Edit them for a marketing tone.
4. **Downloads.** `solutionFiles` lists the internal zip and manual names. Serve the zips only after purchase. The user manual can be public as a PDF or gated.
5. **Healthcare components:** keep the notice "UI/documentation aid – not a medical device; validate clinically before use."
6. **Sample data:** all screenshots use fictional sample data.

## SEO

- **Title:** `<name> – Power Apps PCF component | Niray IT Solutions`
- **Meta description:** use `tagline`.
- **Keywords:** use `tags`.
- **URL:** `/components/<slug>`.
- **Structured data:** add `Product` (or `SoftwareApplication`) JSON-LD with `name`, `description`, `applicationCategory: "BusinessApplication"` and `operatingSystem: "Microsoft Power Platform"`.

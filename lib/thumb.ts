/** Small preview written by scripts/make-thumbs.py, for cards and thumbnail strips. Kept apart from catalog.ts so client components can use it without bundling the catalog. */
export const thumbOf = (src: string) => src.replace(/\.webp(\?|$)/, ".thumb.webp$1");

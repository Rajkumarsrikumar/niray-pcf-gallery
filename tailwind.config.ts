import type { Config } from "tailwindcss";
// Niray IT Solutions brand palette, one typeface (Inter) as on nirayitsolutions.com
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#003B5C", soft: "#4A6575", faint: "#7D909C" },
        paper: "#F4F7F9",
        line: "#E1E8ED",
        tile: { plum: "#003B5C", blue: "#007B7F", sun: "#8DC63F", leaf: "#4CB648", teal: "#007B7F" },
        brand: { navy: "#003B5C", blue: "#007B7F", teal: "#8DC63F", green: "#4CB648", slate: "#5B7B8C", sky: "#EAF4F4", ice: "#F4F7F9" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Config;

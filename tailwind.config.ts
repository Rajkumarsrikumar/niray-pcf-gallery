import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#102A43", soft: "#486581", faint: "#829AB1" },
        paper: "#F7F8FA",
        line: "#DCE3EC",
        tile: { plum: "#7A2E83", blue: "#1D6FE0", sun: "#F4B400", leaf: "#1F9D62", teal: "#0F6E78" },
        brand: { navy: "#102A43", blue: "#1D6FE0", teal: "#8DC63F", green: "#1F9D62", slate: "#486581", sky: "#EEF2F7", ice: "#F7F8FA" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
    },
  },
} satisfies Config;

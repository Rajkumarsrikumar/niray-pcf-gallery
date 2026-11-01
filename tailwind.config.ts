import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { navy: "#003B5C", blue: "#007B7F", teal: "#8DC63F", green: "#4CB648", slate: "#5B7B8C", sky: "#F0F2F4", ice: "#F5F6F7" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      backgroundImage: { "hero-mesh": "linear-gradient(135deg, #003B5C 0%, #00304B 40%, #002A42 100%)", "blue-teal": "linear-gradient(135deg, #007B7F 0%, #8DC63F 100%)" },
    },
  },
} satisfies Config;

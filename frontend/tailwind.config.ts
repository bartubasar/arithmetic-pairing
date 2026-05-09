import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: "#e8f7ef",
          300: "#5aab7e",
          400: "#3a8a5e",
          500: "#2d6e4a",
          600: "#24583b",
          700: "#1e4430",
          900: "#0a1f14"
        },
        ivory: {
          50: "#fdf9f0",
          100: "#f6f0de",
          300: "#e0d0a8",
          400: "#cdb98a"
        },
        gold: {
          200: "#f4d870",
          300: "#e8c040"
        },
        crimson: {
          400: "#e52d4a",
          500: "#c41c36"
        },
        "bg-base": "#0f1e15",
        "bg-surface": "#162a1e",
        "bg-elevated": "#1e3828"
      },
      fontFamily: {
        display: ["var(--font-display)", "Noto Serif", "serif"],
        tile: ["var(--font-tile)", "Noto Sans", "sans-serif"],
        ui: ["system-ui", "sans-serif"]
      },
      zIndex: {
        board: "10",
        tile: "20",
        ui: "100",
        overlay: "200",
        modal: "300",
        toast: "400"
      },
      boxShadow: {
        tile: "4px 6px 12px rgba(0,0,0,0.45)",
        modal: "0 8px 48px rgba(0,0,0,0.6)",
        "gold-300": "0 0 14px 2px rgba(232, 192, 64, 0.75)"
      },
      keyframes: {
        "tile-select": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        "score-float": {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "15%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-22px)" }
        },
        "modal-up": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "tile-select": "tile-select 220ms ease-out",
        "score-float": "score-float 850ms ease-out forwards",
        "modal-up": "modal-up 260ms cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    }
  },
  plugins: []
};

export default config;
